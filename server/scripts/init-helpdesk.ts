import mongoose from "mongoose";
import HelpdeskSettings from "../models/HelpdeskSettings";
import "dotenv/config";

async function initializeHelpdeskSettings() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if settings already exist
    let settings = await HelpdeskSettings.findOne();

    if (settings) {
      console.log("⚠️ Helpdesk settings already exist. Updating...");
      
      // Update existing settings
      settings.emailConfig = {
        imapHost: "mail.wyzentiqa.com",
        imapPort: 993,
        imapUser: "itsupport@wyzentiqa.com",
        imapPassword: "Wyzentiqa#404@",
        smtpHost: "mail.wyzentiqa.com",
        smtpPort: 465,
        smtpUser: "itsupport@wyzentiqa.com",
        smtpPassword: "Wyzentiqa#404@",
        adminEmail: "hardikmachhi699@gmail.com",
      };
      settings.autoReplyEnabled = true;
      settings.adminNotificationEnabled = true;
      settings.ticketPrefix = "TKT";
      settings.isActive = true;
      
      await settings.save();
      console.log("✅ Helpdesk settings updated successfully!");
    } else {
      console.log("Creating new helpdesk settings...");
      
      // Create new settings
      settings = await HelpdeskSettings.create({
        emailConfig: {
          imapHost: "mail.wyzentiqa.com",
          imapPort: 993,
          imapUser: "itsupport@wyzentiqa.com",
          imapPassword: "Wyzentiqa#404@",
          smtpHost: "mail.wyzentiqa.com",
          smtpPort: 465,
          smtpUser: "itsupport@wyzentiqa.com",
          smtpPassword: "Wyzentiqa#404@",
          adminEmail: "hardikmachhi699@gmail.com",
        },
        autoReplyEnabled: true,
        autoReplyTemplate: `Thank you for contacting WyzentiQa Xcellencce IT Helpdesk.

Your ticket has been created successfully.

Ticket ID: {{ticketId}}
Subject: {{subject}}
Status: {{status}}

We will respond to your request as soon as possible.

Best regards,
WyzentiQa Xcellencce IT Support Team`,
        adminNotificationEnabled: true,
        ticketPrefix: "TKT",
        lastTicketNumber: 0,
        isActive: true,
      });
      
      console.log("✅ Helpdesk settings created successfully!");
    }

    console.log("\n📧 Email Configuration:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`IMAP Host: ${settings.emailConfig.imapHost}`);
    console.log(`IMAP Port: ${settings.emailConfig.imapPort}`);
    console.log(`IMAP Email: ${settings.emailConfig.imapUser}`);
    console.log(`SMTP Host: ${settings.emailConfig.smtpHost}`);
    console.log(`SMTP Port: ${settings.emailConfig.smtpPort}`);
    console.log(`SMTP Email: ${settings.emailConfig.smtpUser}`);
    console.log(`Admin Email: ${settings.emailConfig.adminEmail}`);
    console.log(`Auto-Reply: ${settings.autoReplyEnabled ? "✅ Enabled" : "❌ Disabled"}`);
    console.log(`Admin Notifications: ${settings.adminNotificationEnabled ? "✅ Enabled" : "❌ Disabled"}`);
    console.log(`Email Monitoring: ${settings.isActive ? "✅ Active" : "❌ Inactive"}`);
    console.log(`Ticket Prefix: ${settings.ticketPrefix}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("✅ Helpdesk is ready to use!");
    console.log("\n📝 Next Steps:");
    console.log("1. Restart your server: pnpm dev");
    console.log("2. Go to: http://localhost:8080/helpdesk");
    console.log("3. Send test email to: itsupport@wyzentiqa.com");
    console.log("4. Wait 30 seconds and check dashboard\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing helpdesk settings:", error);
    process.exit(1);
  }
}

// Run the initialization
initializeHelpdeskSettings();

