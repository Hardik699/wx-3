import nodemailer from "nodemailer";
import Imap from "imap";
import { simpleParser } from "mailparser";
import HelpdeskSettings from "../models/HelpdeskSettings";

// Create SMTP transporter
export async function createTransporter() {
  const settings = await HelpdeskSettings.findOne();
  if (!settings || !settings.emailConfig.smtpUser) {
    throw new Error("Email configuration not found");
  }

  return nodemailer.createTransport({
    host: settings.emailConfig.smtpHost,
    port: settings.emailConfig.smtpPort,
    secure: settings.emailConfig.smtpPort === 465,
    auth: {
      user: settings.emailConfig.smtpUser,
      pass: settings.emailConfig.smtpPassword,
    },
  });
}

// Send email
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const transporter = await createTransporter();
    const settings = await HelpdeskSettings.findOne();

    const info = await transporter.sendMail({
      from: `"WyzentiQa Xcellencce" <${settings?.emailConfig.smtpUser}>`,
      to,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Send auto-reply to user
export async function sendAutoReply(
  userEmail: string,
  ticketId: string,
  subject: string,
  status: string
) {
  try {
    console.log("🎨 Using NEW WyzentiQa Xcellencce email template design!");
    
    const settings = await HelpdeskSettings.findOne();
    if (!settings || !settings.autoReplyEnabled) {
      return { success: false, error: "Auto-reply disabled" };
    }

    const statusLabel = status === 'open' ? 'OPEN' : status === 'in-progress' ? 'IN PROGRESS' : status === 'resolved' ? 'RESOLVED' : 'CLOSED';
    const currentDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    // Use new modern template instead of database template
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WyzentiQa Xcellencce</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #cbd5e1;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              
              <!-- Main Container -->
              <table role="presentation" style="max-width: 540px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background-color: #0f172a; padding: 50px 40px; text-align: center;">
                    <!-- Wyzentiqa Logo SVG -->
                    <div style="margin: 0 auto 20px; width: 100px; height: 100px;">
                      <svg width="100" height="100" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
                        <!-- Background rounded square -->
                        <rect width="200" height="200" rx="40" fill="#0a1628"/>
                        
                        <!-- White W and U shape -->
                        <path d="M 50 70 L 50 140 L 80 140 L 80 100 L 120 100 L 120 140 L 150 140 L 150 70 L 120 70 L 120 80 L 80 80 L 80 70 Z" fill="#ffffff"/>
                        
                        <!-- Green X shape -->
                        <path d="M 130 90 L 160 70 L 180 85 L 155 110 L 180 135 L 160 150 L 130 125 L 145 110 Z" fill="#10b981"/>
                        <path d="M 145 110 L 130 95 L 145 80" fill="none" stroke="#10b981" stroke-width="8"/>
                      </svg>
                    </div>
                    <h1 style="color: #10b981; margin: 0 0 6px 0; font-size: 15px; font-weight: 700; letter-spacing: 3px;">
                      WyzentiQa Xcellencce
                    </h1>
                    <p style="color: #64748b; margin: 0; font-size: 11px; letter-spacing: 2px;">
                      WyzentiQa Xcellencce - IT Helpdesk Support
                    </p>
                  </td>
                </tr>

                <!-- Success Icon -->
                <tr>
                  <td style="padding: 50px 40px 30px 40px; text-align: center;">
                    <div style="background-color: #d1fae5; border-radius: 50%; width: 70px; height: 70px; margin: 0 auto 24px; display: inline-block; line-height: 70px; text-align: center;">
                      <span style="font-size: 36px; color: #10b981; font-weight: bold;">✓</span>
                    </div>
                    
                    <!-- Title -->
                    <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px; font-weight: 700; line-height: 1.3;">
                      Your Ticket Has Been Received
                    </h2>
                    <p style="color: #94a3b8; margin: 0 0 30px 0; font-size: 14px; line-height: 1.5;">
                      We have logged your request and our team is on it.
                    </p>

                    <!-- Status Badge -->
                    <div style="background-color: #d1fae5; padding: 10px 24px; display: inline-block; border-radius: 20px; margin-bottom: 30px;">
                      <span style="color: #059669; font-size: 13px; font-weight: 700; letter-spacing: 1px;">
                        ● ${statusLabel}
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- Ticket Details Card -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                      <tr>
                        <td style="padding: 24px;">
                          
                          <!-- Ticket ID -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                TICKET ID
                              </td>
                              <td style="color: #3b82f6; font-size: 15px; font-weight: 700; text-align: right; padding: 0; font-family: 'Courier New', monospace;">
                                #${ticketId}
                              </td>
                            </tr>
                          </table>

                          <!-- Subject -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                SUBJECT
                              </td>
                              <td style="color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; padding: 0;">
                                ${subject}
                              </td>
                            </tr>
                          </table>

                          <!-- Priority -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                PRIORITY
                              </td>
                              <td style="color: #f59e0b; font-size: 14px; font-weight: 700; text-align: right; padding: 0;">
                                ⚡ Normal
                              </td>
                            </tr>
                          </table>

                          <!-- Date Opened -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                DATE OPENED
                              </td>
                              <td style="color: #1e293b; font-size: 13px; font-weight: 600; text-align: right; padding: 0;">
                                ${currentDate}
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Automated Response -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 24px; border-radius: 8px;">
                      <p style="color: #94a3b8; margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        AUTOMATED RESPONSE
                      </p>
                      <p style="color: #475569; margin: 0 0 16px 0; font-size: 14px; line-height: 1.7;">
                        Dear User,
                      </p>
                      <p style="color: #475569; margin: 0 0 16px 0; font-size: 14px; line-height: 1.7;">
                        Thank you for contacting WyzentiQa Xcellencce IT Helpdesk. Your support ticket has been successfully created.
                      </p>
                      <p style="color: #475569; margin: 0 0 16px 0; font-size: 14px; line-height: 1.7;">
                        <strong style="color: #3b82f6;">Ticket: #${ticketId}</strong> &nbsp;&nbsp; <strong style="color: #10b981;">Status: ${statusLabel}</strong>
                      </p>
                      <p style="color: #475569; margin: 0 0 16px 0; font-size: 14px; line-height: 1.7;">
                        Our team will respond to your request as soon as possible.
                      </p>
                      <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.7;">
                        Best regards, <strong style="color: #10b981;">WyzentiQa Xcellencce IT Support Team</strong>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Dots Divider -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; text-align: center;">
                    <span style="color: #cbd5e1; font-size: 20px; letter-spacing: 8px;">• • •</span>
                  </td>
                </tr>

                <!-- Action Button -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <a href="${process.env.VITE_APP_URL || "http://localhost:8080"}/helpdesk" 
                       style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
                      View Ticket Status →
                    </a>
                  </td>
                </tr>

                <!-- Help Section -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 13px; font-weight: 600;">
                      Need help?
                    </p>
                    <p style="color: #64748b; margin: 0; font-size: 12px;">
                      <a href="mailto:helpdesk@wyzentiqa.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">helpdesk@wyzentiqa.com</a>
                      <span style="margin: 0 8px; color: #cbd5e1;">|</span>
                      <span style="font-weight: 600;">+91-XXXX-XXXXXX</span>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 30px 40px; text-align: center;">
                    <p style="color: #64748b; margin: 0 0 6px 0; font-size: 12px; line-height: 1.6;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                    <p style="color: #475569; margin: 0; font-size: 11px;">
                      © ${new Date().getFullYear()} WyzentiQa Xcellencce. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendEmail(userEmail, `Ticket Received: ${subject} [#${ticketId}]`, html);
  } catch (error) {
    console.error("Error sending auto-reply:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Send admin notification
export async function sendAdminNotification(
  ticketId: string,
  subject: string,
  userEmail: string,
  description: string
) {
  try {
    const settings = await HelpdeskSettings.findOne();
    if (!settings || !settings.adminNotificationEnabled || !settings.emailConfig.adminEmail) {
      return { success: false, error: "Admin notification disabled" };
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Ticket Notification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      🎫 New Ticket Alert
                    </h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
                      A new support ticket requires your attention
                    </p>
                  </td>
                </tr>

                <!-- Priority Badge -->
                <tr>
                  <td style="padding: 30px 30px 0 30px; text-align: center;">
                    <div style="display: inline-block; background-color: #fef3c7; color: #d97706; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      🔔 Action Required
                    </div>
                  </td>
                </tr>

                <!-- Ticket Details -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">
                      Ticket Details
                    </h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 20px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 12px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; width: 35%;">
                                Ticket ID
                              </td>
                              <td style="padding: 12px 0; color: #111827; font-size: 16px; font-weight: 700; font-family: 'Courier New', monospace;">
                                #${ticketId}
                              </td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding: 0;">
                                <div style="height: 1px; background-color: #e5e7eb; margin: 4px 0;"></div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                From
                              </td>
                              <td style="padding: 12px 0; color: #111827; font-size: 14px;">
                                <a href="mailto:${userEmail}" style="color: #8b5cf6; text-decoration: none; font-weight: 500;">
                                  ${userEmail}
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding: 0;">
                                <div style="height: 1px; background-color: #e5e7eb; margin: 4px 0;"></div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Subject
                              </td>
                              <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 600;">
                                ${subject}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Description -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <h3 style="color: #111827; margin: 0 0 12px 0; font-size: 16px; font-weight: 700;">
                      Description
                    </h3>
                    <div style="background-color: #ffffff; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                      <p style="color: #374151; line-height: 1.8; margin: 0; font-size: 15px; white-space: pre-line;">
${description}
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Action Buttons -->
                <tr>
                  <td style="padding: 0 30px 40px 30px; text-align: center;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="text-align: center; padding: 0 5px;">
                          <a href="${process.env.VITE_APP_URL || "http://localhost:8080"}/helpdesk" 
                             style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                            📋 View Ticket
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Quick Stats -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 20px; text-align: center;">
                          <p style="color: #6b7280; margin: 0; font-size: 13px; line-height: 1.6;">
                            ⏰ Received at ${new Date().toLocaleString('en-US', { 
                              dateStyle: 'medium', 
                              timeStyle: 'short' 
                            })}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                    <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 13px; line-height: 1.6;">
                      This is an automated notification from the WyzentiQa Xcellencce Helpdesk system.
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 12px;">
                      © ${new Date().getFullYear()} WyzentiQa Xcellencce. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendEmail(
      settings.emailConfig.adminEmail,
      `🎫 New Ticket: ${subject} [#${ticketId}]`,
      html
    );
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Send IT notification for new employee
export async function sendITNotification(
  employeeId: string,
  employeeName: string,
  department: string,
  tableNumber: string,
  email: string
) {
  try {
    const settings = await HelpdeskSettings.findOne();
    if (!settings || !settings.emailConfig.adminEmail) {
      return { success: false, error: "IT notification email not configured" };
    }

    const currentDate = new Date().toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Employee - IT Setup Required</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f0f9ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f9ff;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              
              <!-- Main Container -->
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 50px 40px; text-align: center;">
                    <!-- Wyzentiqa Logo SVG -->
                    <div style="margin: 0 auto 20px; width: 100px; height: 100px;">
                      <svg width="100" height="100" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
                        <rect width="200" height="200" rx="40" fill="#0a1628"/>
                        <path d="M 50 70 L 50 140 L 80 140 L 80 100 L 120 100 L 120 140 L 150 140 L 150 70 L 120 70 L 120 80 L 80 80 L 80 70 Z" fill="#ffffff"/>
                        <path d="M 130 90 L 160 70 L 180 85 L 155 110 L 180 135 L 160 150 L 130 125 L 145 110 Z" fill="#10b981"/>
                        <path d="M 145 110 L 130 95 L 145 80" fill="none" stroke="#10b981" stroke-width="8"/>
                      </svg>
                    </div>
                    <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 15px; font-weight: 700; letter-spacing: 3px;">
                      WyzentiQa Xcellencce
                    </h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 11px; letter-spacing: 2px;">
                      IT Department - New Employee Setup
                    </p>
                  </td>
                </tr>

                <!-- Alert Icon -->
                <tr>
                  <td style="padding: 50px 40px 30px 40px; text-align: center;">
                    <div style="background-color: #dbeafe; border-radius: 50%; width: 70px; height: 70px; margin: 0 auto 24px; display: inline-block; line-height: 70px; text-align: center;">
                      <span style="font-size: 36px;">🖥️</span>
                    </div>
                    
                    <!-- Title -->
                    <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px; font-weight: 700; line-height: 1.3;">
                      New Employee - IT Setup Required
                    </h2>
                    <p style="color: #94a3b8; margin: 0 0 30px 0; font-size: 14px; line-height: 1.5;">
                      A new employee has been added and requires IT setup.
                    </p>

                    <!-- Status Badge -->
                    <div style="background-color: #fef3c7; padding: 10px 24px; display: inline-block; border-radius: 20px; margin-bottom: 30px;">
                      <span style="color: #d97706; font-size: 13px; font-weight: 700; letter-spacing: 1px;">
                        ⚡ ACTION REQUIRED
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- Employee Details Card -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                      <tr>
                        <td style="padding: 24px;">
                          
                          <!-- Employee ID -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                EMPLOYEE ID
                              </td>
                              <td style="color: #0ea5e9; font-size: 15px; font-weight: 700; text-align: right; padding: 0; font-family: 'Courier New', monospace;">
                                ${employeeId}
                              </td>
                            </tr>
                          </table>

                          <!-- Full Name -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                FULL NAME
                              </td>
                              <td style="color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; padding: 0;">
                                ${employeeName}
                              </td>
                            </tr>
                          </table>

                          <!-- Department -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                DEPARTMENT
                              </td>
                              <td style="color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; padding: 0;">
                                ${department}
                              </td>
                            </tr>
                          </table>

                          <!-- Table Number -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                TABLE NUMBER
                              </td>
                              <td style="color: #0ea5e9; font-size: 14px; font-weight: 700; text-align: right; padding: 0;">
                                📍 ${tableNumber}
                              </td>
                            </tr>
                          </table>

                          <!-- Email -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                EMAIL
                              </td>
                              <td style="color: #1e293b; font-size: 13px; font-weight: 600; text-align: right; padding: 0;">
                                ${email}
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- IT Setup Checklist -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <div style="background-color: #f8fafc; border-left: 4px solid #0ea5e9; padding: 24px; border-radius: 8px;">
                      <p style="color: #94a3b8; margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        IT SETUP CHECKLIST
                      </p>
                      <p style="color: #475569; margin: 0 0 12px 0; font-size: 14px; line-height: 1.7;">
                        ☐ Create email account<br>
                        ☐ Setup workstation at ${tableNumber}<br>
                        ☐ Install required software<br>
                        ☐ Configure network access<br>
                        ☐ Provide login credentials<br>
                        ☐ Complete orientation
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Date Added -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; text-align: center;">
                    <p style="color: #94a3b8; margin: 0; font-size: 13px;">
                      <strong>Date Added:</strong> ${currentDate}
                    </p>
                  </td>
                </tr>

                <!-- Dots Divider -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; text-align: center;">
                    <span style="color: #cbd5e1; font-size: 20px; letter-spacing: 8px;">• • •</span>
                  </td>
                </tr>

                <!-- Action Button -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <a href="${process.env.VITE_APP_URL || "http://localhost:8080"}/it" 
                       style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
                      View IT Dashboard →
                    </a>
                  </td>
                </tr>

                <!-- Help Section -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 13px; font-weight: 600;">
                      Need help?
                    </p>
                    <p style="color: #64748b; margin: 0; font-size: 12px;">
                      <a href="mailto:it@wyzentiqa.com" style="color: #0ea5e9; text-decoration: none; font-weight: 600;">it@wyzentiqa.com</a>
                      <span style="margin: 0 8px; color: #cbd5e1;">|</span>
                      <span style="font-weight: 600;">+91-XXXX-XXXXXX</span>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 30px 40px; text-align: center;">
                    <p style="color: #64748b; margin: 0 0 6px 0; font-size: 12px; line-height: 1.6;">
                      This is an automated notification from WyzentiQa Xcellencce HR System.
                    </p>
                    <p style="color: #475569; margin: 0; font-size: 11px;">
                      © ${new Date().getFullYear()} WyzentiQa Xcellencce. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendEmail(
      settings.emailConfig.adminEmail,
      `🖥️ New Employee IT Setup Required: ${employeeName} [${employeeId}]`,
      html
    );
  } catch (error) {
    console.error("Error sending IT notification:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Send reply to user
export async function sendReplyEmail(
  userEmail: string,
  ticketId: string,
  subject: string,
  replyMessage: string,
  adminName: string
) {
  try {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WyzentiQa Xcellencce - Ticket Reply</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #cbd5e1;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              
              <!-- Main Container -->
              <table role="presentation" style="max-width: 540px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background-color: #0f172a; padding: 50px 40px; text-align: center;">
                    <!-- Wyzentiqa Logo SVG -->
                    <div style="margin: 0 auto 20px; width: 100px; height: 100px;">
                      <svg width="100" height="100" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
                        <!-- Background rounded square -->
                        <rect width="200" height="200" rx="40" fill="#0a1628"/>
                        
                        <!-- White W and U shape -->
                        <path d="M 50 70 L 50 140 L 80 140 L 80 100 L 120 100 L 120 140 L 150 140 L 150 70 L 120 70 L 120 80 L 80 80 L 80 70 Z" fill="#ffffff"/>
                        
                        <!-- Green X shape -->
                        <path d="M 130 90 L 160 70 L 180 85 L 155 110 L 180 135 L 160 150 L 130 125 L 145 110 Z" fill="#10b981"/>
                        <path d="M 145 110 L 130 95 L 145 80" fill="none" stroke="#10b981" stroke-width="8"/>
                      </svg>
                    </div>
                    <h1 style="color: #10b981; margin: 0 0 6px 0; font-size: 15px; font-weight: 700; letter-spacing: 3px;">
                      WyzentiQa Xcellencce
                    </h1>
                    <p style="color: #64748b; margin: 0; font-size: 11px; letter-spacing: 2px;">
                      IT Helpdesk Support - New Reply
                    </p>
                  </td>
                </tr>

                <!-- Reply Icon -->
                <tr>
                  <td style="padding: 50px 40px 30px 40px; text-align: center;">
                    <div style="background-color: #dbeafe; border-radius: 50%; width: 70px; height: 70px; margin: 0 auto 24px; display: inline-block; line-height: 70px; text-align: center;">
                      <span style="font-size: 36px;">💬</span>
                    </div>
                    
                    <!-- Title -->
                    <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px; font-weight: 700; line-height: 1.3;">
                      New Reply from IT Support
                    </h2>
                    <p style="color: #94a3b8; margin: 0 0 30px 0; font-size: 14px; line-height: 1.5;">
                      Our team has responded to your ticket.
                    </p>

                    <!-- Status Badge -->
                    <div style="background-color: #dbeafe; padding: 10px 24px; display: inline-block; border-radius: 20px; margin-bottom: 30px;">
                      <span style="color: #0284c7; font-size: 13px; font-weight: 700; letter-spacing: 1px;">
                        ● ACTIVE
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- Ticket Details Card -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                      <tr>
                        <td style="padding: 24px;">
                          
                          <!-- Ticket ID -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                TICKET ID
                              </td>
                              <td style="color: #3b82f6; font-size: 15px; font-weight: 700; text-align: right; padding: 0; font-family: 'Courier New', monospace;">
                                #${ticketId}
                              </td>
                            </tr>
                          </table>

                          <!-- Subject -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                SUBJECT
                              </td>
                              <td style="color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; padding: 0;">
                                ${subject}
                              </td>
                            </tr>
                          </table>

                          <!-- Reply From -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="color: #94a3b8; font-size: 11px; font-weight: 600; padding: 0; text-transform: uppercase; letter-spacing: 1px; width: 35%;">
                                REPLY FROM
                              </td>
                              <td style="color: #10b981; font-size: 14px; font-weight: 700; text-align: right; padding: 0;">
                                ${adminName}
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Reply Message -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 24px; border-radius: 8px;">
                      <p style="color: #94a3b8; margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        MESSAGE FROM IT SUPPORT
                      </p>
                      <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.7; white-space: pre-line;">
${replyMessage}
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Reply Time -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; text-align: center;">
                    <p style="color: #94a3b8; margin: 0; font-size: 13px;">
                      <strong>Replied at:</strong> ${currentDate}
                    </p>
                  </td>
                </tr>

                <!-- Dots Divider -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; text-align: center;">
                    <span style="color: #cbd5e1; font-size: 20px; letter-spacing: 8px;">• • •</span>
                  </td>
                </tr>

                <!-- Reply Instructions -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-radius: 12px; overflow: hidden; border: 2px solid #fbbf24;">
                      <tr>
                        <td style="padding: 24px; text-align: center;">
                          <p style="color: #92400e; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                            💡 Need to add more information?
                          </p>
                          <p style="color: #78350f; margin: 0; font-size: 13px; line-height: 1.6;">
                            Simply <strong>reply to this email</strong> to continue the conversation.<br>
                            Your reply will be automatically added to ticket <strong>#${ticketId}</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Action Button -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <a href="${process.env.VITE_APP_URL || "http://localhost:8080"}/helpdesk" 
                       style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
                      View Ticket History →
                    </a>
                  </td>
                </tr>

                <!-- Help Section -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 13px; font-weight: 600;">
                      Need help?
                    </p>
                    <p style="color: #64748b; margin: 0; font-size: 12px;">
                      <a href="mailto:helpdesk@wyzentiqa.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">helpdesk@wyzentiqa.com</a>
                      <span style="margin: 0 8px; color: #cbd5e1;">|</span>
                      <span style="font-weight: 600;">+91-XXXX-XXXXXX</span>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 30px 40px; text-align: center;">
                    <p style="color: #64748b; margin: 0 0 6px 0; font-size: 12px; line-height: 1.6;">
                      Reply to this email to add more information to your ticket.
                    </p>
                    <p style="color: #475569; margin: 0; font-size: 11px;">
                      © ${new Date().getFullYear()} WyzentiQa Xcellencce. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendEmail(userEmail, `Re: ${subject} [#${ticketId}]`, html);
  } catch (error) {
    console.error("Error sending reply email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Create IMAP connection
export async function createImapConnection() {
  const settings = await HelpdeskSettings.findOne();
  if (!settings || !settings.emailConfig.imapUser) {
    throw new Error("IMAP configuration not found");
  }

  return new Imap({
    user: settings.emailConfig.imapUser,
    password: settings.emailConfig.imapPassword,
    host: settings.emailConfig.imapHost,
    port: settings.emailConfig.imapPort,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });
}

// Parse email and extract details
export async function parseEmail(buffer: Buffer) {
  try {
    const parsed = await simpleParser(buffer);
    return {
      from: parsed.from?.text || "",
      subject: parsed.subject || "No Subject",
      text: parsed.text || "",
      html: parsed.html || "",
      messageId: parsed.messageId || "",
      date: parsed.date || new Date(),
    };
  } catch (error) {
    console.error("Error parsing email:", error);
    return null;
  }
}

// Send ticket status update email
export async function sendStatusUpdateEmail(
  userEmail: string,
  ticketId: string,
  subject: string,
  oldStatus: string,
  newStatus: string,
  updatedBy: string
) {
  try {
    const statusConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
      'open': { color: '#10b981', bg: '#d1fae5', icon: '🟢', label: 'Open' },
      'in-progress': { color: '#f59e0b', bg: '#fef3c7', icon: '🟡', label: 'In Progress' },
      'resolved': { color: '#6366f1', bg: '#e0e7ff', icon: '🔵', label: 'Resolved' },
      'closed': { color: '#6b7280', bg: '#f3f4f6', icon: '⚫', label: 'Closed' },
    };

    const status = statusConfig[newStatus] || statusConfig['open'];

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket Status Update</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      🔄 Status Update
                    </h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
                      Your ticket status has been updated
                    </p>
                  </td>
                </tr>

                <!-- Status Change -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px; text-align: center;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="text-align: center; padding: 10px;">
                          <div style="display: inline-block; background-color: #f3f4f6; color: #6b7280; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${oldStatus}
                          </div>
                        </td>
                        <td style="text-align: center; padding: 10px; color: #9ca3af; font-size: 24px;">
                          →
                        </td>
                        <td style="text-align: center; padding: 10px;">
                          <div style="display: inline-block; background-color: ${status.bg}; color: ${status.color}; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${status.icon} ${status.label}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Ticket Info -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 20px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Ticket ID
                              </td>
                              <td style="padding: 8px 0; color: #111827; font-size: 16px; font-weight: 700; text-align: right; font-family: 'Courier New', monospace;">
                                #${ticketId}
                              </td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding: 0;">
                                <div style="height: 1px; background-color: #e5e7eb; margin: 8px 0;"></div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Subject
                              </td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">
                                ${subject}
                              </td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding: 0;">
                                <div style="height: 1px; background-color: #e5e7eb; margin: 8px 0;"></div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Updated By
                              </td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">
                                ${updatedBy}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Action Button -->
                <tr>
                  <td style="padding: 0 30px 40px 30px; text-align: center;">
                    <a href="${process.env.VITE_APP_URL || "http://localhost:8080"}/helpdesk" 
                       style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                      View Ticket Details
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                    <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 13px; line-height: 1.6;">
                      This is an automated notification from the WyzentiQa Xcellencce Helpdesk system.
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 12px;">
                      © ${new Date().getFullYear()} WyzentiQa Xcellencce. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendEmail(userEmail, `Ticket Status Updated: ${subject} [#${ticketId}]`, html);
  } catch (error) {
    console.error("Error sending status update email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

