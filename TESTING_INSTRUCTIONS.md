# 🧪 Testing Instructions - Wyzentiqa Xcellence Branding

## ✅ Branding Update Complete

All occurrences of "Excellence" have been changed to "Xcellence" across the entire codebase.

---

## 🚀 Step 1: Restart the Server

The server MUST be restarted for changes to take effect:

### Option A: Simple Restart
```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
pnpm dev
```

### Option B: Complete Restart (Recommended)
```bash
# Kill all node processes
pkill -f node

# Clear Vite cache (optional but recommended)
rm -rf node_modules/.vite

# Restart development server
pnpm dev
```

### Option C: Windows PowerShell
```powershell
# Stop all node processes
Get-Process node | Stop-Process -Force

# Restart
pnpm dev
```

---

## 🔍 Step 2: Verify Console Log

When the server starts, you should see:
```
✅ Server running on port 8080
✅ MongoDB connected
```

When a ticket is created, you should see:
```
🎨 Using NEW Wyzentiqa email template design!
```

---

## 📧 Step 3: Test Email Templates

### Test Auto-Reply Email

1. **Create a new ticket** via the helpdesk form
2. **Check the email** sent to the user
3. **Verify these elements:**
   - ✅ From: "Wyzentiqa Xcellence"
   - ✅ Header: "WYZENTIQA XCELLENCE" (green text)
   - ✅ Subtitle: "Wyzentiqa Xcellence - IT Helpdesk Support"
   - ✅ Message: "Thank you for contacting Wyzentiqa Xcellence IT Helpdesk"
   - ✅ Signature: "Wyzentiqa Xcellence IT Support Team"
   - ✅ Footer: "© 2026 Wyzentiqa Xcellence. All rights reserved."

### Test Admin Notification Email

1. **Create a new ticket**
2. **Check admin email** (hardikmachhi699@gmail.com)
3. **Verify these elements:**
   - ✅ Footer: "Wyzentiqa Xcellence Helpdesk system"
   - ✅ Copyright: "© 2026 Wyzentiqa Xcellence"

### Test Reply Email

1. **Reply to a ticket** from admin dashboard
2. **Check user email**
3. **Verify these elements:**
   - ✅ Header: "💬 Wyzentiqa Xcellence Reply"
   - ✅ Subtitle: "Your Wyzentiqa Xcellence support team has responded"
   - ✅ Team label: "Wyzentiqa Xcellence - IT Support Team"
   - ✅ Footer: "© 2026 Wyzentiqa Xcellence"

### Test Status Update Email

1. **Change ticket status** (e.g., Open → In Progress)
2. **Check user email**
3. **Verify these elements:**
   - ✅ Footer: "Wyzentiqa Xcellence Helpdesk system"
   - ✅ Copyright: "© 2026 Wyzentiqa Xcellence"

---

## 🖥️ Step 4: Test UI Components

### Navigation Header
1. **Open any page** in the application
2. **Check top navigation bar**
3. **Verify:** "Wyzentiqa Xcellence" appears in cyan color

### Payslip Page
1. **Go to:** Employee Details → Salary Records → View Payslip
2. **Check header**
3. **Verify:** "WYZENTIQA XCELLENCE" appears at the top

### Employee Details Page
1. **Go to:** Admin Dashboard → Employees → View Details
2. **Generate a payslip PDF**
3. **Check PDF header**
4. **Verify:** "WYZENTIQA XCELLENCE" appears in the PDF

---

## ⚠️ Important Notes

### What Changed
- ✅ All "Excellence" → "Xcellence"
- ✅ Spelling: "Wyzentiqa Xcellence" (X not E, double c)
- ✅ 11 files updated
- ✅ 25+ occurrences changed

### What Did NOT Change
- ✅ Email addresses remain: `itsupport@wyzentiqa.com`, `helpdesk@wyzentiqa.com`
- ✅ Domain names remain: `mail.wyzentiqa.com`, `wyzentiqa.com`
- ✅ Functionality remains exactly the same
- ✅ Database structure unchanged

### Common Issues

#### Issue: Old email format still appearing
**Solution:**
1. Make sure server is completely restarted
2. Check console for: `🎨 Using NEW Wyzentiqa email template design!`
3. Create a NEW ticket (don't check old emails)
4. Clear browser cache if needed

#### Issue: Console log not appearing
**Solution:**
1. Kill all node processes: `pkill -f node`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Restart: `pnpm dev`

#### Issue: UI still shows "Excellence"
**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Restart server

---

## ✅ Verification Checklist

Use this checklist to verify all changes:

### Email Templates
- [ ] Auto-reply shows "Wyzentiqa Xcellence"
- [ ] Admin notification shows "Wyzentiqa Xcellence"
- [ ] Reply email shows "Wyzentiqa Xcellence"
- [ ] Status update shows "Wyzentiqa Xcellence"
- [ ] Console log appears: `🎨 Using NEW Wyzentiqa email template design!`

### UI Components
- [ ] Navigation header shows "Wyzentiqa Xcellence"
- [ ] Payslip page shows "WYZENTIQA XCELLENCE"
- [ ] Employee details shows "WYZENTIQA XCELLENCE"
- [ ] PDF payslips show "WYZENTIQA XCELLENCE"

### Code Verification
- [ ] No "Excellence" in `.ts` files
- [ ] No "Excellence" in `.tsx` files
- [ ] No "Excellence" in `.yaml` files
- [ ] Service name updated in `render.yaml`

---

## 📞 Support

If you encounter any issues:

1. **Check console logs** for errors
2. **Verify server restart** was successful
3. **Test with NEW tickets** (not old emails)
4. **Clear browser cache** and hard refresh

---

**Update Date:** May 22, 2026  
**Status:** ✅ Ready for Testing  
**Branding:** Wyzentiqa Xcellence (Official)
