import { createImapConnection, parseEmail } from "./emailService";
import { createTicketFromEmail } from "./ticketService";
import HelpdeskSettings from "../models/HelpdeskSettings";
import Ticket from "../models/Ticket";

let imapMonitorInterval: NodeJS.Timeout | null = null;
let isMonitoring = false;

// Start monitoring emails
export async function startEmailMonitoring() {
  if (isMonitoring) {
    console.log("Email monitoring is already running");
    return { success: false, error: "Already monitoring" };
  }

  try {
    const settings = await HelpdeskSettings.findOne();
    if (!settings || !settings.isActive || !settings.emailConfig.imapUser) {
      console.log("Email monitoring not configured or not active");
      return { success: false, error: "Email monitoring not configured" };
    }

    isMonitoring = true;
    console.log("✅ Email monitoring started");

    // Check for new emails every 30 seconds
    imapMonitorInterval = setInterval(async () => {
      try {
        await checkNewEmails();
      } catch (error) {
        console.error("Error checking emails:", error);
      }
    }, 30000);

    // Check immediately on start
    await checkNewEmails();

    return { success: true, message: "Email monitoring started" };
  } catch (error) {
    isMonitoring = false;
    console.error("Error starting email monitoring:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Stop monitoring emails
export function stopEmailMonitoring() {
  if (imapMonitorInterval) {
    clearInterval(imapMonitorInterval);
    imapMonitorInterval = null;
  }
  isMonitoring = false;
  console.log("❌ Email monitoring stopped");
  return { success: true, message: "Email monitoring stopped" };
}

// Check for new emails
async function checkNewEmails() {
  return new Promise<void>((resolve, reject) => {
    createImapConnection()
      .then((imap) => {
        imap.once("ready", () => {
          imap.openBox("INBOX", false, (err, box) => {
            if (err) {
              console.error("Error opening inbox:", err);
              imap.end();
              return reject(err);
            }

            // Search for unseen emails
            imap.search(["UNSEEN"], (err, results) => {
              if (err) {
                console.error("Error searching emails:", err);
                imap.end();
                return reject(err);
              }

              if (!results || results.length === 0) {
                imap.end();
                return resolve();
              }

              console.log(`📧 Found ${results.length} new email(s)`);

              const fetch = imap.fetch(results, { bodies: "", markSeen: true });

              fetch.on("message", (msg) => {
                msg.on("body", (stream) => {
                  let buffer = Buffer.alloc(0);

                  stream.on("data", (chunk) => {
                    buffer = Buffer.concat([buffer, chunk]);
                  });

                  stream.once("end", async () => {
                    try {
                      const parsed = await parseEmail(buffer);
                      if (parsed) {
                        // Extract email address from "Name <email@domain.com>" format
                        const emailMatch = parsed.from.match(/<(.+?)>/);
                        const userEmail = emailMatch ? emailMatch[1] : parsed.from;

                        // Check if ticket already exists for this message
                        const existingTicket = await Ticket.findOne({
                          emailMessageId: parsed.messageId,
                        });

                        if (existingTicket) {
                          console.log(`⏭️ Ticket already exists for message: ${parsed.messageId}`);
                          return;
                        }

                        // Check if this is a reply to an existing ticket
                        // Look for ticket ID in subject like: Re: Subject [#TKT-001] or [Ticket #TKT-001]
                        const ticketIdMatch = parsed.subject.match(/\[#?([A-Z]+-\d+)\]/i);
                        
                        if (ticketIdMatch) {
                          const ticketId = ticketIdMatch[1];
                          console.log(`💬 Reply detected for ticket: ${ticketId}`);
                          
                          // Find the ticket
                          const ticket = await Ticket.findOne({ ticketId });
                          
                          if (ticket) {
                            // Add reply to existing ticket
                            const replyContent = parsed.text || parsed.html || "No content";
                            
                            ticket.replies.push({
                              from: userEmail,
                              message: replyContent,
                              isAdmin: false,
                              timestamp: new Date(),
                            });
                            
                            ticket.lastUpdated = new Date();
                            await ticket.save();
                            console.log(`✅ Reply added to ticket ${ticketId} from ${userEmail}`);
                          } else {
                            console.log(`⚠️ Ticket ${ticketId} not found, creating new ticket`);
                            await createTicketFromEmail(
                              userEmail,
                              parsed.subject,
                              parsed.text || parsed.html || "No content",
                              parsed.messageId
                            );
                          }
                        } else {
                          // No ticket ID found, create new ticket
                          console.log(`📨 Creating new ticket from: ${userEmail}`);
                          await createTicketFromEmail(
                            userEmail,
                            parsed.subject,
                            parsed.text || parsed.html || "No content",
                            parsed.messageId
                          );
                        }
                      }
                    } catch (error) {
                      console.error("Error processing email:", error);
                    }
                  });
                });
              });

              fetch.once("error", (err) => {
                console.error("Fetch error:", err);
                imap.end();
                reject(err);
              });

              fetch.once("end", () => {
                imap.end();
                resolve();
              });
            });
          });
        });

        imap.once("error", (err) => {
          console.error("IMAP connection error:", err);
          reject(err);
        });

        imap.once("end", () => {
          // Connection ended
        });

        imap.connect();
      })
      .catch((error) => {
        console.error("Error creating IMAP connection:", error);
        reject(error);
      });
  });
}

// Get monitoring status
export function getMonitoringStatus() {
  return {
    isMonitoring,
    message: isMonitoring ? "Email monitoring is active" : "Email monitoring is inactive",
  };
}
