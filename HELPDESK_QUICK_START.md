# 🚀 IT Helpdesk - Quick Start Guide

## ⚡ 3-Minute Setup

### 1. Start Server
```bash
pnpm dev
```

### 2. Access Helpdesk
```
http://localhost:8080/helpdesk
```

### 3. Configure Email (First Time Only)

#### Get Gmail App Password:
1. Google Account → Security → 2-Step Verification (enable)
2. App Passwords → Mail → Other → "IT Helpdesk"
3. Copy 16-char password (remove spaces)

#### Configure in Helpdesk:
1. Click **Settings** button
2. Fill in:
   ```
   IMAP Host: imap.gmail.com
   IMAP Port: 993
   IMAP Email: support@yourcompany.com
   IMAP Password: [your-app-password]
   
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP Email: support@yourcompany.com
   SMTP Password: [your-app-password]
   
   Admin Email: admin@yourcompany.com
   ```
3. Enable **Email Monitoring Active**
4. Click **Save Settings**
5. Click **Test Email Configuration**

### 4. Test It!
- Send email to your support address
- Wait 30 seconds
- Ticket appears in dashboard! 🎉

---

## 📍 Key URLs

| Page | URL |
|------|-----|
| Dashboard | http://localhost:8080/dashboard |
| Helpdesk | http://localhost:8080/helpdesk |
| Settings | http://localhost:8080/helpdesk/settings |

---

## 🎯 Common Actions

### Create Manual Ticket
1. Click **New Ticket**
2. Fill form → **Create Ticket**

### Reply to User
1. Click eye icon on ticket
2. Type reply → **Send Reply & Email User**

### Update Status
1. Open ticket details
2. Change status dropdown
3. Auto-saves!

### Export Data
1. Click **Export** button
2. Excel file downloads

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Email not sending | Check App Password, verify SMTP settings |
| Tickets not auto-creating | Enable "Email Monitoring Active" |
| Can't access helpdesk | Login as admin or IT role |
| Test email fails | Verify 2-Step Verification enabled |

---

## 📊 Dashboard Features

- **7 Statistics Cards** - Total, Open, Pending, In Progress, Closed, High, Urgent
- **Search** - By ticket ID, subject, email, description
- **Filters** - Status and priority dropdowns
- **Export** - Download all tickets as Excel
- **Monitoring Badge** - Green = active, Gray = inactive

---

## 🎨 Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| Open | Blue | New ticket |
| Pending | Yellow | Awaiting user |
| In Progress | Purple | Being worked on |
| Closed | Green | Resolved |

---

## 🚨 Priority Levels

| Priority | Color | When to Use |
|----------|-------|-------------|
| Low | Green | Minor issues |
| Medium | Yellow | Standard requests |
| High | Orange | Important issues |
| Urgent | Red | Critical problems |

---

## 📧 Email Flow

```
User sends email
    ↓
System detects (30s)
    ↓
Ticket created
    ↓
Auto-reply sent
    ↓
Admin notified
    ↓
Shows in dashboard
```

---

## 💡 Pro Tips

1. **App Password** - Use Gmail App Password, not regular password
2. **Test First** - Always test email config before going live
3. **Monitor Badge** - Check green "Monitoring Active" badge
4. **Export Regular** - Backup tickets to Excel weekly
5. **Custom Template** - Edit auto-reply to match your brand

---

## 📚 Full Documentation

- **Setup Guide**: `HELPDESK_SETUP.md`
- **Complete Features**: `HELPDESK_COMPLETE.md`
- **Success Summary**: `HELPDESK_SUCCESS.md`

---

## ✅ Quick Checklist

- [ ] Server running (`pnpm dev`)
- [ ] Gmail App Password created
- [ ] Email settings configured
- [ ] Test email sent successfully
- [ ] Email monitoring enabled
- [ ] Test ticket created

---

## 🎉 You're Ready!

Your helpdesk is now live and ready to handle support tickets automatically!

**Need Help?** Check `HELPDESK_SETUP.md` for detailed instructions.

---

**Wyzentiqa Excellence - IT Helpdesk** 🚀
