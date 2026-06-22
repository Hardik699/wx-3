# 📧 Email Styling Guide

## Overview

The IT Helpdesk email system has been completely redesigned with modern, professional, and responsive email templates. All emails now feature:

- ✨ **Modern Design**: Clean, professional layouts with gradient headers
- 📱 **Responsive**: Optimized for all devices (desktop, tablet, mobile)
- 🎨 **Consistent Branding**: Unified color scheme and typography
- 🔔 **Status Indicators**: Visual badges for ticket status
- 💌 **Better UX**: Clear call-to-action buttons and improved readability

---

## Email Templates

### 1. Auto-Reply Email (User Confirmation)

**Sent when**: A new ticket is created from an email

**Features**:
- Purple gradient header with ticket icon
- Dynamic status badge (Open/In Progress/Resolved)
- Ticket ID and subject in a clean info card
- Customizable message template
- "View Ticket Status" button
- Professional footer

**Status Colors**:
- 🟢 **Open**: Green (#10b981)
- 🟡 **In Progress**: Amber (#f59e0b)
- 🔵 **Resolved**: Indigo (#6366f1)

**Template Variables**:
- `{{ticketId}}` - Ticket ID
- `{{subject}}` - Ticket subject
- `{{status}}` - Current status

---

### 2. Admin Notification Email

**Sent when**: A new ticket is created

**Features**:
- Orange gradient header with alert icon
- "Action Required" badge
- Comprehensive ticket details table
- Clickable email link for user
- Full description display
- Timestamp with formatted date/time
- "View Ticket" button

**Includes**:
- Ticket ID (monospace font)
- User email (clickable mailto link)
- Subject line
- Full description
- Received timestamp

---

### 3. Reply Email (Support Response)

**Sent when**: Admin replies to a ticket

**Features**:
- Purple gradient header
- Active status indicator
- Ticket reference card
- Admin profile section with avatar initial
- Reply message in highlighted box
- "Reply to Ticket" call-to-action
- "View Full Ticket History" button

**Special Elements**:
- Admin avatar circle with initial
- Admin name and role display
- Yellow info box encouraging replies
- Direct mailto link for easy response

---

### 4. Status Update Email (NEW!)

**Sent when**: Ticket status changes

**Features**:
- Indigo gradient header
- Visual status transition (Old → New)
- Status icons and colors
- Ticket information card
- Updated by information
- "View Ticket Details" button

**Status Indicators**:
- 🟢 Open
- 🟡 In Progress
- 🔵 Resolved
- ⚫ Closed

---

## Design System

### Color Palette

```css
/* Primary Gradients */
Purple: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Orange: linear-gradient(135deg, #f59e0b 0%, #d97706 100%)
Indigo: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)
Violet: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)

/* Status Colors */
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Info: #6366f1 (Indigo)
Neutral: #6b7280 (Gray)

/* Background Colors */
Light Gray: #f3f4f6
Card Background: #f9fafb
White: #ffffff
Dark Footer: #1f2937

/* Text Colors */
Primary: #111827
Secondary: #374151
Muted: #6b7280
Light: #9ca3af
```

### Typography

```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Font Sizes */
Heading 1: 28px (bold, -0.5px letter-spacing)
Heading 2: 20px (bold)
Heading 3: 16px (bold)
Body: 15px (line-height: 1.8)
Small: 13px
Tiny: 12px

/* Monospace (for Ticket IDs) */
font-family: 'Courier New', monospace;
```

### Spacing

```css
/* Padding */
Container: 40px 20px
Card: 30px
Section: 20px 30px
Button: 14px 32px
Badge: 8px 20px

/* Border Radius */
Container: 16px
Card: 12px
Button: 8px
Badge: 20px (pill shape)
Avatar: 50% (circle)
```

### Shadows

```css
/* Box Shadows */
Container: 0 10px 25px rgba(0, 0, 0, 0.1)
Card: 0 2px 8px rgba(0, 0, 0, 0.05)
Button: 0 4px 12px rgba(139, 92, 246, 0.3)
```

---

## Email Structure

All emails follow this consistent structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Title</title>
</head>
<body>
  <table role="presentation"> <!-- Outer container -->
    <tr>
      <td align="center">
        <table role="presentation"> <!-- Inner content -->
          
          <!-- Header Section -->
          <tr><td>Gradient header with title</td></tr>
          
          <!-- Badge Section (optional) -->
          <tr><td>Status or action badge</td></tr>
          
          <!-- Content Section -->
          <tr><td>Main content area</td></tr>
          
          <!-- Action Section -->
          <tr><td>Call-to-action buttons</td></tr>
          
          <!-- Footer Section -->
          <tr><td>Dark footer with copyright</td></tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Responsive Design

### Mobile Optimization

All emails are optimized for mobile devices:

- **Max Width**: 600px for desktop, 100% for mobile
- **Padding**: Responsive padding that adjusts for smaller screens
- **Font Sizes**: Readable on all devices
- **Buttons**: Touch-friendly size (minimum 44px height)
- **Tables**: Use `role="presentation"` for layout tables

### Email Client Compatibility

Tested and optimized for:
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Web, Desktop)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ Thunderbird

---

## Usage Examples

### Sending Auto-Reply

```typescript
import { sendAutoReply } from './services/emailService';

await sendAutoReply(
  'user@example.com',
  'TKT-2024-001',
  'Cannot access VPN',
  'open'
);
```

### Sending Admin Notification

```typescript
import { sendAdminNotification } from './services/emailService';

await sendAdminNotification(
  'TKT-2024-001',
  'Cannot access VPN',
  'user@example.com',
  'I am unable to connect to the company VPN...'
);
```

### Sending Reply Email

```typescript
import { sendReplyEmail } from './services/emailService';

await sendReplyEmail(
  'user@example.com',
  'TKT-2024-001',
  'Cannot access VPN',
  'We have reset your VPN credentials. Please try again.',
  'John Doe'
);
```

### Sending Status Update (NEW!)

```typescript
import { sendStatusUpdateEmail } from './services/emailService';

await sendStatusUpdateEmail(
  'user@example.com',
  'TKT-2024-001',
  'Cannot access VPN',
  'open',
  'resolved',
  'John Doe'
);
```

---

## Customization

### Changing Colors

Edit the gradient and color values in `server/services/emailService.ts`:

```typescript
// Example: Change header gradient
style="background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);"
```

### Updating Templates

Each email function contains its HTML template. Modify the template string to customize:

1. **Auto-Reply**: `sendAutoReply()` function
2. **Admin Notification**: `sendAdminNotification()` function
3. **Reply Email**: `sendReplyEmail()` function
4. **Status Update**: `sendStatusUpdateEmail()` function

### Adding New Email Types

Follow this pattern:

```typescript
export async function sendCustomEmail(
  recipient: string,
  subject: string,
  // ... other parameters
) {
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <!-- Your email template here -->
      </html>
    `;

    return await sendEmail(recipient, subject, html);
  } catch (error) {
    console.error("Error sending custom email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
```

---

## Best Practices

### ✅ Do's

- Use table-based layouts for maximum compatibility
- Include `role="presentation"` on layout tables
- Use inline CSS styles (no external stylesheets)
- Test emails in multiple clients before deploying
- Keep email width under 600px
- Use web-safe fonts
- Include alt text for images
- Provide plain text fallback

### ❌ Don'ts

- Don't use JavaScript
- Don't use external CSS files
- Don't use background images (limited support)
- Don't use complex CSS (flexbox, grid)
- Don't use forms in emails
- Don't use video or audio elements
- Don't rely on hover effects

---

## Testing

### Manual Testing

1. Send test emails to yourself
2. Check on multiple devices (desktop, mobile, tablet)
3. Test in different email clients
4. Verify all links work correctly
5. Check responsive behavior

### Automated Testing

Use services like:
- [Litmus](https://litmus.com/)
- [Email on Acid](https://www.emailonacid.com/)
- [Mailtrap](https://mailtrap.io/)

---

## Troubleshooting

### Images Not Displaying

- Ensure images are hosted on a public server
- Use absolute URLs (not relative paths)
- Include alt text for accessibility

### Layout Broken in Outlook

- Use table-based layouts
- Avoid CSS that Outlook doesn't support
- Test specifically in Outlook Desktop

### Buttons Not Clickable on Mobile

- Ensure minimum touch target size (44x44px)
- Add padding around buttons
- Use `display: inline-block` for buttons

### Fonts Not Rendering

- Stick to web-safe fonts
- Provide fallback fonts
- Use system font stack

---

## Environment Variables

Configure these in your `.env` file:

```env
# Application URL (for email links)
VITE_APP_URL=https://your-domain.com

# SMTP Configuration
HELPDESK_SMTP_HOST=smtp.gmail.com
HELPDESK_SMTP_PORT=587
HELPDESK_SMTP_USER=support@yourcompany.com
HELPDESK_SMTP_PASSWORD=your_app_password

# Admin Email
HELPDESK_ADMIN_EMAIL=admin@yourcompany.com
```

---

## Support

For issues or questions about the email system:

1. Check the console logs for error messages
2. Verify SMTP configuration in Helpdesk Settings
3. Test email connectivity using the settings UI
4. Review this guide for best practices

---

**Last Updated**: May 22, 2026  
**Version**: 2.0  
**Maintained by**: Wyzentiqa Excellence IT Team
