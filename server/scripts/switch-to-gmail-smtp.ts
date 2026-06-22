import mongoose from "mongoose";
import HelpdeskSettings from "../models/HelpdeskSettings";
import "dotenv/config";

async function switchToGmailSMTP() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    console.log("🔄 Switching to Gmail SMTP...\n");

    // Update settings to use Gmail SMTP
    const settings = await HelpdeskSettings.findOneAndUpdate(
      {},
      {
        $set: {
          "emailConfig.smtpHost": "smtp.gmail.com",
          "emailConfig.smtpPort": 587,
          "emailConfig.smtpUser": "hardikmachhi699@gmail.com",
          "emailConfig.smtpPassword": "", // User needs to add Gmail App Password
          // Keep IMAP as is for receiving emails
        },
      },
      { new: true }
    );

    if (!settings) {
      throw new Error("Settings not found");
    }

    console.log("✅ Settings Updated!\n");
    console.log("📧 New SMTP Configuration:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("SMTP Host: smtp.gmail.com");
    console.log("SMTP Port: 587");
    console.log("SMTP Email: hardikmachhi699@gmail.com");
    console.log("SMTP Password: [NEEDS TO BE SET]");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("⚠️  IMPORTANT: You need to:");
    console.log("1. Go to: https://myaccount.google.com/security");
    console.log("2. Enable 2-Step Verification");
    console.log("3. Go to App Passwords");
    console.log("4. Create password for 'Mail'");
    console.log("5. Go to helpdesk settings and enter the app password\n");

    console.log("📝 Or run this command with your Gmail app password:");
    console.log('npx tsx server/scripts/set-gmail-password.ts "your-app-password-here"\n');

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

switchToGmailSMTP();
