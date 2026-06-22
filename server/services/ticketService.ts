import Ticket from "../models/Ticket";
import HelpdeskSettings from "../models/HelpdeskSettings";
import { sendAutoReply, sendAdminNotification } from "./emailService";

// Generate unique ticket ID
export async function generateTicketId(): Promise<string> {
  const settings = await HelpdeskSettings.findOne();
  if (!settings) {
    throw new Error("Helpdesk settings not found");
  }

  const nextNumber = settings.lastTicketNumber + 1;
  await HelpdeskSettings.updateOne({}, { lastTicketNumber: nextNumber });

  const prefix = settings.ticketPrefix || "TKT";
  const paddedNumber = String(nextNumber).padStart(6, "0");
  return `${prefix}-${paddedNumber}`;
}

// Create ticket from email
export async function createTicketFromEmail(
  userEmail: string,
  subject: string,
  description: string,
  messageId: string
) {
  try {
    const ticketId = await generateTicketId();

    // Extract user name from email
    const userName = userEmail.split("@")[0].replace(/[._-]/g, " ");

    const ticket = await Ticket.create({
      ticketId,
      subject,
      description,
      userEmail,
      userName,
      status: "open",
      priority: "medium",
      emailMessageId: messageId,
    });

    // Send auto-reply to user
    await sendAutoReply(userEmail, ticketId, subject, "open");

    // Send notification to admin
    await sendAdminNotification(ticketId, subject, userEmail, description);

    return { success: true, ticket };
  } catch (error) {
    console.error("Error creating ticket from email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get all tickets with filters
export async function getTickets(filters: {
  status?: string;
  priority?: string;
  search?: string;
}) {
  try {
    const query: any = {};

    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters.priority && filters.priority !== "all") {
      query.priority = filters.priority;
    }

    if (filters.search) {
      query.$or = [
        { ticketId: { $regex: filters.search, $options: "i" } },
        { subject: { $regex: filters.search, $options: "i" } },
        { userEmail: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    return { success: true, tickets };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get ticket statistics
export async function getTicketStats() {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: "open" });
    const pending = await Ticket.countDocuments({ status: "pending" });
    const inProgress = await Ticket.countDocuments({ status: "in_progress" });
    const closed = await Ticket.countDocuments({ status: "closed" });

    const highPriority = await Ticket.countDocuments({ priority: "high" });
    const urgentPriority = await Ticket.countDocuments({ priority: "urgent" });

    return {
      success: true,
      stats: {
        total,
        open,
        pending,
        inProgress,
        closed,
        highPriority,
        urgentPriority,
      },
    };
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update ticket status
export async function updateTicketStatus(ticketId: string, status: string) {
  try {
    const ticket = await Ticket.findOneAndUpdate(
      { ticketId },
      { status, lastUpdated: new Date() },
      { new: true }
    );

    if (!ticket) {
      return { success: false, error: "Ticket not found" };
    }

    return { success: true, ticket };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Add reply to ticket
export async function addReplyToTicket(
  ticketId: string,
  from: string,
  message: string,
  isAdmin: boolean
) {
  try {
    const ticket = await Ticket.findOneAndUpdate(
      { ticketId },
      {
        $push: {
          replies: {
            from,
            message,
            timestamp: new Date(),
            isAdmin,
          },
        },
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!ticket) {
      return { success: false, error: "Ticket not found" };
    }

    return { success: true, ticket };
  } catch (error) {
    console.error("Error adding reply to ticket:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
