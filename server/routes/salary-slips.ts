import { Router, RequestHandler } from "express";
import { Employee } from "../models/Employee";
import { SalaryRecord } from "../models/SalaryRecord";
import { LeaveRecord } from "../models/LeaveRecord";
import { Settings } from "../models/Settings";
import archiver from "archiver";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

const router = Router();

// Helper function to convert number to words
function numToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return '';
  let words = '';

  if (num >= 10000000) {
    words += numToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    words += numToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    words += numToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num >= 10) {
    words += teens[num - 10] + ' ';
    return words;
  }
  if (num > 0) {
    words += ones[num] + ' ';
  }
  return words;
}

function convertNumberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  return numToWords(num).trim() + ' Rupees Only';
}

// Generate HTML for payslip - exact same format as Payslip component
async function generatePayslipHTML(employee: any, salaryRecord: any, leaveRecord: any, month: string): Promise<string> {
  const formatCurrency = (val: number) => Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const monthDate = new Date(month + '-01');
  const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDateToDDMMYYYY = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "N/A";
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  // Fetch logo from database
  let logoDataUrl = "";
  try {
    const logoSetting = await Settings.findOne({ key: "company-logo" });
    if (logoSetting && logoSetting.value) {
      logoDataUrl = logoSetting.value;
    }
  } catch (error) {
    console.error("Failed to fetch logo:", error);
  }

  const leaves = [
    { type: 'PL', total: leaveRecord?.plTotalLeaveInAccount || 0, availed: leaveRecord?.plLeaveAvailed || 0, subsisting: leaveRecord?.plSubsistingLeave || 0, lwp: leaveRecord?.plLwp || 0 },
    { type: 'CL', total: leaveRecord?.clTotalLeaveInAccount || 0, availed: leaveRecord?.clLeaveAvailed || 0, subsisting: leaveRecord?.clSubsistingLeave || 0, lwp: leaveRecord?.clLwp || 0 },
    { type: 'SL', total: leaveRecord?.slTotalLeaveInAccount || 0, availed: leaveRecord?.slLeaveAvailed || 0, subsisting: leaveRecord?.slSubsistingLeave || 0, lwp: leaveRecord?.slLwp || 0 }
  ];

  const totalLeavesTaken = (leaveRecord?.plLeaveAvailed || 0) + (leaveRecord?.clLeaveAvailed || 0) + (leaveRecord?.slLeaveAvailed || 0);
  const totalLwp = (leaveRecord?.plLwp || 0) + (leaveRecord?.clLwp || 0) + (leaveRecord?.slLwp || 0);

  // Premium Professional Styling - Enhanced
  const TH_DARK = `background:#6b7280;color:#ffffff;font-weight:700;font-size:11px;text-transform:uppercase;text-align:center;padding:12px 10px;border:2px solid #4b5563;vertical-align:middle;letter-spacing:0.5px;`;
  const TH_LIGHT = `background:#9ca3af;color:#ffffff;font-weight:700;font-size:11px;text-transform:uppercase;text-align:center;padding:10px 8px;border:2px solid #6b7280;vertical-align:middle;letter-spacing:0.5px;`;
  const TD = `border:2px solid #9ca3af;padding:10px 12px;font-size:11px;font-weight:600;color:#4b5563;text-align:center;vertical-align:middle;background:#ffffff;`;
  const LBL = `border:2px solid #9ca3af;padding:10px 14px;font-size:11px;font-weight:700;color:#6b7280;text-align:left;background:#f9fafb;`;
  const TOTAL = `border:2px solid #9ca3af;padding:11px 12px;font-size:11px;font-weight:700;color:#6b7280;text-align:center;background:#f3f4f6;white-space:nowrap;`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#ffffff; padding:20px; font-family:'Inter',sans-serif; }
.slip { max-width:100%; width:100%; margin:0; background:#fff; border:none; overflow:hidden; }
.slip-head { display:flex; justify-content:space-between; align-items:center; padding:20px 28px 18px; border-bottom:2px solid #e5e7eb; min-height:80px; }
.logo-row { display:flex; align-items:center; gap:14px; }
.logo-box { background:#4a5f7a; color:#fff; font-size:24px; font-weight:900; padding:12px 16px; border-radius:6px; }
.slip-title { text-align:right; display:flex; flex-direction:column; justify-content:center; }
.slip-title h2 { color:#7cb668; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin:0; }
.slip-title p { color:#1e293b; font-size:18px; font-weight:900; margin:4px 0 0 0; }
.sec { padding:0; margin:20px 0; }
.sec-bar { display:flex; align-items:center; background:#4a5f7a; color:#fff; border-radius:8px 8px 0 0; overflow:hidden; margin-bottom:0; border:2px solid #cbd5e1; border-bottom:none; }
.sec-num { background:#7cb668; padding:11px 16px; font-size:15px; font-weight:900; min-width:46px; text-align:center; border-right:2px solid #cbd5e1; }
.sec-label { padding:11px 18px; font-weight:700; font-size:11px; letter-spacing:.8px; text-transform:uppercase; }
table { width:100%; border-collapse:collapse; font-size:11.5px; border-radius:15px; overflow:hidden; }
.info-tbl { border:2px solid #cbd5e1; margin-top:0; border-radius:8px; overflow:hidden; border-collapse:separate; border-spacing:0; }
.info-tbl th { background:#f8fafc; color:#64748b; font-weight:700; border:1.5px solid #cbd5e1; padding:10px 14px; text-align:left; font-size:10.5px; }
.info-tbl td { border:1.5px solid #cbd5e1; padding:10px 14px; color:#1e293b; font-weight:600; background:#fff; }
.leave-tbl { border:2px solid #cbd5e1; margin-top:0; border-radius:0 0 15px 15px; border-top:none; border-collapse:separate; border-spacing:0; }
.leave-tbl tbody tr:last-child td:first-child { border-bottom-left-radius:13px; }
.leave-tbl tbody tr:last-child td:last-child { border-bottom-right-radius:13px; }
.leave-tbl thead th { background:#4a5f7a; color:#fff; padding:10px 12px; text-align:center; font-weight:700; font-size:10.5px; letter-spacing:.4px; border:1.5px solid #cbd5e1; }
.leave-tbl thead th.green { background:#7cb668; border:1.5px solid #cbd5e1; }
.leave-tbl tbody td { border:1.5px solid #cbd5e1; padding:10px 12px; text-align:center; color:#1e293b; font-weight:600; background:#fff; }
.leave-tbl tbody tr:nth-child(odd) td { background:#fafafa; }
.leave-tbl td.av { color:#7cb668; font-weight:700; }
.sum-row td { background:#f0f9ec; font-weight:700; font-size:11px; color:#1e293b; border:1.5px solid #cbd5e1; padding:10px 12px; }
.sum-row td.lbl { text-align:left; padding-left:14px; color:#64748b; font-weight:700; }
.sum-row td.gv { color:#1e293b; font-weight:700; }
.sal-grid { display:flex; gap:20px; align-items:stretch; margin-top:10px; position:relative; }
.box { border:2px solid #cbd5e1; border-radius:8px; overflow:hidden; flex:1; display:flex; flex-direction:column; position:relative; z-index:2; }
.box-head { padding:12px 14px; text-align:center; font-size:13.5px; font-weight:700; color:#fff; letter-spacing:.5px; }
.earn .box-head { background:#546e7a; }
.ded .box-head { background:#81c784; }
.box-body { flex:1; display:flex; flex-direction:column; }
.sal-tbl { width:100%; border-collapse:collapse; font-size:12.5px; flex:1; }
.sal-tbl th { background:#f4f8f3; color:#6A7D97; padding:10px; text-align:center; font-weight:700; font-size:11.5px; border:1px solid #dce3ea; border-top:none; }
.sal-tbl td { border:1px solid #dce3ea; padding:10px; text-align:center; color:#334155; }
.sal-tbl .tot td { background:#eaf3e8; font-weight:700; color:#6A7D97; }
.sal-tbl tr.filler td { border-left:1px solid #dce3ea; border-right:1px solid #dce3ea; border-top:none; border-bottom:none; padding:10px; }
.net-bar { display:grid; grid-template-columns:60% 40%; margin-top:18px; border-radius:15px; overflow:hidden; border:2px solid #cbd5e1; }
.net-lbl { background:#4a5f7a; color:#fff; padding:14px 18px; font-size:14px; font-weight:700; display:flex; align-items:center; gap:10px; text-transform:uppercase; letter-spacing:.4px; }
.net-lbl .n4 { font-size:18px; font-weight:900; background:#7cb668; padding:5px 11px; border-radius:4px; }
.net-amt { background:#7cb668; color:#fff; padding:14px; text-align:center; font-size:24px; font-weight:900; display:flex; align-items:center; justify-content:center; }
.slip-foot { text-align:center; padding:16px 28px; border-top:2px solid #cbd5e1; margin-top:12px; background:#fafafa; }
.slip-foot h3 { color:#1e293b; font-size:14px; font-weight:800; margin-bottom:3px; }
.slip-foot p { color:#64748b; font-size:10.5px; font-weight:500; line-height:1.4; }
@media print { body { background:#fff; padding:0; } .slip { box-shadow:none; border:none; border-radius:0; } }
</style></head><body><div class="slip">

<div class="slip-head">
  <div class="logo-row">
    ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" style="height:60px;width:auto;object-fit:contain;border:none;outline:none;">` : `<div class="logo-box">WX</div>`}
  </div>
  <div class="slip-title"><h2>SALARY SLIP</h2><p>${monthName}</p></div>
</div>

<div class="sec">
<div class="sec-bar"><div class="sec-num">01</div><div class="sec-label">Employee Information</div></div>
<table class="info-tbl" style="border: 2px solid #cbd5e1; border-collapse: separate; border-spacing: 0; border-radius: 8px;">
<tr><th>Name</th><td>${employee.fullName}</td><th>UAN No.</th><td>${employee.uanNumber || 'N/A'}</td></tr>
<tr><th>Department</th><td>${employee.department}</td><th>ESIC No.</th><td>${employee.esic || 'N/A'}</td></tr>
<tr><th>Designation</th><td>${employee.position}</td><th>Bank A/C No.</th><td>${employee.accountNumber || 'N/A'}</td></tr>
<tr><th>Date of Joining</th><td>${formatDateToDDMMYYYY(employee.joiningDate) || 'N/A'}</td><th>Days in Month</th><td>${salaryRecord.totalWorkingDays || 30}</td></tr>
<tr><th>Employee Code</th><td colspan="3">${employee.employeeId}</td></tr>
</table>
</div>

<div class="sec">
<div class="sec-bar"><div class="sec-num">02</div><div class="sec-label">Leave Details</div></div>
<table class="leave-tbl" style="border: 2px solid #cbd5e1; border-collapse: separate; border-spacing: 0; border-radius: 0 0 15px 15px; border-top: none;">
<thead><tr><th>Leave Type</th><th>Total in Account</th><th class="green">Availed</th><th>Subsisting</th><th>LWP</th></tr></thead>
<tbody>
<tr><td>PL</td><td>${leaves[0].total.toFixed(1)}</td><td class="av">${leaves[0].availed.toFixed(1)}</td><td>${leaves[0].subsisting.toFixed(1)}</td><td rowspan="3">${totalLwp.toFixed(1)}</td></tr>
<tr><td>CL</td><td>${leaves[1].total.toFixed(1)}</td><td class="av">${leaves[1].availed.toFixed(1)}</td><td>${leaves[1].subsisting.toFixed(1)}</td></tr>
<tr><td>SL</td><td>${leaves[2].total.toFixed(1)}</td><td class="av">${leaves[2].availed.toFixed(1)}</td><td>${leaves[2].subsisting.toFixed(1)}</td></tr>
<tr class="sum-row"><td class="lbl">Total Leaves Taken</td><td>${totalLeavesTaken.toFixed(1)}</td><td colspan="2" class="gv" style="text-align:center;">Total Leave Without Pay (LWP)</td><td class="gv">${totalLwp.toFixed(1)}</td></tr>
<tr class="sum-row"><td class="lbl">Total Present Days</td><td>${(salaryRecord.actualWorkingDays||0).toFixed(1)}</td><td colspan="2" class="gv" style="text-align:center;">Total Days Payable</td><td class="gv">${(salaryRecord.actualWorkingDays||0).toFixed(1)}</td></tr>
</tbody>
</table>
</div>

<div class="sec">
<div class="sec-bar"><div class="sec-num">03</div><div class="sec-label">Salary Details</div></div>
<div class="sal-grid">
<div class="box earn"><div class="box-head">EARNINGS</div><div class="box-body"><table class="sal-tbl">
<tr><th>Component</th><th>Actual (&#8377;)</th><th>Earned (&#8377;)</th></tr>
<tr><td>Basic</td><td>${formatCurrency(salaryRecord.basic||0)}</td><td>${formatCurrency(salaryRecord.basicEarned||0)}</td></tr>
<tr><td>HRA</td><td>${formatCurrency(salaryRecord.hra||0)}</td><td>${formatCurrency(salaryRecord.hraEarned||0)}</td></tr>
<tr><td>Conveyance</td><td>${formatCurrency(salaryRecord.conveyance||0)}</td><td>${formatCurrency(salaryRecord.conveyanceEarned||0)}</td></tr>
<tr><td>Sp. Allowance</td><td>${formatCurrency(salaryRecord.specialAllowance||0)}</td><td>${formatCurrency(salaryRecord.specialAllowanceEarned||0)}</td></tr>
<tr><td>Bonus</td><td>0.00</td><td>${formatCurrency(salaryRecord.bonusEarned||0)}</td></tr>
<tr><td>Incentive</td><td>0.00</td><td>${formatCurrency(salaryRecord.incentiveEarned||0)}</td></tr>
<tr><td>Incentive 2</td><td>0.00</td><td>${formatCurrency(salaryRecord.incentive2Earned||0)}</td></tr>
<tr><td>Adjustment</td><td>0.00</td><td>${formatCurrency(salaryRecord.adjustmentEarned||salaryRecord.adjustment||0)}</td></tr>
<tr><td>Retention</td><td>0.00</td><td>${formatCurrency(salaryRecord.retentionBonus||0)}</td></tr>
<tr><td>Advance</td><td>0.00</td><td>${formatCurrency(salaryRecord.advanceAnyEarned||salaryRecord.advanceAny||0)}</td></tr>
<tr class="tot"><td>Gross Earnings</td><td>${formatCurrency((salaryRecord.basic||0)+(salaryRecord.hra||0)+(salaryRecord.conveyance||0)+(salaryRecord.specialAllowance||0))}</td><td>${formatCurrency((salaryRecord.basicEarned||0)+(salaryRecord.hraEarned||0)+(salaryRecord.conveyanceEarned||0)+(salaryRecord.specialAllowanceEarned||0)+(salaryRecord.bonusEarned||0)+(salaryRecord.incentiveEarned||0)+(salaryRecord.incentive2Earned||0)+(salaryRecord.adjustmentEarned||salaryRecord.adjustment||0)+(salaryRecord.retentionBonus||0)+(salaryRecord.advanceAnyEarned||salaryRecord.advanceAny||0))}</td></tr>
</table></div></div>
<div class="box ded"><div class="box-head">DEDUCTIONS</div><div class="box-body"><table class="sal-tbl">
<tr><th>Component</th><th>Amount (&#8377;)</th></tr>
<tr><td>PF</td><td>${formatCurrency(salaryRecord.pf||0)}</td></tr>
<tr><td>ESIC</td><td>${formatCurrency(salaryRecord.esic||0)}</td></tr>
<tr><td>PT</td><td>${formatCurrency(salaryRecord.pt||0)}</td></tr>
<tr><td>TDS</td><td>${formatCurrency(salaryRecord.tds||0)}</td></tr>
<tr><td>Retention</td><td>${formatCurrency(salaryRecord.retention||0)}</td></tr>
<tr><td>Advance</td><td>${formatCurrency(salaryRecord.advanceAnyDeduction||0)}</td></tr>
<tr><td>Adjustment</td><td>${formatCurrency(salaryRecord.adjustmentDeduction||0)}</td></tr>
<tr class="filler"><td>&nbsp;</td><td>&nbsp;</td></tr>
<tr class="filler"><td>&nbsp;</td><td>&nbsp;</td></tr>
<tr class="filler"><td>&nbsp;</td><td>&nbsp;</td></tr>
<tr class="tot"><td>Total Deduction</td><td>${formatCurrency((salaryRecord.pf||0)+(salaryRecord.esic||0)+(salaryRecord.pt||0)+(salaryRecord.tds||0)+(salaryRecord.retention||0)+(salaryRecord.advanceAnyDeduction||0)+(salaryRecord.adjustmentDeduction||0))}</td></tr>
</table></div></div>
</div>
<div class="net-bar">
<div class="net-lbl"><span class="n4">04</span> Net Salary Credited</div>
<div class="net-amt">&#8377; ${formatCurrency(((salaryRecord.basicEarned||0)+(salaryRecord.hraEarned||0)+(salaryRecord.conveyanceEarned||0)+(salaryRecord.specialAllowanceEarned||0)+(salaryRecord.bonusEarned||0)+(salaryRecord.incentiveEarned||0)+(salaryRecord.incentive2Earned||0)+(salaryRecord.adjustmentEarned||salaryRecord.adjustment||0)+(salaryRecord.retentionBonus||0)+(salaryRecord.advanceAnyEarned||salaryRecord.advanceAny||0))-((salaryRecord.pf||0)+(salaryRecord.esic||0)+(salaryRecord.pt||0)+(salaryRecord.tds||0)+(salaryRecord.retention||0)+(salaryRecord.advanceAnyDeduction||0)+(salaryRecord.adjustmentDeduction||0)))}</div>
</div>
</div>

<div class="slip-foot">
  <h3>WyzentiQa Xcellencce (OPC) Pvt. Ltd.</h3>
  <p>Imperial Heights - 4/404, Near Akshar Chowk, Atladra, Vadodara - 390012, Gujarat, India</p>
</div>
</div></body></html>`;
}

// Bulk download endpoint
const bulkDownloadSlips: RequestHandler = async (req, res) => {
  let browser;
  try {
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res.status(400).json({ success: false, message: 'Month parameter required (YYYY-MM)' });
    }

    console.log(`Generating bulk slips for: ${month}`);
    const employees = await Employee.find({ status: 'active' });
    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: 'No active employees' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    res.attachment(`All_Salary_Slips_${month}.zip`);
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    // Launch browser once for all employees (HUGE speed improvement)
    const isLocal = process.env.NODE_ENV !== 'production' || process.platform === 'win32';
    
    if (isLocal) {
      const puppeteerRegular = await import('puppeteer');
      browser = await puppeteerRegular.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } else {
      browser = await puppeteer.launch({ 
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    }

    let processed = 0, skipped = 0;
    
    // Process employees in batches of 3 for speed
    const batchSize = 3;
    for (let i = 0; i < employees.length; i += batchSize) {
      const batch = employees.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (employee) => {
        try {
          const salaryRecord = await SalaryRecord.findOne({ employeeId: employee._id.toString(), month });
          if (!salaryRecord) { 
            skipped++; 
            return; 
          }
          
          const leaveRecord = await LeaveRecord.findOne({ employeeId: employee._id.toString(), month });
          const html = await generatePayslipHTML(employee, salaryRecord, leaveRecord, month);
          
          // Use slip password if set, otherwise fallback to UAN last 4 digits
          let password = employee.slipPassword;
          if (!password) {
            password = String(employee.uanNumber || "0000").replace(/\D/g, '').slice(-4);
            if (password.length < 4) password = password.padStart(4, '0');
          }
          
          const page = await browser!.newPage();
          
          await page.setViewport({
            width: 794,
            height: 842,
            deviceScaleFactor: 2
          });
          
          await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 5000 });
          
          // ✅ FIX 1: Increased wait time so footer renders fully before screenshot
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // ✅ FIX 2: More accurate full content height calculation (includes footer)
          const contentHeight = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            return Math.max(
              body.scrollHeight, body.offsetHeight,
              html.clientHeight, html.scrollHeight, html.offsetHeight
            );
          });
          
          // ✅ FIX 3: Extra 80px padding (was 40) so footer logo is never cut
          const finalHeight = contentHeight + 80;
          
          const screenshot = await page.screenshot({ 
            type: 'jpeg',
            quality: 95,
            fullPage: false,
            clip: {
              x: 0,
              y: 0,
              width: 794,
              height: finalHeight
            }
          });
          await page.close();

          // Create PDF with password
          const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const doc = new PDFDocument({
              size: "A4",
              userPassword: password,
              ownerPassword: `OWN_${password}_SECURE_2024`,
              permissions: {
                copying: false,
                modifying: false,
                annotating: false,
                fillingForms: false,
                contentAccessibility: false,
                documentAssembly: false,
              },
            });

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
            const pageWidth = doc.page.width - 40;
            const pageHeight = doc.page.height - 40;
            doc.image(screenshot, 20, 20, {
              fit: [pageWidth, pageHeight],
              align: "center",
              valign: "center",
            });
            doc.end();
          });

          archive.append(pdfBuffer, { name: `${employee.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_${month}.pdf` });
          processed++;
          console.log(`Processed: ${employee.fullName}`);
        } catch (error) {
          console.error(`Error: ${employee.fullName}`, error);
          skipped++;
        }
      }));
    }

    await browser.close();
    console.log(`Complete: ${processed} processed, ${skipped} skipped`);
    await archive.finalize();
  } catch (error) {
    if (browser) await browser.close();
    console.error('Bulk download error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed' });
  }
};

// Excel export with full styling - 100% same as PDF
const exportToStyledExcel: RequestHandler = async (req, res) => {
  try {
    const { employeeId, month } = req.query;
    
    if (!employeeId || !month || typeof employeeId !== 'string' || typeof month !== 'string') {
      return res.status(400).json({ success: false, message: 'Employee ID and month required' });
    }

    // Fetch data
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const salaryRecord = await SalaryRecord.findOne({ employeeId, month });
    if (!salaryRecord) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }

    const leaveRecord = await LeaveRecord.findOne({ employeeId, month });

    // Format date DD-MM-YYYY
    const formatDateToDDMMYYYY = (dateStr: string) => {
      if (!dateStr) return "N/A";
      try {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      } catch {
        return dateStr;
      }
    };

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Salary Slip', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true }
    });

    // Set column widths
    worksheet.columns = [
      { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }
    ];

    // Colors matching the PDF
    const GREEN = '7CB668';
    const DARK_BLUE = '4A5F7A';
    const GRAY = '64748B';
    const LIGHT_GRAY = 'F8FAFC';
    const WHITE = 'FFFFFF';
    const BORDER_COLOR = 'CBD5E1';

    let currentRow = 1;

    // === HEADER ===
    const headerRow = worksheet.getRow(currentRow);
    headerRow.height = 50;
    
    // Logo/Company Name (merged A1:B1)
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    const logoCell = worksheet.getCell(`A${currentRow}`);
    logoCell.value = 'WYZENTIQA XCELLENCE';
    logoCell.font = { name: 'Inter', size: 16, bold: true, color: { argb: DARK_BLUE } };
    logoCell.alignment = { vertical: 'middle', horizontal: 'left' };
    logoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };

    // Title (merged C1:D1)
    worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
    const titleCell = worksheet.getCell(`C${currentRow}`);
    const monthDate = new Date(month + '-01');
    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    titleCell.value = `SALARY SLIP\n${monthName}`;
    titleCell.font = { name: 'Inter', size: 11, bold: true, color: { argb: GREEN } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };

    currentRow += 2;

    // === SECTION 01: EMPLOYEE INFORMATION ===
    // Section Header
    const sec1HeaderRow = worksheet.getRow(currentRow);
    sec1HeaderRow.height = 25;
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const sec1Header = worksheet.getCell(`A${currentRow}`);
    sec1Header.value = '01  EMPLOYEE INFORMATION';
    sec1Header.font = { name: 'Inter', size: 11, bold: true, color: { argb: WHITE } };
    sec1Header.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sec1Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK_BLUE } };
    sec1Header.border = {
      top: { style: 'thin', color: { argb: BORDER_COLOR } },
      left: { style: 'thin', color: { argb: BORDER_COLOR } },
      right: { style: 'thin', color: { argb: BORDER_COLOR } },
      bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
    };

    currentRow++;

    // Employee Info Data
    const empInfo = [
      ['Name', employee.fullName, 'UAN No.', employee.uanNumber || 'N/A'],
      ['Department', employee.department, 'ESIC No.', employee.esic || 'N/A'],
      ['Designation', employee.position, 'Bank A/C No.', employee.accountNumber || 'N/A'],
      ['Date of Joining', formatDateToDDMMYYYY(employee.joiningDate), 'Days in Month', salaryRecord.totalWorkingDays || 30],
    ];

    empInfo.forEach(rowData => {
      const row = worksheet.getRow(currentRow);
      row.height = 20;
      
      // Label 1
      const cell1 = worksheet.getCell(`A${currentRow}`);
      cell1.value = rowData[0];
      cell1.font = { name: 'Inter', size: 10, bold: true, color: { argb: GRAY } };
      cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
      cell1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      cell1.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
      };

      // Value 1
      const cell2 = worksheet.getCell(`B${currentRow}`);
      cell2.value = rowData[1];
      cell2.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
      cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };
      cell2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      cell2.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
      };

      // Label 2
      const cell3 = worksheet.getCell(`C${currentRow}`);
      cell3.value = rowData[2];
      cell3.font = { name: 'Inter', size: 10, bold: true, color: { argb: GRAY } };
      cell3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
      cell3.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      cell3.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
      };

      // Value 2
      const cell4 = worksheet.getCell(`D${currentRow}`);
      cell4.value = rowData[3];
      cell4.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
      cell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };
      cell4.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      cell4.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
      };

      currentRow++;
    });

    // Employee Code row
    const empCodeRow = worksheet.getRow(currentRow);
    empCodeRow.height = 20;
    const empCodeLabel = worksheet.getCell(`A${currentRow}`);
    empCodeLabel.value = 'Employee Code';
    empCodeLabel.font = { name: 'Inter', size: 10, bold: true, color: { argb: GRAY } };
    empCodeLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
    empCodeLabel.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    empCodeLabel.border = {
      top: { style: 'thin', color: { argb: BORDER_COLOR } },
      left: { style: 'thin', color: { argb: BORDER_COLOR } },
      right: { style: 'thin', color: { argb: BORDER_COLOR } },
      bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
    };

    worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
    const empCodeValue = worksheet.getCell(`B${currentRow}`);
    empCodeValue.value = employee.employeeId;
    empCodeValue.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
    empCodeValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
    empCodeValue.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    empCodeValue.border = {
      top: { style: 'thin', color: { argb: BORDER_COLOR } },
      left: { style: 'thin', color: { argb: BORDER_COLOR } },
      right: { style: 'thin', color: { argb: BORDER_COLOR } },
      bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
    };

    currentRow += 2;

    // === SECTION 02: LEAVE DETAILS ===
    const sec2HeaderRow = worksheet.getRow(currentRow);
    sec2HeaderRow.height = 25;
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const sec2Header = worksheet.getCell(`A${currentRow}`);
    sec2Header.value = '02  LEAVE DETAILS';
    sec2Header.font = { name: 'Inter', size: 11, bold: true, color: { argb: WHITE } };
    sec2Header.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sec2Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK_BLUE } };
    sec2Header.border = {
      top: { style: 'thin', color: { argb: BORDER_COLOR } },
      left: { style: 'thin', color: { argb: BORDER_COLOR } },
      right: { style: 'thin', color: { argb: BORDER_COLOR } },
      bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
    };

    currentRow++;

    // Leave table header
    const leaveHeaderRow = worksheet.getRow(currentRow);
    leaveHeaderRow.height = 20;
    ['Leave Type', 'Total in Account', 'Availed', 'Subsisting'].forEach((header, idx) => {
      const cell = worksheet.getCell(currentRow, idx + 1);
      cell.value = header;
      cell.font = { name: 'Inter', size: 10, bold: true, color: { argb: WHITE } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: header === 'Availed' ? GREEN : DARK_BLUE } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
      };
    });

    currentRow++;

    // Leave data
    const leaves = [
      { type: 'PL', total: leaveRecord?.plTotalLeaveInAccount || 0, availed: leaveRecord?.plLeaveAvailed || 0, subsisting: leaveRecord?.plSubsistingLeave || 0 },
      { type: 'CL', total: leaveRecord?.clTotalLeaveInAccount || 0, availed: leaveRecord?.clLeaveAvailed || 0, subsisting: leaveRecord?.clSubsistingLeave || 0 },
      { type: 'SL', total: leaveRecord?.slTotalLeaveInAccount || 0, availed: leaveRecord?.slLeaveAvailed || 0, subsisting: leaveRecord?.slSubsistingLeave || 0 }
    ];

    leaves.forEach(leave => {
      const row = worksheet.getRow(currentRow);
      row.height = 20;
      
      [leave.type, leave.total.toFixed(1), leave.availed.toFixed(1), leave.subsisting.toFixed(1)].forEach((val, idx) => {
        const cell = worksheet.getCell(currentRow, idx + 1);
        cell.value = val;
        cell.font = { name: 'Inter', size: 10, bold: true, color: { argb: idx === 2 ? GREEN : '1E293B' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: BORDER_COLOR } },
          left: { style: 'thin', color: { argb: BORDER_COLOR } },
          right: { style: 'thin', color: { argb: BORDER_COLOR } },
          bottom: { style: 'thin', color: { argb: BORDER_COLOR } }
        };
      });

      currentRow++;
    });

    // Generate and send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${employee.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_${month}_Salary_Slip.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to export' });
  }
};

router.get("/bulk-download", bulkDownloadSlips);

// Helper function to generate styled Excel for one employee (reusable)
async function generateStyledExcelForEmployee(employee: any, salaryRecord: any, leaveRecord: any, month: string): Promise<Buffer> {
  const formatDateToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const monthNum = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${monthNum}-${year}`;
    } catch {
      return dateStr;
    }
  };

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Salary Slip', {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true }
  });

  worksheet.columns = [{ width: 18 }, { width: 14 }, { width: 14 }, { width: 18 }, { width: 14 }];

  const GREEN = '7CB668';
  const DARK_BLUE = '4A5F7A';
  const GRAY = '64748B';
  const LIGHT_GRAY = 'F8FAFC';
  const WHITE = 'FFFFFF';
  const BORDER_COLOR = 'CBD5E1';

  let currentRow = 1;

  // Header
  const headerRow = worksheet.getRow(currentRow);
  headerRow.height = 50;
  worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
  const logoCell = worksheet.getCell(`A${currentRow}`);
  logoCell.value = 'WYZENTIQA XCELLENCE';
  logoCell.font = { name: 'Inter', size: 16, bold: true, color: { argb: DARK_BLUE } };
  logoCell.alignment = { vertical: 'middle', horizontal: 'left' };
  logoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };

  worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
  const titleCell = worksheet.getCell(`C${currentRow}`);
  const monthDate = new Date(month + '-01');
  const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  titleCell.value = `SALARY SLIP\n${monthName}`;
  titleCell.font = { name: 'Inter', size: 11, bold: true, color: { argb: GREEN } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };

  currentRow += 2;

  // Section 01
  const sec1HeaderRow = worksheet.getRow(currentRow);
  sec1HeaderRow.height = 25;
  worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
  const sec1Header = worksheet.getCell(`A${currentRow}`);
  sec1Header.value = '01  EMPLOYEE INFORMATION';
  sec1Header.font = { name: 'Inter', size: 11, bold: true, color: { argb: WHITE } };
  sec1Header.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sec1Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK_BLUE } };
  sec1Header.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  currentRow++;

  const empInfo = [
    ['Name', employee.fullName, 'UAN No.', employee.uanNumber || 'N/A'],
    ['Department', employee.department, 'ESIC No.', employee.esic || 'N/A'],
    ['Designation', employee.position, 'Bank A/C No.', employee.accountNumber || 'N/A'],
    ['Date of Joining', formatDateToDDMMYYYY(employee.joiningDate), 'Days in Month', salaryRecord.totalWorkingDays || 30],
  ];

  empInfo.forEach(rowData => {
    const row = worksheet.getRow(currentRow);
    row.height = 20;
    for (let i = 0; i < 4; i++) {
      const cell = worksheet.getCell(currentRow, i + 1);
      cell.value = rowData[i];
      cell.font = { name: 'Inter', size: 10, bold: true, color: { argb: i % 2 === 0 ? GRAY : '1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? LIGHT_GRAY : WHITE } };
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      cell.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };
    }
    currentRow++;
  });

  const empCodeRow = worksheet.getRow(currentRow);
  empCodeRow.height = 20;
  const empCodeLabel = worksheet.getCell(`A${currentRow}`);
  empCodeLabel.value = 'Employee Code';
  empCodeLabel.font = { name: 'Inter', size: 10, bold: true, color: { argb: GRAY } };
  empCodeLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
  empCodeLabel.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  empCodeLabel.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
  const empCodeValue = worksheet.getCell(`B${currentRow}`);
  empCodeValue.value = employee.employeeId;
  empCodeValue.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  empCodeValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
  empCodeValue.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  empCodeValue.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  currentRow += 2;

  // Section 02
  const sec2HeaderRow = worksheet.getRow(currentRow);
  sec2HeaderRow.height = 25;
  worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
  const sec2Header = worksheet.getCell(`A${currentRow}`);
  sec2Header.value = '02  LEAVE DETAILS';
  sec2Header.font = { name: 'Inter', size: 11, bold: true, color: { argb: WHITE } };
  sec2Header.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sec2Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK_BLUE } };
  sec2Header.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  currentRow++;

  const leaveHeaderRow = worksheet.getRow(currentRow);
  leaveHeaderRow.height = 20;
  ['Leave Type', 'Total in Account', 'Availed', 'Subsisting'].forEach((header, idx) => {
    const cell = worksheet.getCell(currentRow, idx + 1);
    cell.value = header;
    cell.font = { name: 'Inter', size: 10, bold: true, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: header === 'Availed' ? GREEN : DARK_BLUE } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };
  });

  currentRow++;

  const leaves = [
    { type: 'PL', total: leaveRecord?.plTotalLeaveInAccount || 0, availed: leaveRecord?.plLeaveAvailed || 0, subsisting: leaveRecord?.plSubsistingLeave || 0 },
    { type: 'CL', total: leaveRecord?.clTotalLeaveInAccount || 0, availed: leaveRecord?.clLeaveAvailed || 0, subsisting: leaveRecord?.clSubsistingLeave || 0 },
    { type: 'SL', total: leaveRecord?.slTotalLeaveInAccount || 0, availed: leaveRecord?.slLeaveAvailed || 0, subsisting: leaveRecord?.slSubsistingLeave || 0 }
  ];

  leaves.forEach(leave => {
    const row = worksheet.getRow(currentRow);
    row.height = 20;
    [leave.type, leave.total.toFixed(1), leave.availed.toFixed(1), leave.subsisting.toFixed(1)].forEach((val, idx) => {
      const cell = worksheet.getCell(currentRow, idx + 1);
      cell.value = val;
      cell.font = { name: 'Inter', size: 10, bold: true, color: { argb: idx === 2 ? GREEN : '1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };
    });
    currentRow++;
  });

  // Summary rows
  const totalLeavesTaken = (leaveRecord?.plLeaveAvailed || 0) + (leaveRecord?.clLeaveAvailed || 0) + (leaveRecord?.slLeaveAvailed || 0);
  const totalLwp = (leaveRecord?.plLwp || 0) + (leaveRecord?.clLwp || 0) + (leaveRecord?.slLwp || 0);

  // Total Leaves Taken row
  const totalLeavesRow = worksheet.getRow(currentRow);
  totalLeavesRow.height = 20;
  const totalLeavesLabel = worksheet.getCell(currentRow, 1);
  totalLeavesLabel.value = 'Total Leaves Taken';
  totalLeavesLabel.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  totalLeavesLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F9EC' } };
  totalLeavesLabel.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  totalLeavesLabel.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  const totalLeavesValue = worksheet.getCell(currentRow, 2);
  totalLeavesValue.value = totalLeavesTaken.toFixed(1);
  totalLeavesValue.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  totalLeavesValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F9EC' } };
  totalLeavesValue.alignment = { vertical: 'middle', horizontal: 'center' };
  totalLeavesValue.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  worksheet.mergeCells(currentRow, 3, currentRow, 3);
  const lwpLabel = worksheet.getCell(currentRow, 3);
  lwpLabel.value = 'Total Leave Without Pay (LWP)';
  lwpLabel.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  lwpLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F9EC' } };
  lwpLabel.alignment = { vertical: 'middle', horizontal: 'center' };
  lwpLabel.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  const lwpValue = worksheet.getCell(currentRow, 4);
  lwpValue.value = totalLwp.toFixed(1);
  lwpValue.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  lwpValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F9EC' } };
  lwpValue.alignment = { vertical: 'middle', horizontal: 'center' };
  lwpValue.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  currentRow++;

  // Total Present Days row
  const presentDaysRow = worksheet.getRow(currentRow);
  presentDaysRow.height = 20;
  const presentDaysLabel = worksheet.getCell(currentRow, 1);
  presentDaysLabel.value = 'Total Present Days';
  presentDaysLabel.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  presentDaysLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F9EC' } };
  presentDaysLabel.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  presentDaysLabel.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  const presentDaysValue = worksheet.getCell(currentRow, 2);
  presentDaysValue.value = (salaryRecord.actualWorkingDays || 0).toFixed(1);
  presentDaysValue.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  presentDaysValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F9EC' } };
  presentDaysValue.alignment = { vertical: 'middle', horizontal: 'center' };
  presentDaysValue.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  worksheet.mergeCells(currentRow, 3, currentRow, 3);
  const payableDaysLabel = worksheet.getCell(currentRow, 3);
  payableDaysLabel.value = 'Total Days Payable';
  payableDaysLabel.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  payableDaysLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F9EC' } };
  payableDaysLabel.alignment = { vertical: 'middle', horizontal: 'center' };
  payableDaysLabel.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  const payableDaysValue = worksheet.getCell(currentRow, 4);
  payableDaysValue.value = (salaryRecord.actualWorkingDays || 0).toFixed(1);
  payableDaysValue.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  payableDaysValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F9EC' } };
  payableDaysValue.alignment = { vertical: 'middle', horizontal: 'center' };
  payableDaysValue.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  currentRow++;

  currentRow += 2;

  // === SECTION 03: SALARY DETAILS ===
  const sec3HeaderRow = worksheet.getRow(currentRow);
  sec3HeaderRow.height = 25;
  worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
  const sec3Header = worksheet.getCell(`A${currentRow}`);
  sec3Header.value = '03  SALARY DETAILS';
  sec3Header.font = { name: 'Inter', size: 11, bold: true, color: { argb: WHITE } };
  sec3Header.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sec3Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK_BLUE } };
  sec3Header.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  currentRow++;

  // Earnings and Deductions headers
  const salaryHeaderRow = worksheet.getRow(currentRow);
  salaryHeaderRow.height = 25;
  
  // Earnings header (A-C, 3 columns)
  worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  const earningsHeader = worksheet.getCell(`A${currentRow}`);
  earningsHeader.value = 'EARNINGS';
  earningsHeader.font = { name: 'Inter', size: 11, bold: true, color: { argb: WHITE } };
  earningsHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  earningsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '546E7A' } };
  earningsHeader.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  // Deductions header (D-E, 2 columns)
  worksheet.mergeCells(`D${currentRow}:E${currentRow}`);
  const deductionsHeader = worksheet.getCell(`D${currentRow}`);
  deductionsHeader.value = 'DEDUCTIONS';
  deductionsHeader.font = { name: 'Inter', size: 11, bold: true, color: { argb: WHITE } };
  deductionsHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  deductionsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '81C784' } };
  deductionsHeader.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  currentRow++;

  // Column headers
  const colHeaderRow = worksheet.getRow(currentRow);
  colHeaderRow.height = 20;
  ['Component', 'Actual (₹)', 'Earned (₹)', 'Component', 'Amount (₹)'].forEach((header, idx) => {
    const colIdx = idx < 3 ? idx + 1 : idx;
    const cell = worksheet.getCell(currentRow, colIdx);
    cell.value = header;
    cell.font = { name: 'Inter', size: 10, bold: true, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx < 3 ? '546E7A' : '81C784' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };
  });

  currentRow++;

  // Earnings and Deductions data
  const formatCurrency = (val?: number) => (val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const earningsAll = [
    { label: 'Basic', actual: salaryRecord.basic, earned: salaryRecord.basicEarned },
    { label: 'HRA', actual: salaryRecord.hra, earned: salaryRecord.hraEarned },
    { label: 'Conveyance', actual: salaryRecord.conveyance, earned: salaryRecord.conveyanceEarned },
    { label: 'Sp. Allowance', actual: salaryRecord.specialAllowance, earned: salaryRecord.specialAllowanceEarned },
    { label: 'Bonus', actual: salaryRecord.bonus, earned: salaryRecord.bonusEarned },
    { label: 'Incentive', actual: salaryRecord.incentive, earned: salaryRecord.incentiveEarned },
    { label: 'Incentive 2', actual: salaryRecord.incentive2, earned: salaryRecord.incentive2Earned },
    { label: 'Adjustment', actual: salaryRecord.adjustment, earned: salaryRecord.adjustmentEarned },
    { label: 'Retention', actual: salaryRecord.retentionEarning, earned: salaryRecord.retentionEarningEarned },
    { label: 'Advance', actual: salaryRecord.advanceEarning, earned: salaryRecord.advanceEarningEarned },
  ];

  const deductionsAll = [
    { label: 'PF', amount: salaryRecord.pf },
    { label: 'ESIC', amount: salaryRecord.esic },
    { label: 'PT', amount: salaryRecord.pt },
    { label: 'TDS', amount: salaryRecord.tds },
    { label: 'Retention', amount: salaryRecord.retention },
    { label: 'Advance', amount: salaryRecord.advanceAnyDeduction },
    { label: 'Adjustment', amount: salaryRecord.adjustmentDeduction },
  ];

  // Filter non-zero entries
  const earnings = earningsAll.filter(e => e.actual !== 0 || e.earned !== 0);
  const deductions = deductionsAll.filter(d => d.amount !== 0);

  const maxRows = Math.max(earnings.length, deductions.length);

  for (let i = 0; i < maxRows; i++) {
    const row = worksheet.getRow(currentRow);
    row.height = 20;

    // Earnings columns (3 columns: Component, Actual, Earned)
    if (i < earnings.length) {
      const labelCell = worksheet.getCell(currentRow, 1);
      labelCell.value = earnings[i].label;
      labelCell.font = { name: 'Inter', size: 10, bold: false, color: { argb: '334155' } };
      labelCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };
      labelCell.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

      const actualCell = worksheet.getCell(currentRow, 2);
      actualCell.value = formatCurrency(earnings[i].actual);
      actualCell.font = { name: 'Inter', size: 10, bold: false, color: { argb: '334155' } };
      actualCell.alignment = { vertical: 'middle', horizontal: 'center' };
      actualCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };
      actualCell.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

      const earnedCell = worksheet.getCell(currentRow, 3);
      earnedCell.value = formatCurrency(earnings[i].earned);
      earnedCell.font = { name: 'Inter', size: 10, bold: false, color: { argb: '334155' } };
      earnedCell.alignment = { vertical: 'middle', horizontal: 'center' };
      earnedCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };
      earnedCell.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };
    }

    // Deductions columns (2 columns: Component, Amount)
    if (i < deductions.length) {
      const labelCell = worksheet.getCell(currentRow, 4);
      labelCell.value = deductions[i].label;
      labelCell.font = { name: 'Inter', size: 10, bold: false, color: { argb: '334155' } };
      labelCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };
      labelCell.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

      const valueCell = worksheet.getCell(currentRow, 5);
      valueCell.value = formatCurrency(deductions[i].amount);
      valueCell.font = { name: 'Inter', size: 10, bold: false, color: { argb: '334155' } };
      valueCell.alignment = { vertical: 'middle', horizontal: 'center' };
      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };
      valueCell.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };
    }

    currentRow++;
  }

  // Total row (now with 5 columns)
  const totalRow = worksheet.getRow(currentRow);
  totalRow.height = 22;

  const grossEarningsLabel = worksheet.getCell(currentRow, 1);
  grossEarningsLabel.value = 'Gross Earnings';
  grossEarningsLabel.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  grossEarningsLabel.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  grossEarningsLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EAF3E8' } };
  grossEarningsLabel.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  const grossActualValue = worksheet.getCell(currentRow, 2);
  grossActualValue.value = formatCurrency(salaryRecord.actualGross);
  grossActualValue.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  grossActualValue.alignment = { vertical: 'middle', horizontal: 'center' };
  grossActualValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EAF3E8' } };
  grossActualValue.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  const grossEarnedValue = worksheet.getCell(currentRow, 3);
  grossEarnedValue.value = formatCurrency(salaryRecord.earnedGross);
  grossEarnedValue.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  grossEarnedValue.alignment = { vertical: 'middle', horizontal: 'center' };
  grossEarnedValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EAF3E8' } };
  grossEarnedValue.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  const totalDeductionsLabel = worksheet.getCell(currentRow, 4);
  totalDeductionsLabel.value = 'Total Deductions';
  totalDeductionsLabel.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  totalDeductionsLabel.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  totalDeductionsLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EAF3E8' } };
  totalDeductionsLabel.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  const totalDeductionsValue = worksheet.getCell(currentRow, 5);
  totalDeductionsValue.value = formatCurrency(salaryRecord.totalDeduction);
  totalDeductionsValue.font = { name: 'Inter', size: 10, bold: true, color: { argb: '1E293B' } };
  totalDeductionsValue.alignment = { vertical: 'middle', horizontal: 'center' };
  totalDeductionsValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EAF3E8' } };
  totalDeductionsValue.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  currentRow += 2;

  // Net Salary row
  const netSalaryRow = worksheet.getRow(currentRow);
  netSalaryRow.height = 30;

  worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
  const netSalaryLabel = worksheet.getCell(`A${currentRow}`);
  netSalaryLabel.value = '04  NET SALARY CREDITED';
  netSalaryLabel.font = { name: 'Inter', size: 12, bold: true, color: { argb: WHITE } };
  netSalaryLabel.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  netSalaryLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK_BLUE } };
  netSalaryLabel.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
  const netSalaryValue = worksheet.getCell(`C${currentRow}`);
  netSalaryValue.value = `₹ ${formatCurrency(salaryRecord.netSalary)}`;
  netSalaryValue.font = { name: 'Inter', size: 16, bold: true, color: { argb: WHITE } };
  netSalaryValue.alignment = { vertical: 'middle', horizontal: 'center' };
  netSalaryValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } };
  netSalaryValue.border = { top: { style: 'thin', color: { argb: BORDER_COLOR } }, left: { style: 'thin', color: { argb: BORDER_COLOR } }, right: { style: 'thin', color: { argb: BORDER_COLOR } }, bottom: { style: 'thin', color: { argb: BORDER_COLOR } } };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// Bulk Excel export - All employees in ZIP
const bulkExcelExport: RequestHandler = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res.status(400).json({ success: false, message: 'Month parameter required (YYYY-MM)' });
    }

    console.log(`Generating bulk Excel slips for: ${month}`);
    const employees = await Employee.find({ status: 'active' });
    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: 'No active employees' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    res.attachment(`All_Salary_Slips_Excel_${month}.zip`);
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    let processed = 0, skipped = 0;
    
    for (const employee of employees) {
      try {
        const salaryRecord = await SalaryRecord.findOne({ employeeId: employee._id.toString(), month });
        if (!salaryRecord) { 
          skipped++; 
          continue;
        }
        
        const leaveRecord = await LeaveRecord.findOne({ employeeId: employee._id.toString(), month });
        const excelBuffer = await generateStyledExcelForEmployee(employee, salaryRecord, leaveRecord, month);
        
        archive.append(excelBuffer, { name: `${employee.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_${month}.xlsx` });
        processed++;
        console.log(`Processed Excel: ${employee.fullName}`);
      } catch (error) {
        console.error(`Error generating Excel for: ${employee.fullName}`, error);
        skipped++;
      }
    }

    console.log(`Complete: ${processed} Excel files processed, ${skipped} skipped`);
    await archive.finalize();
  } catch (error) {
    console.error('Bulk Excel export error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed' });
  }
};

router.get("/bulk-download", bulkDownloadSlips);
router.get("/bulk-excel-export", bulkExcelExport);
router.get("/export-excel", exportToStyledExcel);
export { router as salarySlipsRouter };