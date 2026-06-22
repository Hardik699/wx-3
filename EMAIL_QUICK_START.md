# 🚀 Email System Quick Start Guide

## Get Started in 5 Minutes

---

## 📋 Prerequisites

Make sure your `.env` file has these configured:

```env
# SMTP Configuration
HELPDESK_SMTP_HOST=smtp.gmail.com
HELPDESK_SMTP_PORT=587
HELPDESK_SMTP_USER=support@yourcompany.com
HELPDESK_SMTP_PASSWORD=your_app_password

# Admin Email
HELPDESK_ADMIN_EMAIL=admin@yourcompany.com

# Application URL
VITE_APP_URL=http://localhost:8080
```

---

## 🎯 Quick Examples

### 1. Send Auto-Reply Email

When a user creates a ticket, send them a confirmation:

```typescript
import { sendAutoReply } from './services/emailService';

// Send auto-reply
const result = await sendAutoReply(
  'user@example.com',      // User's email
  'TKT-2024-001',          // Ticket ID
  'Cannot access VPN',     // Subject
  'open'                   // Status: 'open', 'in-progress', 'resolved', 'closed'
);

if (result.success) {
  console.log('✅ Auto-reply sent!');
} else {
  console.error('❌ Error:', result.error);
}
```

**Result**: User receives a beautiful purple-themed confirmation email with their ticket details.

---

### 2. Notify Admin of New Ticket

Alert admins when a new ticket is created:

```typescript
import { sendAdminNotification } from './services/emailService';

// Notify admin
const result = await sendAdminNotification(
  'TKT-2024-001',                    // Ticket ID
  'Cannot access VPN',               // Subject
  'user@example.com',                // User's email
  'I am unable to connect to the company VPN. Getting error "Connection timeout".'
);

if (result.success) {
  console.log('✅ Admin notified!');
}
```

**Result**: Admin receives an orange-themed alert email with full ticket details.

---

### 3. Send Reply to User

When admin responds to a ticket:

```typescript
import { sendReplyEmail } from './services/emailService';

// Send reply
const result = await sendReplyEmail(
  'user@example.com',                // User's email
  'TKT-2024-001',                    // Ticket ID
  'Cannot access VPN',               // Subject
  'We have reset your VPN credentials. Please try logging in again with your existing password.',
  'John Doe'                         // Admin name
);

if (result.success) {
  console.log('✅ Reply sent!');
}
```

**Result**: User receives a purple-themed reply with admin's message and profile.

---

### 4. Send Status Update (NEW!)

When ticket status changes:

```typescript
import { sendStatusUpdateEmail } from './services/emailService';

// Send status update
const result = await sendStatusUpdateEmail(
  'user@example.com',      // User's email
  'TKT-2024-001',          // Ticket ID
  'Cannot access VPN',     // Subject
  'open',                  // Old status
  'resolved',              // New status
  'John Doe'               // Who updated it
);

if (result.success) {
  console.log('✅ Status update sent!');
}
```

**Result**: User receives an indigo-themed email showing the status transition.

---

## 🔧 Integration Examples

### In Your Ticket Creation Handler

```typescript
// server/routes/tickets.ts
import { sendAutoReply, sendAdminNotification } from '../services/emailService';

app.post('/api/tickets', async (req, res) => {
  try {
    // Create ticket
    const ticket = await Ticket.create({
      ticketId: 'TKT-2024-001',
      subject: req.body.subject,
      description: req.body.description,
      userEmail: req.body.email,
      status: 'open'
    });

    // Send auto-reply to user
    await sendAutoReply(
      ticket.userEmail,
      ticket.ticketId,
      ticket.subject,
      ticket.status
    );

    // Notify admin
    await sendAdminNotification(
      ticket.ticketId,
      ticket.subject,
      ticket.userEmail,
      ticket.description
    );

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});
```

---

### In Your Reply Handler

```typescript
// server/routes/tickets.ts
import { sendReplyEmail } from '../services/emailService';

app.post('/api/tickets/:id/reply', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.id });
    
    // Save reply to database
    await ticket.addReply({
      message: req.body.message,
      adminName: req.body.adminName
    });

    // Send email to user
    await sendReplyEmail(
      ticket.userEmail,
      ticket.ticketId,
      ticket.subject,
      req.body.message,
      req.body.adminName
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reply' });
  }
});
```

---

### In Your Status Update Handler

```typescript
// server/routes/tickets.ts
import { sendStatusUpdateEmail } from '../services/emailService';

app.patch('/api/tickets/:id/status', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.id });
    const oldStatus = ticket.status;
    
    // Update status
    ticket.status = req.body.status;
    await ticket.save();

    // Send status update email
    await sendStatusUpdateEmail(
      ticket.userEmail,
      ticket.ticketId,
      ticket.subject,
      oldStatus,
      req.body.status,
      req.body.updatedBy
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});
```

---

## 🎨 Customization Quick Tips

### Change Header Color

```typescript
// In emailService.ts, find the header section:
style="background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);"
```

### Change Button Color

```typescript
// Find the button section:
style="background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);"
```

### Change Status Badge Colors

```typescript
// In sendAutoReply function:
const statusColor = status === 'open' ? '#YOUR_COLOR' : ...;
const statusBg = status === 'open' ? '#YOUR_BG_COLOR' : ...;
```

---

## 🧪 Testing Your Emails

### Test All Email Types

```typescript
// test-emails.ts
import { 
  sendAutoReply, 
  sendAdminNotification, 
  sendReplyEmail,
  sendStatusUpdateEmail 
} from './services/emailService';

async function testEmails() {
  const testEmail = 'your-email@example.com';
  
  console.log('📧 Testing Auto-Reply...');
  await sendAutoReply(testEmail, 'TKT-TEST-001', 'Test Ticket', 'open');
  
  console.log('📧 Testing Admin Notification...');
  await sendAdminNotification('TKT-TEST-001', 'Test Ticket', testEmail, 'Test description');
  
  console.log('📧 Testing Reply Email...');
  await sendReplyEmail(testEmail, 'TKT-TEST-001', 'Test Ticket', 'Test reply message', 'Test Admin');
  
  console.log('📧 Testing Status Update...');
  await sendStatusUpdateEmail(testEmail, 'TKT-TEST-001', 'Test Ticket', 'open', 'resolved', 'Test Admin');
  
  console.log('✅ All test emails sent!');
}

testEmails();
```

Run with:
```bash
pnpm tsx test-emails.ts
```

---

## 🔍 Troubleshooting

### Emails Not Sending?

1. **Check SMTP Configuration**
   ```typescript
   // Verify in Helpdesk Settings UI or database
   const settings = await HelpdeskSettings.findOne();
   console.log(settings.emailConfig);
   ```

2. **Check Console Logs**
   ```typescript
   // Look for error messages
   console.error("Error sending email:", error);
   ```

3. **Test SMTP Connection**
   ```typescript
   import { createTransporter } from './services/emailService';
   
   const transporter = await createTransporter();
   await transporter.verify();
   console.log('✅ SMTP connection successful!');
   ```

### Emails Look Broken?

1. **Check Email Client**: Some clients have limited CSS support
2. **Test in Gmail**: Best compatibility
3. **View Source**: Check if HTML is correct
4. **Clear Cache**: Email clients cache images

### Links Not Working?

1. **Check VITE_APP_URL**: Must be set correctly
   ```env
   VITE_APP_URL=https://your-domain.com
   ```

2. **Use Absolute URLs**: Never use relative paths
   ```typescript
   // ✅ Good
   href="https://your-domain.com/helpdesk"
   
   // ❌ Bad
   href="/helpdesk"
   ```

---

## 📊 Status Reference

### Available Status Values

```typescript
type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
```

### Status Colors

| Status | Color | Background | Icon |
|--------|-------|------------|------|
| open | #10b981 | #d1fae5 | 🟢 |
| in-progress | #f59e0b | #fef3c7 | 🟡 |
| resolved | #6366f1 | #e0e7ff | 🔵 |
| closed | #6b7280 | #f3f4f6 | ⚫ |

---

## 🎯 Best Practices

### ✅ Do's

- ✅ Always handle errors gracefully
- ✅ Log email sending results
- ✅ Test emails before production
- ✅ Use environment variables for configuration
- ✅ Validate email addresses before sending
- ✅ Include unsubscribe options (if required)

### ❌ Don'ts

- ❌ Don't send emails in loops without rate limiting
- ❌ Don't expose SMTP credentials in client code
- ❌ Don't send emails without user consent
- ❌ Don't use relative URLs in emails
- ❌ Don't forget to handle async errors

---

## 📚 Additional Resources

- **EMAIL_STYLING_GUIDE.md** - Complete styling documentation
- **EMAIL_IMPROVEMENTS_SUMMARY.md** - What was improved
- **EMAIL_PREVIEW.md** - Visual preview of all templates
- **server/services/emailService.ts** - Source code

---

## 🆘 Need Help?

1. Check the console logs for errors
2. Verify SMTP configuration in Helpdesk Settings
3. Test with a simple email first
4. Review the EMAIL_STYLING_GUIDE.md
5. Check email client compatibility

---

## ✨ Quick Wins

### 1. Test Immediately
```bash
# Send yourself a test email
pnpm tsx test-emails.ts
```

### 2. Customize Colors
```typescript
// Change to your brand colors in 5 minutes
```

### 3. Add to Existing Routes
```typescript
// Just import and call the functions
```

### 4. Monitor Results
```typescript
// Check success/error responses
```

---

**You're all set!** 🎉

Start sending beautiful, professional emails in minutes!

---

**Last Updated**: May 22, 2026  
**Version**: 2.0  
**Status**: ✅ Production Ready
