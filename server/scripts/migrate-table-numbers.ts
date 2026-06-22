import mongoose from "mongoose";
import { Employee } from "../models/Employee";
import "dotenv/config";

/**
 * Migration Script: Update Table Numbers
 * 
 * This script updates all numeric table numbers (e.g., "2", "15") 
 * to formatted values (e.g., "Table 2", "Table 15")
 * 
 * Room/Location values (Room1, Room2, IT) are left unchanged.
 */

async function migrateTableNumbers() {
  try {
    console.log("🔄 Starting table number migration...\n");

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Find all employees with numeric table numbers
    const employees = await Employee.find({
      tableNumber: { $exists: true, $ne: null, $ne: "" }
    });

    console.log(`📊 Found ${employees.length} employees with table numbers\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    const updates: Array<{ old: string; new: string; name: string }> = [];

    for (const employee of employees) {
      const tableNum = employee.tableNumber;
      
      // Skip if already formatted or is a room/location
      if (
        tableNum.startsWith("Table ") ||
        ["Room1", "Room2", "IT"].includes(tableNum)
      ) {
        skippedCount++;
        continue;
      }

      // Check if it's a pure number
      const num = parseInt(tableNum, 10);
      if (!Number.isNaN(num) && String(num) === tableNum) {
        // Update to formatted value
        const newValue = `Table ${num}`;
        employee.tableNumber = newValue;
        await employee.save();
        
        updates.push({
          old: tableNum,
          new: newValue,
          name: employee.fullName
        });
        
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 MIGRATION SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log(`✅ Updated: ${updatedCount} employees`);
    console.log(`⏭️  Skipped: ${skippedCount} employees (already formatted or room/location)\n`);

    if (updates.length > 0) {
      console.log("📝 UPDATED RECORDS:\n");
      updates.forEach((update, index) => {
        console.log(`${index + 1}. ${update.name}`);
        console.log(`   Old: "${update.old}" → New: "${update.new}"`);
      });
      console.log();
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Migration completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateTableNumbers();
