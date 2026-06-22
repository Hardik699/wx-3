import { Router, RequestHandler } from "express";
import { ITAccount } from "../models/ITAccount";
import { Employee } from "../models/Employee";

const router = Router();

// Fix existing IT records to use proper employeeId instead of MongoDB _id
const fixITRecords: RequestHandler = async (_req, res) => {
  try {
    // Get all IT accounts
    const itAccounts = await ITAccount.find();
    const employees = await Employee.find();
    
    let fixed = 0;
    let errors = 0;
    const updates = [];

    for (const itAccount of itAccounts) {
      // Check if employeeId looks like a MongoDB _id (24 hex characters)
      const isMongoId = /^[a-f0-9]{24}$/i.test(itAccount.employeeId);
      
      if (isMongoId) {
        // Find the employee by MongoDB _id
        const employee = employees.find(emp => emp._id.toString() === itAccount.employeeId);
        
        if (employee && employee.employeeId) {
          // Update the IT account with the correct employeeId
          itAccount.employeeId = employee.employeeId;
          await itAccount.save();
          fixed++;
          updates.push({
            itAccountId: itAccount._id,
            oldEmployeeId: itAccount.employeeId,
            newEmployeeId: employee.employeeId,
            employeeName: employee.fullName
          });
        } else {
          errors++;
          console.error(`Could not find employee for IT account ${itAccount._id}`);
        }
      }
    }

    res.json({
      success: true,
      message: `Fixed ${fixed} IT records, ${errors} errors`,
      fixed,
      errors,
      updates,
      totalRecords: itAccounts.length
    });
  } catch (error) {
    console.error("Error fixing IT records:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fix IT records"
    });
  }
};

router.post("/", fixITRecords);

export { router as fixITRecordsRouter };
