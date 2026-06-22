import { RequestHandler } from "express";
import {
  startEmailMonitoring,
  stopEmailMonitoring,
  getMonitoringStatus,
} from "../services/imapMonitor";

// Start email monitoring
export const startMonitoring: RequestHandler = async (req, res) => {
  try {
    const result = await startEmailMonitoring();
    res.json(result);
  } catch (error) {
    console.error("Error starting monitoring:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Stop email monitoring
export const stopMonitoring: RequestHandler = async (req, res) => {
  try {
    const result = stopEmailMonitoring();
    res.json(result);
  } catch (error) {
    console.error("Error stopping monitoring:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get monitoring status
export const getStatus: RequestHandler = async (req, res) => {
  try {
    const status = getMonitoringStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    console.error("Error getting status:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
