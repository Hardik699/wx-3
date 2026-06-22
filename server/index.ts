import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { attachIdentity } from "./middleware/auth";
import { salariesRouter } from "./routes/salaries";
import {
  syncToGoogleSheets,
  getSpreadsheetInfo,
} from "./services/googleSheets";
import { connectDB, getDBStatus } from "./db";
import { employeesRouter } from "./routes/employees";
import { departmentsRouter } from "./routes/departments";
import { itAccountsRouter } from "./routes/it-accounts";
import { pcLaptopRouter } from "./routes/pc-laptop";
import { attendanceRouter } from "./routes/attendance";
import { leaveRequestsRouter } from "./routes/leave-requests";
import { salaryRecordsRouter } from "./routes/salary-records";
import { leaveRecordsRouter } from "./routes/leave-records";
import { salarySlipRecordsRouter } from "./routes/salary-slip-records";
import { salarySlipsRouter } from "./routes/salary-slips";
import { systemAssetsRouter } from "./routes/system-assets";
import { clearDataRouter } from "./routes/clear-data";
import { authRouter, seedUsers, seedSalaryRecords } from "./routes/auth";
import { encryptPDF } from "./routes/pdf-encrypt";
import { settingsRouter } from "./routes/settings";
import { dbBackupRouter } from "./routes/db-backup";
import { loginLogsRouter } from "./routes/login-logs";
import { fixITRecordsRouter } from "./routes/fix-it-records";
import * as helpdeskRoutes from "./routes/helpdesk";
import * as helpdeskMonitor from "./routes/helpdesk-monitor";
import { startEmailMonitoring } from "./services/imapMonitor";

export function createServer() {
  const app = express();

  // Initialize MongoDB connection
  connectDB()
    .then(() => {
      seedUsers();
      seedSalaryRecords();
      // Start email monitoring for helpdesk
      startEmailMonitoring().catch((error) => {
        console.log("Email monitoring not started:", error.message);
      });
    })
    .catch((error) => {
      console.error("Failed to initialize MongoDB:", error);
      // Continue running even if MongoDB fails to connect
    });

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(attachIdentity);

  // Static for uploaded files
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    const dbStatus = getDBStatus();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  });

  // Example API routes
  app.use("/api/auth", authRouter);
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Database status endpoint
  app.get("/api/db-status", (_req, res) => {
    const status = getDBStatus();
    res.json(status);
  });

  app.get("/api/demo", handleDemo);

  // PDF Encryption API
  app.post("/api/encrypt-pdf", encryptPDF);

  // Salaries API
  app.use("/api/salaries", salariesRouter());

  // Google Sheets API
  app.post("/api/google-sheets/sync", syncToGoogleSheets);
  app.get("/api/google-sheets/info", getSpreadsheetInfo);

  // Data APIs
  app.use("/api/employees", employeesRouter);
  app.use("/api/departments", departmentsRouter);
  app.use("/api/it-accounts", itAccountsRouter);
  app.use("/api/pc-laptop", pcLaptopRouter);
  app.use("/api/attendance", attendanceRouter);
  app.use("/api/leave-requests", leaveRequestsRouter);
  app.use("/api/salary-records", salaryRecordsRouter);
  app.use("/api/leave-records", leaveRecordsRouter);
  app.use("/api/salary-slips", salarySlipsRouter);
  app.use("/api/system-assets", systemAssetsRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/db-backup", dbBackupRouter);
  app.use("/api/login-logs", loginLogsRouter);

  // Fix IT records endpoint (one-time use)
  app.use("/api/fix-it-records", fixITRecordsRouter);

  // Helpdesk API
  app.get("/api/helpdesk/tickets", helpdeskRoutes.getAllTickets);
  app.get("/api/helpdesk/tickets/:ticketId", helpdeskRoutes.getTicketById);
  app.post("/api/helpdesk/tickets", helpdeskRoutes.createTicket);
  app.put("/api/helpdesk/tickets/:ticketId/status", helpdeskRoutes.updateStatus);
  app.put("/api/helpdesk/tickets/:ticketId/priority", helpdeskRoutes.updatePriority);
  app.post("/api/helpdesk/tickets/:ticketId/reply", helpdeskRoutes.addReply);
  app.delete("/api/helpdesk/tickets/:ticketId", helpdeskRoutes.deleteTicket);
  app.post("/api/helpdesk/clear-all-tickets", helpdeskRoutes.clearAllTickets);
  app.get("/api/helpdesk/stats", helpdeskRoutes.getStats);
  app.get("/api/helpdesk/settings", helpdeskRoutes.getSettings);
  app.put("/api/helpdesk/settings", helpdeskRoutes.updateSettings);
  app.post("/api/helpdesk/test-email", helpdeskRoutes.testEmailConfig);
  app.post("/api/helpdesk/monitor/start", helpdeskMonitor.startMonitoring);
  app.post("/api/helpdesk/monitor/stop", helpdeskMonitor.stopMonitoring);
  app.get("/api/helpdesk/monitor/status", helpdeskMonitor.getStatus);

  // Clear data API (for development/testing)
  app.use("/api/clear-data", clearDataRouter);

  return app;
}
