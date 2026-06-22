# IT Email Notification System

## Overview
When a new employee is added through the HR Dashboard, an automatic email notification is sent to the IT department admin to set up the new employee's workstation and accounts.

## How It Works

### 1. **Email Configuration**
The IT notification emails are sent using the same email configuration as the helpdesk system. The email is sent to the admin email address configured in the helpdesk settings.

### 2. **Email Configuration Location**
Email settings are stored in MongoDB in the `HelpdeskSettings` collection:
- **SMTP Host**: Gmail SMTP server (smtp.gmail.com)
- **SMTP Port**: 587
- **SMTP User**: Your Gmail address
- **SMTP Password**: Gmail App Password (NOT your regular password)
- **Admin Email**: The IT department email where notifications will be sent

### 3. **Setup Instructions**

#### Step 1: Configure Email Settings
1. Go to the Helpdesk Settings page in your application
2. Enter your email configuration:
   - **SMTP User**: your-email@gmail.com
   - **SMTP Password**: Your Gmail App Password (see below)
   - **Admin Email**: it-department@wyzentiqa.com (or your IT email)

#### Step 2: Create Gmail App Password
Since Gmail requires App Passwords for third-party applications:

1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled
4. After enabling 2FA, go back to Security
5. Click on "App passwords" (you'll see this only after enabling 2FA)
6. Select "Mail" and "Other (Custom name)"
7. Enter "Wyzentiqa Xcellencce" as the name
8. Click "Generate"
9. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)
10. Use this password in the SMTP Password field (remove spaces)

#### Step 3: Test Email Configuration
1. In Helpdesk Settings, click "Test Email Configuration"
2. Check if you receive a test email
3. If successful, the IT notification system is ready!

### 4. **When Emails Are Sent**
An IT notification email is automatically sent when:
- A new employee is added through the HR Dashboard
- The employee has all required information filled in
- Email configuration is properly set up in helpdesk settings

### 5. **Email Content**
The IT notification email includes:
- **Employee ID**: Unique identifier (e.g., WX-EMP-0001)
- **Full Name**: Employee's full name
- **Department**: Which department they belong to
- **Table Number**: Assigned workstation location
- **Email**: Employee's email address
- **IT Setup Checklist**: 
  - Create email account
  - Setup workstation
  - Install required software
  - Configure network access
  - Provide login credentials
  - Complete orientation

### 6. **Troubleshooting**

#### Email Not Sending?
1. **Check Email Configuration**:
   ```bash
   # Run this script to check your configuration
   pnpm run check-config
   ```

2. **Verify Gmail App Password**:
   - Make sure you're using an App Password, not your regular Gmail password
   - App Password should be 16 characters without spaces
   - 2-Factor Authentication must be enabled on your Gmail account

3. **Check Admin Email**:
   - Verify the admin email is correctly set in helpdesk settings
   - This is where IT notifications will be sent

4. **Check Server Logs**:
   - Look for error messages in the server console
   - Check for "Error sending IT notification" messages

5. **Test Email Service**:
   ```bash
   # Test if email service is working
   pnpm run test-email
   ```

#### Common Errors:

**"Email configuration not found"**
- Solution: Configure email settings in Helpdesk Settings page

**"Invalid login: 535-5.7.8 Username and Password not accepted"**
- Solution: Use Gmail App Password instead of regular password
- Make sure 2FA is enabled on your Gmail account

**"IT notification email not configured"**
- Solution: Set the Admin Email in Helpdesk Settings

**"Connection timeout"**
- Solution: Check your internet connection
- Verify SMTP host and port are correct (smtp.gmail.com:587)

### 7. **API Endpoint**
The IT notification system uses this API endpoint:
```
POST /api/employees/notify-it
```

**Request Body:**
```json
{
  "employeeId": "WX-EMP-0001",
  "employeeName": "John Doe",
  "department": "Engineering",
  "tableNumber": "Table 2",
  "email": "john.doe@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "IT notification email sent successfully"
}
```

### 8. **Testing the System**

1. **Add a Test Employee**:
   - Go to HR Dashboard
   - Click "Add New Employee"
   - Fill in all required fields
   - Click "Add Employee"

2. **Check Email**:
   - Check the admin email inbox
   - You should receive an email with subject: "🖥️ New Employee IT Setup Required: [Name] [ID]"

3. **Check Console Logs**:
   - Server console should show: "✅ IT notification email sent successfully"
   - If failed: "⚠️ IT notification email failed: [error message]"

### 9. **Email Template**
The IT notification email uses a modern, professional template with:
- Wyzentiqa Xcellencce branding
- Employee details in a clean card layout
- IT setup checklist
- Direct link to IT Dashboard
- Responsive design for mobile devices

### 10. **Important Notes**
- Email sending does NOT block employee creation
- If email fails, the employee is still created successfully
- Email failures are logged but don't show error to user
- Both localStorage notification AND email are sent
- Email is sent to the admin email configured in helpdesk settings

## Summary
The IT notification email system automatically alerts the IT department when new employees are added, ensuring timely setup of workstations and accounts. The system uses Gmail SMTP with App Passwords for secure email delivery.
