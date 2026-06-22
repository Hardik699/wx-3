import mongoose from "mongoose";
import { createTicketFromEmail } from "../services/ticketService";
import HelpdeskSettings from "../models/HelpdeskSettings";
import "dotenv/config";

async function createTestTicket() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Check settings
    const settings = await HelpdeskSettings.findOne();
    if (!settings) {
      throw new Error("Helpdesk settings not found. Run init-helpdesk.ts first.");
    }

    console.log("📧 Creating test ticket...\n");

    // Create test ticket
    const result = await createTicketFromEmail(
      "test@example.com",
      "Test Ticket - Manual Creation",
      "This is a test ticket created manually to verify the system is working.",
      "test-message-id-" + Date.now()
    );

    if (result.success) {
      console.log("✅ Test ticket created successfully!\n");
      console.log("📋 Ticket Details:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`Ticket ID: ${result.ticket.ticketId}`);
      console.log(`Subject: ${result.ticket.subject}`);
      console.log(`User Email: ${result.ticket.userEmail}`);
      console.log(`Status: ${result.ticket.status}`);
      console.log(`Priority: ${result.ticket.priority}`);
      console.log(`Created: ${new Date(result.ticket.createdAt).toLocaleString()}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      console.log("✅ Check dashboard: http://localhost:8080/helpdesk");
      console.log("✅ Ticket should be visible now!\n");
    } else {
      console.error("❌ Failed to create ticket:", result.error);
    }

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createTestTicket();
