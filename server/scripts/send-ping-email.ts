import nodemailer from "nodemailer";
import "dotenv/config";

async function sendPingEmail() {
  console.log("📧 Sending ping email to hardikmachhi699@gmail.com...\n");

  try {
    // Create transporter with current settings
    const transporter = nodemailer.createTransport({
      host: "mail.wyzentiqa.com",
      port: 465,
      secure: true,
      auth: {
        user: "itsupport@wyzentiqa.com",
        pass: "Wyzentiqa#404@",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("🔄 Connecting to SMTP server...");
    await transporter.verify();
    console.log("✅ Connected successfully!\n");

    console.log("📤 Sending email...");
    const info = await transporter.sendMail({
      from: '"Wyzentiqa IT Helpdesk" <itsupport@wyzentiqa.com>',
      to: "hardikmachhi699@gmail.com",
      subject: "🔔 Ping Test from IT Helpdesk",
      text: "This is a simple ping test email from your IT Helpdesk system.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🔔 PING!</h1>
          </div>
          <div style="background: #f9fafb; padding: 40px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello from IT Helpdesk!</h2>
            <p style="color: #374151; line-height: 1.8; font-size: 16px;">
              This is a <strong>simple ping test email</strong> from your IT Helpdesk system.
            </p>
            <div style="background: white; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280;">
                <strong>From:</strong> itsupport@wyzentiqa.com<br>
                <strong>To:</strong> hardikmachhi699@gmail.com<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                <strong>Purpose:</strong> Testing email delivery
              </p>
            </div>
            <p style="color: #374151; line-height: 1.8;">
              If you receive this email, it means the email system is working correctly! 🎉
            </p>
          </div>
          <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} WyzentiQa Xcellencce IT Helpdesk
            </p>
          </div>
        </div>
      `,
    });

    console.log("✅ Email sent successfully!\n");
    console.log("📋 Details:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Message ID: ${info.messageId}`);
    console.log(`From: itsupport@wyzentiqa.com`);
    console.log(`To: hardikmachhi699@gmail.com`);
    console.log(`Subject: 🔔 Ping Test from IT Helpdesk`);
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("✅ Check your Gmail inbox now!");
    console.log("📧 Email: hardikmachhi699@gmail.com");
    console.log("📁 Also check spam folder if not in inbox\n");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error sending email:");
    console.error(error.message);
    console.log("\n💡 This confirms the email delivery issue.");
    console.log("The SMTP connection works but emails are not being delivered.\n");
    process.exit(1);
  }
}

sendPingEmail();

