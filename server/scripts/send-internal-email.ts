import nodemailer from "nodemailer";
import "dotenv/config";

async function sendInternalEmail() {
  console.log("📧 Sending email to hardik.machhi@wyzentiqa.com...\n");

  try {
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

    console.log("📤 Sending internal email...");
    const info = await transporter.sendMail({
      from: '"IT Helpdesk" <itsupport@wyzentiqa.com>',
      to: "hardik.machhi@wyzentiqa.com",
      subject: "🔔 Internal Email Test - IT Helpdesk",
      text: "This is an internal email test from IT Helpdesk to check if same-domain emails work.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Internal Email Test</h1>
          </div>
          <div style="background: #f9fafb; padding: 40px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello Hardik!</h2>
            <p style="color: #374151; line-height: 1.8; font-size: 16px;">
              This is an <strong>internal email test</strong> from the IT Helpdesk system.
            </p>
            <div style="background: white; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280;">
                <strong>From:</strong> itsupport@wyzentiqa.com<br>
                <strong>To:</strong> hardik.machhi@wyzentiqa.com<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                <strong>Purpose:</strong> Testing internal email delivery
              </p>
            </div>
            <p style="color: #374151; line-height: 1.8;">
              This test checks if emails work within the same domain (wyzentiqa.com).
            </p>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Note:</strong> If you receive this email, it means internal emails work. 
                The issue might be with external email delivery (to Gmail, etc.)
              </p>
            </div>
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
    console.log(`To: hardik.machhi@wyzentiqa.com`);
    console.log(`Subject: 🔔 Internal Email Test - IT Helpdesk`);
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("✅ Check webmail for hardik.machhi@wyzentiqa.com");
    console.log("🌐 Login at: https://wyzentiqa.com:2096");
    console.log("📧 Or check via Roundcube webmail\n");

    console.log("💡 If this email arrives:");
    console.log("   → Internal emails work ✅");
    console.log("   → Issue is with external delivery (Gmail, etc.) ❌");
    console.log("\n💡 If this email doesn't arrive:");
    console.log("   → SMTP is completely blocked ❌");
    console.log("   → Contact hosting provider immediately\n");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error sending email:");
    console.error(error.message);
    process.exit(1);
  }
}

sendInternalEmail();

