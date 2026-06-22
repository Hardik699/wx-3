import { Router, RequestHandler } from "express";
import { LoginLog } from "../models/LoginLog";

const router = Router();

// Get all login logs
const getLoginLogs: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = parseInt(req.query.skip as string) || 0;
    
    const logs = await LoginLog.find()
      .sort({ loginTime: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await LoginLog.countDocuments();
    
    res.json({
      success: true,
      data: logs,
      total,
      limit,
      skip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch login logs",
    });
  }
};

// Get login logs by username
const getLoginLogsByUsername: RequestHandler = async (req, res) => {
  try {
    const { username } = req.params;
    const logs = await LoginLog.find({ username }).sort({ loginTime: -1 });
    
    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch login logs",
    });
  }
};

// Get recent failed login attempts
const getFailedLogins: RequestHandler = async (req, res) => {
  try {
    const logs = await LoginLog.find({ status: "failed" })
      .sort({ loginTime: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch failed logins",
    });
  }
};

router.get("/", getLoginLogs);
router.get("/username/:username", getLoginLogsByUsername);
router.get("/failed", getFailedLogins);

export { router as loginLogsRouter };
