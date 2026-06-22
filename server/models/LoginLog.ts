import mongoose, { Schema, Document } from "mongoose";

export interface ILoginLog extends Document {
  username: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  loginTime: Date;
  status: "success" | "failed";
  failureReason?: string;
}

const loginLogSchema = new Schema<ILoginLog>(
  {
    username: { type: String, required: true },
    userId: { type: String },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    loginTime: { type: Date, default: Date.now },
    status: { type: String, enum: ["success", "failed"], required: true },
    failureReason: { type: String },
  },
  { timestamps: true }
);

// Index for faster queries
loginLogSchema.index({ loginTime: -1 });
loginLogSchema.index({ username: 1 });

export const LoginLog =
  mongoose.models.LoginLog ||
  mongoose.model<ILoginLog>("LoginLog", loginLogSchema);
