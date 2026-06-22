# 🔄 Table Number Migration Instructions

## What This Does

This migration script updates all old table numbers in the database:
- **Old Format:** `"2"`, `"15"`, `"32"` (raw numbers)
- **New Format:** `"Table 2"`, `"Table 15"`, `"Table 32"` (formatted)
- **Unchanged:** `"Room1"`, `"Room2"`, `"IT"` (already formatted)

---

## 🚀 How to Run Migration

### Step 1: Stop the Server
```bash
# Press Ctrl+C to stop the development server
```

### Step 2: Run Migration Script
```bash
pnpm run migrate:table-numbers
```

### Step 3: Wait for Completion
The script will:
1. Connect to MongoDB
2. Find all employees with table numbers
3. Update numeric values to formatted values
4. Show summary of changes
5. Disconnect from MongoDB

### Step 4: Restart Server
```bash
pnpm dev
```

---

## 📊 Expected Output

```
🔄 Starting table number migration...

📡 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Found 25 employees with table numbers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 MIGRATION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Updated: 20 employees
⏭️  Skipped: 5 employees (already formatted or room/location)

📝 UPDATED RECORDS:

1. John Doe
   Old: "2" → New: "Table 2"
2. Jane Smith
   Old: "15" → New: "Table 15"
3. Bob Johnson
   Old: "32" → New: "Table 32"
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Migration completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Disconnected from MongoDB
```

---

## ✅ What Gets Updated

### Numeric Table Numbers
```
"1" → "Table 1"
"2" → "Table 2"
"15" → "Table 15"
"32" → "Table 32"
```

### Room/Location (Unchanged)
```
"Room1" → "Room1" (skipped)
"Room2" → "Room2" (skipped)
"IT" → "IT" (skipped)
```

### Already Formatted (Unchanged)
```
"Table 5" → "Table 5" (skipped)
"Table 10" → "Table 10" (skipped)
```

---

## 🔍 Verify Migration

### Check Database
```javascript
// MongoDB Compass or terminal
db.employees.find({ tableNumber: { $exists: true } })

// Should show:
// { tableNumber: "Table 2" }  ✅
// { tableNumber: "Room1" }    ✅
// { tableNumber: "IT" }       ✅
```

### Check UI
1. Open HR Dashboard
2. Click on any employee
3. Table number should show: "Table 2" (not "2")

---

## ⚠️ Important Notes

### Safe to Run Multiple Times
- Script checks if value is already formatted
- Won't duplicate "Table" prefix
- Skips already migrated records

### Backup Recommended
Before running migration:
```bash
# MongoDB backup command
mongodump --uri="your-mongodb-uri" --out=backup-before-migration
```

### Rollback (If Needed)
To revert changes:
```javascript
// MongoDB query to remove "Table " prefix
db.employees.find({ tableNumber: { $regex: /^Table \d+$/ } }).forEach(function(doc) {
  const num = doc.tableNumber.replace("Table ", "");
  db.employees.updateOne(
    { _id: doc._id },
    { $set: { tableNumber: num } }
  );
});
```

---

## 🐛 Troubleshooting

### Error: "MONGODB_URI not found"
**Solution:** Check `.env` file has `MONGODB_URI` set

### Error: "Cannot connect to MongoDB"
**Solution:** 
1. Check MongoDB is running
2. Check connection string is correct
3. Check network/firewall settings

### Error: "Permission denied"
**Solution:** Make sure you have write access to database

---

## 📝 Summary

**Command:** `pnpm run migrate:table-numbers`  
**Duration:** ~5-10 seconds (depends on number of employees)  
**Safe:** Yes, can run multiple times  
**Backup:** Recommended but not required  
**Rollback:** Possible (see above)

---

**Created:** May 27, 2026  
**Status:** ✅ Ready to Run  
**Impact:** Updates all numeric table numbers to formatted values
