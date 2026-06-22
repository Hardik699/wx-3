import nodemailer from "nodemailer";
import "dotenv/config";

async function testSMTPDirect() {
  console.log("🔧 Testing SMTP Connection Directly...\n");

  const configs = [
    {
      name: "Port 465 (SSL)",
      host: "mail.wyzentiqa.com",
      port: 465,
      secure: true,
    },
    {
      name: "Port 587 (TLS)",
      host: "mail.wyzentiqa.com",
      port: 587,
      secure: false,
    },
    {
      name: "Port 465 with wyzentiqa.com",
      host: "wyzentiqa.com",
      port: 465,
      secure: true,
    },
    {
      name: "Port 587 with wyzentiqa.com",
      host: "wyzentiqa.com",
      port: 587,
      secure: false,
    },
  ];

  const email = "itsupport@wyzentiqa.com";
  const password = "Wyzentiqa#404@";

  for (const config of configs) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Testing: ${config.name}`);
    console.log(`Host: ${config.host}:${config.port}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: email,
          pass: password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verify connection
      console.log("🔄 Verifying connection...");
      await transporter.verify();
      console.log("✅ Connection successful!");

      // Try sending test email
      console.log("📤 Sending test email...");
      const info = await transporter.sendMail({
        from: `"IT Helpdesk Test" <${email}>`,
        to: "hardikmachhi699@gmail.com",
        subject: `✅ SMTP Test Success - ${config.name}`,
        text: `This email confirms that SMTP is working with ${config.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #10b981;">✅ SMTP Test Successful!</h2>
            <p>Configuration: <strong>${config.name}</strong></p>
            <p>Host: <strong>${config.host}:${config.port}</strong></p>
            <p>This confirms your email settings are working correctly.</p>
          </div>
        `,
      });

      console.log(`✅ Email sent successfully!`);
      console.log(`Message ID: ${info.messageId}`);
      console.log(`\n🎉 SUCCESS! Use this configuration:`);
      console.log(`   Host: ${config.host}`);
      console.log(`   Port: ${config.port}`);
      console.log(`   Secure: ${config.secure}`);
      
      process.exit(0);
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("❌ All configurations failed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n💡 Possible solutions:");
  console.log("1. Check if email password is correct");
  console.log("2. Contact hosting provider for correct SMTP settings");
  console.log("3. Check if SMTP is enabled in cPanel");
  console.log("4. Try using webmail to verify credentials\n");
  
  process.exit(1);
}

testSMTPDirect();
