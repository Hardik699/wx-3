# IT Helpdesk Ticket Management System - Setup Guide

## 🎯 Overview

A complete IT Helpdesk system with automatic ticket creation from incoming emails, built with the MERN stack.

### Features

✅ **Automatic Ticket Creation** - Emails sent to your support address automatically create tickets  
✅ **Gmail IMAP Integration** - Monitor Gmail inbox for new support requests  
✅ **Auto-Reply System** - Automatically send confirmation emails with ticket IDs  
✅ **Admin Notifications** - Get notified when new tickets are created  
✅ **Ticket Management** - Full CRUD operations with status tracking  
✅ **Priority System** - Low, Medium, High, Urgent priorities  
✅ **Reply System** - Reply to users directly from the dashboard  
✅ **Email Automation** - Nodemailer + IMAP for complete email workflow  
✅ **Export to Excel** - Download ticket data as spreadsheets  
✅ **Modern UI** - Responsive design with Tailwind CSS  
✅ **Real-time Stats** - Dashboard analytics for ticket metrics  

---

## 📦 Installation

### 1. Install Dependencies

```bash
pnpm install
```

This will install the required packages:
- `nodemailer` - Send emails (SMTP)
- `imap` - Read incoming emails
- `mailparser` - Parse email content
- `@types/nodemailer`, `@types/imap`, `@types/mailparser` - TypeScript types

### 2. Gmail App Password Setup

For Gmail, you need to create an **App Password** (not your regular Gmail password):

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter "IT Helpdesk" as the name
6. Click **Generate**
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

**Important:** Remove spaces from the app password when entering it in settings.

---

## ⚙️ Configuration

### 1. Access Helpdesk Settings

1. Login as **admin**
2. Navigate to **Dashboard** → **IT Helpdesk** card
3. Click **Settings** button in the top right

### 2. Configure Email Settings

#### IMAP Settings (Incoming Mail)
```
IMAP Host: imap.gmail.com
IMAP Port: 993
IMAP Email: your-support@gmail.com
IMAP Password: [Your 16-char App Password]
```

#### SMTP Settings (Outgoing Mail)
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Email: your-support@gmail.com
SMTP Password: [Your 16-char App Password]
```

#### Admin Notification Email
```
Admin Email: admin@yourcompany.com
```

### 3. Configure Automation

- **Auto-Reply to Users**: Enable/disable automatic confirmation emails
- **Auto-Reply Template**: Customize the email template (supports variables)
- **Admin Notifications**: Enable/disable admin email notifications
- **Ticket ID Prefix**: Set custom prefix (e.g., "TKT", "SUP", "HELP")
- **Email Monitoring Active**: Enable to start monitoring inbox

### 4. Test Configuration

Click **"Test Email Configuration"** button to verify SMTP settings work correctly.

---

## 🚀 Usage

### Automatic Ticket Creation

1. **Enable Email Monitoring** in settings
2. Users send emails to your support address (e.g., support@company.com)
3. System automatically:
   - Creates a ticket with unique ID
   - Sends auto-reply to user with ticket ID
   - Sends notification to admin
   - Displays ticket in dashboard

### Manual Ticket Creation

1. Click **"New Ticket"** button
2. Fill in:
   - Subject
   - Description
   - User Email
   - User Name (optional)
   - Priority (Low/Medium/High/Urgent)
   - Category (Hardware/Software/Network/Access/Other)
3. Click **"Create Ticket"**

### Managing Tickets

#### View Ticket Details
- Click the **eye icon** on any ticket
- View full conversation history
- See all ticket metadata

#### Update Status
- Open ticket details
- Change status dropdown:
  - **Open** - New ticket
  - **Pending** - Waiting for user response
  - **In Progress** - Being worked on
  - **Closed** - Resolved

#### Update Priority
- Open ticket details
- Change priority dropdown
- Urgent tickets are highlighted in red

#### Reply to User
1. Open ticket details
2. Type your reply in the text area
3. Click **"Send Reply & Email User"**
4. User receives email with your response

### Search & Filter

- **Search**: Search by ticket ID, subject, email, or description
- **Status Filter**: Filter by Open/Pending/In Progress/Closed
- **Priority Filter**: Filter by Low/Medium/High/Urgent

### Export Data

Click **"Export"** button to download all tickets as Excel file with:
- Ticket ID, Subject, User details
- Status, Priority, Category
- Description, Created date/time
- Last updated timestamp

---

## 📊 Dashboard Analytics

The dashboard shows real-time statistics:

- **Total Tickets** - All tickets in system
- **Open** - New unassigned tickets
- **Pending** - Awaiting user response
- **In Progress** - Currently being worked on
- **Closed** - Resolved tickets
- **High Priority** - High priority tickets
- **Urgent** - Urgent tickets requiring immediate attention

---

## 🔧 Technical Details

### Database Models

#### Ticket Model
```typescript
{
  ticketId: string;        // Unique ID (e.g., TKT-000001)
  subject: string;
  description: string;
  userEmail: string;
  userName: string;
  status: "open" | "pending" | "in_progress" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "hardware" | "software" | "network" | "access" | "other";
  replies: Array<{
    from: string;
    message: string;
    timestamp: Date;
    isAdmin: boolean;
  }>;
  emailMessageId: string;  // Original email message ID
  createdAt: Date;
  lastUpdated: Date;
}
```

#### HelpdeskSettings Model
```typescript
{
  emailConfig: {
    imapHost, imapPort, imapUser, imapPassword,
    smtpHost, smtpPort, smtpUser, smtpPassword,
    adminEmail
  };
  autoReplyEnabled: boolean;
  autoReplyTemplate: string;
  adminNotificationEnabled: boolean;
  ticketPrefix: string;
  lastTicketNumber: number;
  isActive: boolean;
}
```

### API Endpoints

```
GET    /api/helpdesk/tickets              - Get all tickets (with filters)
GET    /api/helpdesk/tickets/:ticketId    - Get single ticket
POST   /api/helpdesk/tickets              - Create new ticket
PUT    /api/helpdesk/tickets/:ticketId/status   - Update status
PUT    /api/helpdesk/tickets/:ticketId/priority - Update priority
POST   /api/helpdesk/tickets/:ticketId/reply    - Add reply
DELETE /api/helpdesk/tickets/:ticketId    - Delete ticket
GET    /api/helpdesk/stats                - Get statistics
GET    /api/helpdesk/settings             - Get settings
PUT    /api/helpdesk/settings             - Update settings
POST   /api/helpdesk/test-email           - Test email config
```

### Email Monitoring

The system uses IMAP to monitor the inbox every 30 seconds:

1. Connects to IMAP server
2. Searches for UNSEEN emails
3. Parses email content (from, subject, body)
4. Creates ticket in database
5. Sends auto-reply to user
6. Sends notification to admin
7. Marks email as SEEN

---

## 🔐 Security Notes

1. **App Passwords**: Never use your main Gmail password. Always use App Passwords.
2. **Environment Variables**: Store sensitive credentials in `.env` file (not in code)
3. **Access Control**: Only admin and IT roles can access helpdesk
4. **Password Storage**: Email passwords are stored in MongoDB (consider encryption for production)

---

## 🐛 Troubleshooting

### Email Not Sending

**Problem**: Test email fails or auto-replies don't send

**Solutions**:
- Verify SMTP settings are correct
- Check App Password is entered without spaces
- Ensure 2-Step Verification is enabled on Gmail
- Check if "Less secure app access" is disabled (use App Password instead)
- Verify SMTP port (587 for TLS, 465 for SSL)

### Tickets Not Auto-Creating

**Problem**: Emails received but no tickets created

**Solutions**:
- Verify "Email Monitoring Active" is enabled in settings
- Check IMAP settings are correct
- Ensure IMAP email and SMTP email are the same
- Check server logs for IMAP connection errors
- Verify inbox has unread emails

### Cannot Access Helpdesk

**Problem**: Redirected to home page

**Solutions**:
- Login as admin or IT role user
- Check localStorage for `userRole` value
- Verify authentication is working

---

## 📝 Email Template Variables

Use these variables in your auto-reply template:

- `{{ticketId}}` - Unique ticket ID
- `{{subject}}` - Email subject
- `{{status}}` - Current ticket status

Example:
```
Hello,

Your support request has been received.

Ticket ID: {{ticketId}}
Subject: {{subject}}
Status: {{status}}

We'll respond within 24 hours.

Thanks,
IT Support Team
```

---

## 🎨 Customization

### Change Ticket ID Format

In settings, change **Ticket Prefix** to customize:
- `TKT` → TKT-000001
- `SUP` → SUP-000001
- `HELP` → HELP-000001

### Modify Email Templates

Edit the auto-reply template in settings to match your brand voice.

### Add Custom Categories

Edit `server/models/Ticket.ts` and add to the category enum:
```typescript
category: {
  type: String,
  enum: ["hardware", "software", "network", "access", "other", "your-category"],
  default: "other",
}
```

---

## 🚀 Production Deployment

### Environment Variables

Add to your `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
VITE_APP_URL=https://your-domain.com
```

### Email Monitoring Service

For production, consider:
1. Running email monitoring as a separate service
2. Using a queue system (Bull, RabbitMQ) for email processing
3. Implementing retry logic for failed emails
4. Adding logging and monitoring

### Scaling Considerations

- Use Redis for caching ticket data
- Implement pagination for large ticket lists
- Add database indexes for faster queries
- Consider using a dedicated email service (SendGrid, AWS SES)

---

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail IMAP Settings](https://support.google.com/mail/answer/7126229)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)

---

## 🎉 You're All Set!

Your IT Helpdesk system is now ready to handle support tickets automatically!

**Next Steps:**
1. Configure email settings
2. Test with a sample email
3. Train your team on the dashboard
4. Share support email with users

For issues or questions, check the troubleshooting section above.
