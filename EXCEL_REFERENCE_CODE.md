# Excel Reference Code - PDF Styling Complete Guide

Yeh hai **complete reference** jo tumhe Excel banane me help karega. PDF ki **exact styling, colors, layout** sab kuch documented hai.

---

## 🎨 COLOR PALETTE (Exact from PDF)

```javascript
// Main Colors
const GREEN = '7CB668';           // Section numbers (01, 02, 03, 04) background
const DARK_BLUE = '4A5F7A';       // Section headers background
const GRAY = '64748B';            // Labels text color
const LIGHT_GRAY = 'F8FAFC';      // Labels background
const WHITE = 'FFFFFF';           // Cell backgrounds
const BORDER_COLOR = 'CBD5E1';    // All borders
const TEXT_DARK = '1E293B';       // Main text color

// Salary Section Colors
const EARNINGS_BLUE = '546E7A';   // EARNINGS header background
const DEDUCTIONS_GREEN = '81C784'; // DEDUCTIONS header background
const GREEN_LIGHT = 'A8D08D';     // "Availed" column numbers (light green)

// Summary Row Colors
const SUMMARY_BG = 'F0F9EC';      // Light green background for summary rows
const TOTAL_BG = 'EAF3E8';        // Gross/Total rows background
```

---

## 📐 LAYOUT STRUCTURE

### Header (Row 1):
```
[WyzentiQa Xcellencce]                    [SALARY SLIP]
                                          [October 2026]
```

### Section 01: Employee Information
```
[01 GREEN] [EMPLOYEE INFORMATION - DARK BLUE]
-----------------------------------------------
| Label (GRAY) | Value | Label (GRAY) | Value |
| Name         | XXX   | UAN No.      | XXX   |
| Department   | XXX   | ESIC No.     | XXX   |
| Designation  | XXX   | Bank A/C No. | XXX   |
| Date Join    | XXX   | Days/Month   | XXX   |
| Employee Code         | XXX (colspan 3)     |
-----------------------------------------------
```

### Section 02: Leave Details
```
[02 GREEN] [LEAVE DETAILS - DARK BLUE]
---------------------------------------------------------------
| Leave Type | Total in Acc | Availed (GREEN) | Subsist | LWP |
| PL         | 10.0         | 1.0             | 9.0     |     |
| CL         | 5.0          | 2.0             | 8.0     | 3.0 |
| SL         | 5.0          | 3.0             | 7.0     |     |
---------------------------------------------------------------
| Total Leaves Taken | 6.0 | Total LWP (colspan 2) | 3.0 |
| Total Present Days | 30  | Total Days Payable    | 30  |
---------------------------------------------------------------
```

**Important**: LWP column uses `rowspan=3` for the value 3.0

### Section 03: Salary Details
```
[03 GREEN] [SALARY DETAILS - DARK BLUE]
------------------------------------------------------------
|      EARNINGS (BLUE)      |  |  DEDUCTIONS (GREEN)      |
------------------------------------------------------------
| Component | Actual | Earned |  | Component    | Amount   |
| Basic     | 11,850 | 11,850 |  | PF           | 1,800    |
| HRA       | 4,740  | 4,740  |  | ESIC         | 0.00     |
| Convey    | 1,600  | 1,600  |  | PT           | 200      |
| Sp. Allow | 5,510  | 5,510  |  | TDS          | 0.00     |
| Bonus     | 0.00   | 0.00   |  | Retention    | 1,500    |
| Incentive | 0.00   | 0.00   |  | Advance      | 0.00     |
| Incent 2  | 0.00   | 0.00   |  | Adjustment   | 0.00     |
| Adjust    | 0.00   | 1,000  |  | (empty rows) |          |
| Retention | 0.00   | 0.00   |  |              |          |
| Advance   | 0.00   | 0.00   |  |              |          |
------------------------------------------------------------
| Gross Earn| 23,700 | 24,700 |  | Total Ded    | 3,500    |
------------------------------------------------------------
```

**Note**: Middle column is GAP (white, empty)

### Section 04: Net Salary
```
[04 GREEN] [NET SALARY CREDITED - DARK BLUE] [₹ 21,200.00 - GREEN]
```

### Footer:
```
WyzentiQa Xcellencce (OPC) Pvt. Ltd.
Imperial Heights - 4/404, Near Akshar Chowk, Atladra, 
Vadodara - 390012, Gujarat, India
```

---

## 🎯 FONT SPECIFICATIONS

```javascript
// Font Family: Inter (Google Fonts)
// Use: 'Inter', Arial, sans-serif

// Font Sizes:
HEADER_COMPANY: 16px, bold
HEADER_TITLE: 11px, bold (SALARY SLIP), 18px, bold (month name)
SECTION_NUMBER: 15px, bold (01, 02, 03, 04)
SECTION_LABEL: 11px, bold, uppercase
TABLE_LABEL: 10-10.5px, bold
TABLE_VALUE: 10-11px, medium/semibold
COLUMN_HEADER: 10.5-11px, bold
NET_SALARY_LABEL: 14px, bold
NET_SALARY_VALUE: 24px, bold
FOOTER_COMPANY: 14px, bold
FOOTER_ADDRESS: 10.5px, regular
```

---

## 📊 CELL STYLING DETAILS

### Section Headers (01, 02, 03, 04):
```javascript
{
  // Green number box
  background: GREEN (#7CB668)
  color: WHITE
  font: 15px bold
  padding: 11px 16px
  border: 2px solid BORDER_COLOR
  
  // Blue label section
  background: DARK_BLUE (#4A5F7A)
  color: WHITE
  font: 11px bold uppercase
  padding: 11px 18px
  border: 2px solid BORDER_COLOR
}
```

### Employee Info Table:
```javascript
{
  // Labels (Name, Department, etc.)
  background: LIGHT_GRAY (#F8FAFC)
  color: GRAY (#64748B)
  font: 10px bold
  text-align: left
  padding: 10px 14px
  border: 1.5px solid BORDER_COLOR
  
  // Values
  background: WHITE
  color: TEXT_DARK (#1E293B)
  font: 10px bold
  text-align: left
  padding: 10px 14px
  border: 1.5px solid BORDER_COLOR
}
```

### Leave Table Headers:
```javascript
{
  // Regular headers (Leave Type, Total, Subsisting, LWP)
  background: DARK_BLUE (#4A5F7A)
  color: WHITE
  font: 10.5px bold
  text-align: center
  padding: 10px 12px
  border: 1.5px solid BORDER_COLOR
  
  // "Availed" header (special green)
  background: GREEN (#7CB668)
  color: WHITE
  font: 10.5px bold
  text-align: center
  padding: 10px 12px
  border: 1.5px solid BORDER_COLOR
}
```

### Leave Table Data:
```javascript
{
  // Regular cells
  background: WHITE
  color: TEXT_DARK (#1E293B)
  font: 11px bold
  text-align: center
  padding: 10px 12px
  border: 1.5px solid BORDER_COLOR
  
  // "Availed" column numbers (light green)
  color: GREEN_LIGHT (#A8D08D)
  font: 11px bold
  
  // Summary rows (Total Leaves Taken, etc.)
  background: SUMMARY_BG (#F0F9EC)
  color: TEXT_DARK
  font: 11px bold
  padding: 10px 12px
  border: 1.5px solid BORDER_COLOR
}
```

### Salary Tables (EARNINGS & DEDUCTIONS):
```javascript
{
  // EARNINGS header
  background: EARNINGS_BLUE (#546E7A)
  color: WHITE
  font: 13.5px bold
  text-align: center
  padding: 12px 14px
  border: 2px solid BORDER_COLOR
  
  // DEDUCTIONS header
  background: DEDUCTIONS_GREEN (#81C784)
  color: WHITE
  font: 13.5px bold
  text-align: center
  padding: 12px 14px
  border: 2px solid BORDER_COLOR
  
  // Column headers (Component, Actual, Earned, Amount)
  background: #F4F8F3 (light background)
  color: #6A7D97 (blue-gray text)
  font: 11.5px bold
  text-align: center
  padding: 10px
  border: 1px solid #DCE3EA
  
  // Data cells
  background: WHITE
  color: #334155
  font: 12.5px medium
  text-align: center
  padding: 10px
  border: 1px solid #DCE3EA
  
  // Total row (Gross Earnings / Total Deductions)
  background: TOTAL_BG (#EAF3E8)
  color: #6A7D97
  font: 12.5px bold
  text-align: center
  padding: 10px
  border: 1px solid #DCE3EA
}
```

### Net Salary Bar:
```javascript
{
  // Label section (60% width)
  background: DARK_BLUE (#4A5F7A)
  color: WHITE
  font: 14px bold uppercase
  padding: 14px 18px
  border: 2px solid BORDER_COLOR
  
  // "04" number badge
  background: GREEN (#7CB668)
  color: WHITE
  font: 18px bold
  padding: 5px 11px
  border-radius: 4px
  
  // Amount section (40% width)
  background: GREEN (#7CB668)
  color: WHITE
  font: 24px bold
  text-align: center
  padding: 14px
  border: 2px solid BORDER_COLOR
}
```

### Footer:
```javascript
{
  background: #FAFAFA (very light gray)
  text-align: center
  padding: 16px 28px
  border-top: 2px solid BORDER_COLOR
  
  // Company name
  color: TEXT_DARK (#1E293B)
  font: 14px bold
  
  // Address
  color: GRAY (#64748B)
  font: 10.5px regular
  line-height: 1.4
}
```

---

## 💾 DATA STRUCTURE

### Employee Data:
```typescript
{
  fullName: string
  employeeId: string
  department: string
  position: string
  joiningDate: string (format: DD-MM-YYYY)
  uanNumber: string
  esic: string
  accountNumber: string
}
```

### Salary Record:
```typescript
{
  // Earnings
  basic: number
  basicEarned: number
  hra: number
  hraEarned: number
  conveyance: number
  conveyanceEarned: number
  specialAllowance: number
  specialAllowanceEarned: number
  bonus: number
  bonusEarned: number
  incentive: number
  incentiveEarned: number
  incentive2: number
  incentive2Earned: number
  adjustment: number
  adjustmentEarned: number
  retentionBonus: number
  advanceAny: number
  advanceAnyEarned: number
  
  // Deductions
  pf: number
  esic: number
  pt: number
  tds: number
  retention: number
  advanceAnyDeduction: number
  adjustmentDeduction: number
  
  // Totals
  actualGross: number      // Sum of actual values
  earnedGross: number      // Sum of earned values
  totalDeduction: number   // Sum of all deductions
  netSalary: number        // earnedGross - totalDeduction
  
  // Working days
  totalWorkingDays: number
  actualWorkingDays: number
}
```

### Leave Record:
```typescript
{
  plTotalLeaveInAccount: number
  plLeaveAvailed: number
  plSubsistingLeave: number
  plLwp: number
  
  clTotalLeaveInAccount: number
  clLeaveAvailed: number
  clSubsistingLeave: number
  clLwp: number
  
  slTotalLeaveInAccount: number
  slLeaveAvailed: number
  slSubsistingLeave: number
  slLwp: number
}
```

---

## 🔢 CALCULATIONS

### Total Leaves Taken:
```javascript
totalLeavesTaken = plLeaveAvailed + clLeaveAvailed + slLeaveAvailed
```

### Total LWP:
```javascript
totalLwp = plLwp + clLwp + slLwp
```

### Gross Earnings (Actual):
```javascript
actualGross = basic + hra + conveyance + specialAllowance
```

### Gross Earnings (Earned):
```javascript
earnedGross = basicEarned + hraEarned + conveyanceEarned + 
              specialAllowanceEarned + bonusEarned + incentiveEarned + 
              incentive2Earned + adjustmentEarned + retentionBonus + 
              advanceAnyEarned
```

### Total Deductions:
```javascript
totalDeduction = pf + esic + pt + tds + retention + 
                 advanceAnyDeduction + adjustmentDeduction
```

### Net Salary:
```javascript
netSalary = earnedGross - totalDeduction
```

---

## 📝 IMPORTANT NOTES

1. **Show ALL entries including 0.00** - Don't filter out zero values
2. **Date Format**: DD-MM-YYYY (e.g., 21-04-2025)
3. **Currency Format**: ₹ with 2 decimal places (e.g., 1,800.00)
4. **LWP Column**: Use rowspan for merged cells in leave table
5. **GAP**: Empty column between EARNINGS and DEDUCTIONS
6. **Section Numbers**: Separate green boxes (01, 02, 03, 04)
7. **Font**: Inter (download from Google Fonts if needed)
8. **Borders**: Consistent 1.5-2px solid borders with color #CBD5E1

---

## 🎨 ExcelJS Tips (For You)

### Setting Colors:
```javascript
cell.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF7CB668' } // Note: Add 'FF' prefix for opacity
};
```

### Setting Fonts:
```javascript
cell.font = {
  name: 'Inter',
  size: 11,
  bold: true,
  color: { argb: 'FFFFFFFF' } // White
};
```

### Setting Borders:
```javascript
cell.border = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } }
};
```

### Merging Cells:
```javascript
worksheet.mergeCells('A1:B1');
const cell = worksheet.getCell('A1');
cell.value = 'Merged Text';
```

### Column Widths:
```javascript
worksheet.columns = [
  { width: 20 }, // Column A
  { width: 20 }, // Column B
  { width: 20 }, // Column C
  { width: 20 }  // Column D
];
```

---

## ✅ CHECKLIST

- [ ] Header with company name and title
- [ ] Section 01: Green number + Blue header + Employee info table
- [ ] Section 02: Green number + Blue header + Leave table with rowspan
- [ ] Section 03: Green number + Blue header + Salary tables with GAP
- [ ] Section 04: Green number + Blue label + Green amount
- [ ] Footer with company address
- [ ] All colors matching exactly
- [ ] Inter font applied
- [ ] All borders consistent
- [ ] Currency formatting correct
- [ ] Date formatting DD-MM-YYYY
- [ ] Show all entries (including 0.00)
- [ ] Calculations correct

---

**Good Luck Bhai! Is reference se Excel banao - 100% perfect banega!** 🚀
