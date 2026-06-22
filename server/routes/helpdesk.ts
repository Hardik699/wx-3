import { RequestHandler } from "express";
import Ticket from "../models/Ticket";
import HelpdeskSettings from "../models/HelpdeskSettings";
import {
  generateTicketId,
  getTickets,
  getTicketStats,
  updateTicketStatus,
  addReplyToTicket,
} from "../services/ticketService";
import { sendReplyEmail } from "../services/emailService";

// Get all tickets
export const getAllTickets: RequestHandler = async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    const result = await getTickets({
      status: status as string,
      priority: priority as string,
      search: search as string,
    });

    if (result.success) {
      res.json({ success: true, data: result.tickets });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get ticket by ID
export const getTicketById: RequestHandler = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create new ticket manually
export const createTicket: RequestHandler = async (req, res) => {
  try {
    const { subject, description, userEmail, userName, priority, category } = req.body;

    if (!subject || !description || !userEmail) {
      return res.status(400).json({
        success: false,
        error: "Subject, description, and user email are required",
      });
    }

    const ticketId = await generateTicketId();

    const ticket = await Ticket.create({
      ticketId,
      subject,
      description,
      userEmail,
      userName: userName || userEmail.split("@")[0],
      priority: priority || "medium",
      category: category || "other",
      status: "open",
    });

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update ticket status
export const updateStatus: RequestHandler = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required" });
    }

    const result = await updateTicketStatus(ticketId, status);

    if (result.success) {
      res.json({ success: true, data: result.ticket });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update ticket priority
export const updatePriority: RequestHandler = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({ success: false, error: "Priority is required" });
    }

    const ticket = await Ticket.findOneAndUpdate(
      { ticketId },
      { priority, lastUpdated: new Date() },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error updating ticket priority:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Add reply to ticket
export const addReply: RequestHandler = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, from, isAdmin } = req.body;

    if (!message || !from) {
      return res.status(400).json({
        success: false,
        error: "Message and from fields are required",
      });
    }

    const result = await addReplyToTicket(ticketId, from, message, isAdmin || false);

    if (result.success) {
      // Send email to user if reply is from admin
      if (isAdmin && result.ticket) {
        const ticket = result.ticket;
        await sendReplyEmail(
          ticket.userEmail,
          ticket.ticketId,
          ticket.subject,
          message,
          from
        );
      }

      res.json({ success: true, data: result.ticket });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get ticket statistics
export const getStats: RequestHandler = async (req, res) => {
  try {
    const result = await getTicketStats();

    if (result.success) {
      res.json({ success: true, data: result.stats });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete ticket
export const deleteTicket: RequestHandler = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findOneAndDelete({ ticketId });

    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get helpdesk settings
export const getSettings: RequestHandler = async (req, res) => {
  try {
    let settings = await HelpdeskSettings.findOne();

    if (!settings) {
      // Create default settings
      settings = await HelpdeskSettings.create({});
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update helpdesk settings
export const updateSettings: RequestHandler = async (req, res) => {
  try {
    const updates = req.body;

    let settings = await HelpdeskSettings.findOne();

    if (!settings) {
      settings = await HelpdeskSettings.create(updates);
    } else {
      settings = await HelpdeskSettings.findOneAndUpdate({}, updates, { new: true });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Test email configuration
export const testEmailConfig: RequestHandler = async (req, res) => {
  try {
    const { sendEmail } = await import("../services/emailService");
    const settings = await HelpdeskSettings.findOne();

    if (!settings || !settings.emailConfig.adminEmail) {
      return res.status(400).json({
        success: false,
        error: "Email configuration not found",
      });
    }

    const result = await sendEmail(
      settings.emailConfig.adminEmail,
      "Test Email - IT Helpdesk",
      "<h1>Test Email</h1><p>Your email configuration is working correctly!</p>"
    );

    if (result.success) {
      res.json({ success: true, message: "Test email sent successfully" });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error testing email:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Clear all tickets (with password protection)
export const clearAllTickets: RequestHandler = async (req, res) => {
  try {
    const { password } = req.body;

    // Password protection
    if (password !== "123") {
      return res.status(403).json({
        success: false,
        error: "Incorrect password",
      });
    }

    // Delete all tickets
    const result = await Ticket.deleteMany({});

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} tickets successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing tickets:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
