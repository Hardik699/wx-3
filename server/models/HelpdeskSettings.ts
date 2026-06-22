import mongoose from "mongoose";

const helpdeskSettingsSchema = new mongoose.Schema(
  {
    emailConfig: {
      imapHost: {
        type: String,
        default: "imap.gmail.com",
      },
      imapPort: {
        type: Number,
        default: 993,
      },
      imapUser: {
        type: String,
        default: "",
      },
      imapPassword: {
        type: String,
        default: "",
      },
      smtpHost: {
        type: String,
        default: "smtp.gmail.com",
      },
      smtpPort: {
        type: Number,
        default: 587,
      },
      smtpUser: {
        type: String,
        default: "",
      },
      smtpPassword: {
        type: String,
        default: "",
      },
      adminEmail: {
        type: String,
        default: "",
      },
    },
    autoReplyEnabled: {
      type: Boolean,
      default: true,
    },
    autoReplyTemplate: {
      type: String,
      default: `Thank you for contacting our IT Helpdesk.

Your ticket has been created successfully.

Ticket ID: {{ticketId}}
Subject: {{subject}}
Status: {{status}}

We will respond to your request as soon as possible.

Best regards,
IT Support Team`,
    },
    adminNotificationEnabled: {
      type: Boolean,
      default: true,
    },
    ticketPrefix: {
      type: String,
      default: "TKT",
    },
    lastTicketNumber: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const HelpdeskSettings = mongoose.model(
  "HelpdeskSettings",
  helpdeskSettingsSchema
);

export default HelpdeskSettings;
