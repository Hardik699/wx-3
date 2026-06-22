import { Router, RequestHandler } from "express";
import mongoose from "mongoose";
import { createClient } from "@supabase/supabase-js";
import { BackupLog } from "../models/BackupLog";

const router = Router();

const BACKUP_URI = "mongodb+srv://Hardik:Hardik3758@cluster0.tdwjqmk.mongodb.net/?appName=Cluster0";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";
const SUPABASE_BUCKET = process.env.VITE_SUPABASE_BUCKET || "Infoseum";

const FILE_FIELDS = [
  "photo", "aadhaarCard", "panCard", "passport", "drivingLicense",
  "resume", "medicalCertificate", "educationCertificate",
  "experienceLetter", "bankPassbook", "resignationLetter",
];

// GET backup logs
const getBackupLogs: RequestHandler = async (_req, res) => {
  try {
    const logs = await BackupLog.find().sort({ startedAt: -1 }).limit(20);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch logs" });
  }
};

// POST run backup
const backupDB: RequestHandler = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  // Get user from header or body
  const performedBy = (req.headers["x-user"] as string) || req.body?.user || "Unknown";

  // Create log entry
  const logEntry = await BackupLog.create({
    performedBy,
    startedAt: new Date(),
    status: "in-progress",
  });

  let backupConn: mongoose.Connection | null = null;
  let totalDocs = 0;
  let totalFiles = 0;
  let totalCols = 0;

  try {
    send({ type: "status", message: "Connecting to backup database...", percent: 0 });

    backupConn = mongoose.createConnection(BACKUP_URI);
    await new Promise<void>((resolve, reject) => {
      backupConn!.once("open", resolve);
      backupConn!.once("error", reject);
    });

    send({ type: "status", message: "Connected to backup database.", percent: 3 });

    const sourceDB = mongoose.connection.db;
    if (!sourceDB) throw new Error("Source DB not connected");

    // ── Step 1: MongoDB collections ──────────────────────────────────────────
    const collections = await sourceDB.listCollections().toArray();
    totalCols = collections.length;
    let doneCols = 0;

    for (const col of collections) {
      const colName = col.name;
      send({
        type: "progress",
        message: `MongoDB: backing up "${colName}"...`,
        percent: Math.round(3 + (doneCols / totalCols) * 55),
        done: doneCols, total: totalCols, stage: "mongodb",
      });

      try {
        const docs = await sourceDB.collection(colName).find({}).toArray();
        const backupColl = backupConn.db!.collection(colName);
        await backupColl.deleteMany({});
        if (docs.length > 0) await backupColl.insertMany(docs);
        totalDocs += docs.length;
      } catch {
        send({ type: "warning", message: `Warning: "${colName}" failed`, percent: Math.round(3 + (doneCols / totalCols) * 55), stage: "mongodb" });
      }

      doneCols++;
      send({
        type: "progress",
        message: `✓ MongoDB "${colName}" done`,
        percent: Math.round(3 + (doneCols / totalCols) * 55),
        done: doneCols, total: totalCols, stage: "mongodb",
      });
    }

    send({ type: "status", message: "MongoDB backup complete. Starting file backup...", percent: 58, stage: "files" });

    // ── Step 2: Supabase files ────────────────────────────────────────────────
    if (SUPABASE_URL && SUPABASE_KEY) {
      const employees = await sourceDB.collection("employees").find({}).toArray();
      const fileUrls: { employeeId: string; field: string; url: string }[] = [];

      for (const emp of employees) {
        for (const field of FILE_FIELDS) {
          const url = emp[field];
          if (url && typeof url === "string" && url.startsWith("http")) {
            fileUrls.push({ employeeId: emp.employeeId || String(emp._id), field, url });
          }
        }
      }

      const settings = await sourceDB.collection("settings").find({}).toArray();
      for (const s of settings) {
        if (s.value && typeof s.value === "string" && s.value.startsWith("http")) {
          fileUrls.push({ employeeId: "settings", field: s.key, url: s.value });
        }
      }

      const totalFileCount = fileUrls.length;
      let doneFiles = 0;

      send({ type: "status", message: `Found ${totalFileCount} files to backup...`, percent: 60, stage: "files" });

      const fileBackupColl = backupConn.db!.collection("file_backups");
      await fileBackupColl.deleteMany({});

      for (const fileInfo of fileUrls) {
        const pct = Math.round(60 + (doneFiles / Math.max(totalFileCount, 1)) * 38);
        send({
          type: "progress",
          message: `File: ${fileInfo.field} (${fileInfo.employeeId})`,
          percent: pct, done: doneFiles, total: totalFileCount, stage: "files",
        });

        try {
          const response = await fetch(fileInfo.url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          const contentType = response.headers.get("content-type") || "application/octet-stream";

          await fileBackupColl.insertOne({
            employeeId: fileInfo.employeeId,
            field: fileInfo.field,
            originalUrl: fileInfo.url,
            contentType,
            base64Data: base64,
            backedUpAt: new Date(),
          });
          totalFiles++;
        } catch {
          send({ type: "warning", message: `Skipped: ${fileInfo.field} (${fileInfo.employeeId})`, percent: pct, stage: "files" });
        }

        doneFiles++;
      }
    } else {
      send({ type: "warning", message: "Supabase not configured — skipping file backup.", percent: 95, stage: "files" });
    }

    await backupConn.close();

    // Update log — success
    await BackupLog.findByIdAndUpdate(logEntry._id, {
      status: "success",
      completedAt: new Date(),
      collectionsCount: totalCols,
      filesCount: totalFiles,
      totalDocs,
    });

    send({
      type: "done",
      message: `Full backup complete! ${totalDocs} docs across ${totalCols} collections + ${totalFiles} files.`,
      percent: 100,
    });

  } catch (error) {
    if (backupConn) await backupConn.close().catch(() => {});

    await BackupLog.findByIdAndUpdate(logEntry._id, {
      status: "failed",
      completedAt: new Date(),
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    send({
      type: "error",
      message: error instanceof Error ? error.message : "Backup failed",
      percent: 0,
    });
  } finally {
    res.end();
  }
};

router.get("/logs", getBackupLogs);
router.post("/", backupDB);
export { router as dbBackupRouter };
