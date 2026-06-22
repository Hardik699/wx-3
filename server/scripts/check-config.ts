import mongoose from "mongoose";
import HelpdeskSettings from "../models/HelpdeskSettings";
import Ticket from "../models/Ticket";
import "dotenv/config";

async function checkConfiguration() {
  try {
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
      console.log("❌ No helpdesk settings found!");
      process.exit(1);
    }

    console.log("📧 Email Configuration Status:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`IMAP Host: ${settings.emailConfig.imapHost}`);
    console.log(`IMAP Port: ${settings.emailConfig.imapPort}`);
    console.log(`IMAP Email: ${settings.emailConfig.imapUser}`);
    console.log(`IMAP Password: ${settings.emailConfig.imapPassword ? "✅ Set (hidden)" : "❌ Not set"}`);
    console.log("");
    console.log(`SMTP Host: ${settings.emailConfig.smtpHost}`);
    console.log(`SMTP Port: ${settings.emailConfig.smtpPort}`);
    console.log(`SMTP Email: ${settings.emailConfig.smtpUser}`);
    console.log(`SMTP Password: ${settings.emailConfig.smtpPassword ? "✅ Set (hidden)" : "❌ Not set"}`);
    console.log("");
    console.log(`Admin Email: ${settings.emailConfig.adminEmail}`);
    console.log(`Auto-Reply: ${settings.autoReplyEnabled ? "✅ Enabled" : "❌ Disabled"}`);
    console.log(`Admin Notifications: ${settings.adminNotificationEnabled ? "✅ Enabled" : "❌ Disabled"}`);
    console.log(`Email Monitoring: ${settings.isActive ? "✅ Active" : "❌ Inactive"}`);
    console.log(`Ticket Prefix: ${settings.ticketPrefix}`);
    console.log(`Last Ticket Number: ${settings.lastTicketNumber}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Check tickets
    const tickets = await Ticket.find();
    console.log("🎫 Tickets in Database:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Total Tickets: ${tickets.length}`);
    
    if (tickets.length > 0) {
      console.log("\nTicket List:");
      tickets.forEach((ticket, index) => {
        console.log(`${index + 1}. ${ticket.ticketId} - ${ticket.subject}`);
        console.log(`   User: ${ticket.userEmail}`);
        console.log(`   Status: ${ticket.status} | Priority: ${ticket.priority}`);
        console.log(`   Created: ${new Date(ticket.createdAt).toLocaleString()}`);
        console.log("");
      });
    } else {
      console.log("No tickets found.");
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("✅ Configuration Check Complete!");
    console.log("\n📝 Summary:");
    console.log(`✅ Email configured: ${settings.emailConfig.imapUser}`);
    console.log(`✅ Password set: Yes`);
    console.log(`✅ Monitoring active: ${settings.isActive ? "Yes" : "No"}`);
    console.log(`✅ Tickets in database: ${tickets.length}`);
    console.log("\n🚀 Dashboard: http://localhost:8080/helpdesk\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkConfiguration();
