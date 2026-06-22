import mongoose from "mongoose";
import nodemailer from "nodemailer";
import HelpdeskSettings from "../models/HelpdeskSettings";
import "dotenv/config";

async function testEmailConnection() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Get settings
    const settings = await HelpdeskSettings.findOne();
    if (!settings) {
      throw new Error("Helpdesk settings not found. Run init-helpdesk.ts first.");
    }

    console.log("📧 Testing Email Configuration...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Test SMTP Connection
    console.log("🔄 Testing SMTP (Outgoing Mail)...");
    console.log(`Host: ${settings.emailConfig.smtpHost}`);
    console.log(`Port: ${settings.emailConfig.smtpPort}`);
    console.log(`Email: ${settings.emailConfig.smtpUser}\n`);

    const transporter = nodemailer.createTransport({
      host: settings.emailConfig.smtpHost,
      port: settings.emailConfig.smtpPort,
      secure: settings.emailConfig.smtpPort === 465,
      auth: {
        user: settings.emailConfig.smtpUser,
        pass: settings.emailConfig.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log("✅ SMTP Connection Successful!\n");
    } catch (error: any) {
      console.error("❌ SMTP Connection Failed:");
      console.error(error.message);
      console.log("\n💡 Try these solutions:");
      console.log("1. Check if email and password are correct");
      console.log("2. Try port 587 instead of 465");
      console.log("3. Check if mail.wyzentiqa.com is accessible");
      console.log("4. Contact your hosting provider\n");
      throw error;
    }

    // Send test email
    console.log("📤 Sending test email...");
    const info = await transporter.sendMail({
      from: `"WyzentiQa Xcellencce IT Helpdesk" <${settings.emailConfig.smtpUser}>`,
      to: settings.emailConfig.adminEmail,
      subject: "✅ Helpdesk Email Test - Configuration Successful",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Email Configuration Successful!</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Congratulations!</h2>
            <p style="color: #374151; line-height: 1.6;">
              Your IT Helpdesk email configuration is working perfectly!
            </p>
            <div style="background: white; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #8b5cf6;">Configuration Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; color: #6b7280; font-weight: bold;">SMTP Host:</td>
                  <td style="padding: 8px; color: #1f2937;">${settings.emailConfig.smtpHost}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; color: #6b7280; font-weight: bold;">SMTP Port:</td>
                  <td style="padding: 8px; color: #1f2937;">${settings.emailConfig.smtpPort}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; color: #6b7280; font-weight: bold;">Email:</td>
                  <td style="padding: 8px; color: #1f2937;">${settings.emailConfig.smtpUser}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; color: #6b7280; font-weight: bold;">Status:</td>
                  <td style="padding: 8px; color: #10b981; font-weight: bold;">✅ Active</td>
                </tr>
              </table>
            </div>
            <h3 style="color: #1f2937;">Next Steps:</h3>
            <ol style="color: #374151; line-height: 1.8;">
              <li>Email monitoring is now active</li>
              <li>Send test email to: <strong>${settings.emailConfig.smtpUser}</strong></li>
              <li>Wait 30 seconds for ticket to appear</li>
              <li>Check dashboard at: <a href="http://localhost:8080/helpdesk">http://localhost:8080/helpdesk</a></li>
            </ol>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Important:</strong> Make sure your development server is running with <code>pnpm dev</code>
              </p>
            </div>
          </div>
          <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} WyzentiQa Xcellencce. All rights reserved.</p>
            <p>This is an automated test email from your IT Helpdesk system.</p>
          </div>
        </div>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log(`Message ID: ${info.messageId}\n`);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ All Tests Passed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📝 What to do next:");
    console.log("1. Check your email: " + settings.emailConfig.adminEmail);
    console.log("2. You should receive a test email");
    console.log("3. Send an email to: " + settings.emailConfig.smtpUser);
    console.log("4. Wait 30 seconds and check dashboard");
    console.log("5. Ticket will be created automatically!\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error testing email:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check if settings are correct: npx tsx server/scripts/init-helpdesk.ts");
    console.log("2. Try different SMTP port (465 or 587)");
    console.log("3. Verify email credentials with your hosting provider");
    console.log("4. Check if mail.wyzentiqa.com is accessible\n");
    process.exit(1);
  }
}

// Run the test
testEmailConnection();

