import mongoose, { Schema } from "mongoose";

const backupLogSchema = new Schema({
  performedBy: { type: String, required: true },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date },
  status: { type: String, enum: ["success", "failed", "in-progress"], default: "in-progress" },
  collectionsCount: { type: Number, default: 0 },
  filesCount: { type: Number, default: 0 },
  totalDocs: { type: Number, default: 0 },
  errorMessage: { type: String },
}, { timestamps: true });

export const BackupLog = mongoose.model("BackupLog", backupLogSchema);
