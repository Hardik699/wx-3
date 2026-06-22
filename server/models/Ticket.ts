import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "pending", "in_progress", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["hardware", "software", "network", "access", "other"],
      default: "other",
    },
    assignedTo: {
      type: String,
      default: "",
    },
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
      },
    ],
    replies: [
      {
        from: String,
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
      },
    ],
    emailMessageId: {
      type: String,
      default: "",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ userEmail: 1 });
ticketSchema.index({ priority: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
