import React, { useEffect, useState } from "react";
import { cn, convertNumberToWords } from "@/lib/utils";

interface SalarySlipProps {
  employee: any;
  record: any;
  leaveRecord?: any;
  className?: string;
}

export const SalarySlip: React.FC<SalarySlipProps> = ({ employee, record, leaveRecord, className }) => {
  const [companyLogo, setCompanyLogo] = useState<string>("");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("/api/settings/company-logo");
        const result = await response.json();
        if (result.success && result.data?.value) {
          setCompanyLogo(result.data.value);
        }
      } catch (error) {
        console.error("Error fetching company logo:", error);
      }
    };
    fetchLogo();
  }, []);
  
  const formatCurrency = (val?: number) => {
    return (val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDateToDDMMYYYY = (dateStr: string) => {
    if (!dateStr || dateStr === "-" || dateStr === "N/A") return "-";
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

  const earningRows = [
    { label: "Basic", actual: record.basic, earned: record.basicEarned },
    { label: "HRA", actual: record.hra, earned: record.hraEarned },
    { label: "Conveyance", actual: record.conveyance, earned: record.conveyanceEarned },
    { label: "Sp. Allowance", actual: record.specialAllowance, earned: record.specialAllowanceEarned },
    { label: "Bonus", actual: record.bonus, earned: record.bonusEarned },
    { label: "Incentive", actual: record.incentive, earned: record.incentiveEarned },
    { label: "Incentive 2", actual: record.incentive2, earned: record.incentive2Earned },
    { label: "Adjustment", actual: record.adjustment, earned: record.adjustmentEarned },
    { label: "Retention", actual: record.retentionEarning, earned: record.retentionEarningEarned },
    { label: "Advance", actual: record.advanceEarning, earned: record.advanceEarningEarned },
  ];

  const deductionRows = [
    { label: "PF", amount: record.pf },
    { label: "ESIC", amount: record.esic },
    { label: "PT", amount: record.pt },
    { label: "TDS", amount: record.tds },
    { label: "Retention", amount: record.retention },
    { label: "Advance", amount: record.advanceAnyDeduction },
    { label: "Adjustment", amount: record.adjustmentDeduction },
  ];

  const netSalary = record.netSalary || record.totalSalary || 0;

  return (
    <div className={cn("bg-white text-black font-sans", className)} style={{ maxWidth: '100%', margin: '0 auto', padding: '10mm 8mm' }}>
      {/* Header - Logo and Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '2px solid #8BBC83' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {companyLogo ? (
            <img 
              src={companyLogo} 
              alt="Company Logo" 
              style={{ height: '60px', width: 'auto', objectFit: 'contain', border: 'none', outline: 'none' }}
            />
          ) : (
            <div style={{ width: '80px', height: '60px', background: 'linear-gradient(135deg, #6A7D97 0%, #8BBC83 100%)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '28px' }}>
              WX
            </div>
          )}
          <div>
            <h1 style={{ color: '#6A7D97', fontWeight: '700', fontSize: '22px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WYZENTIQA</h1>
            <h1 style={{ color: '#6A7D97', fontWeight: '700', fontSize: '22px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '-4px' }}>XCELLENCE</h1>
            <p style={{ color: '#8BBC83', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>Built to Outrun the Ordinary</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#8BBC83', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>SALARY SLIP</p>
          <p style={{ color: '#6A7D97', fontSize: '15px', fontWeight: '600' }}>{record.month} {record.year}</p>
        </div>
      </div>

      {/* Employee Information */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#6b7280', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #9ca3af', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '4px', height: '16px', backgroundColor: '#9ca3af', borderRadius: '2px' }}></span>
          EMPLOYEE INFORMATION
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #6b7280' }}>
          <tbody>
            <tr>
              <td style={{ backgroundColor: '#f9fafb', border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '700', color: '#6b7280', width: '20%', fontSize: '11px', verticalAlign: 'middle' }}>Name</td>
              <td style={{ border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '600', color: '#4b5563', width: '30%', fontSize: '11px', verticalAlign: 'middle', backgroundColor: '#ffffff' }}>{employee.fullName}</td>
              <td style={{ backgroundColor: '#f9fafb', border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '700', color: '#6b7280', width: '20%', fontSize: '11px', verticalAlign: 'middle' }}>UAN No.</td>
              <td style={{ border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '600', color: '#4b5563', width: '30%', fontSize: '11px', verticalAlign: 'middle', backgroundColor: '#ffffff' }}>{employee.uanNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f9fafb', border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '700', color: '#6b7280', fontSize: '11px', verticalAlign: 'middle' }}>Department</td>
              <td style={{ border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '600', color: '#4b5563', fontSize: '11px', verticalAlign: 'middle', backgroundColor: '#ffffff' }}>{employee.department}</td>
              <td style={{ backgroundColor: '#f9fafb', border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '700', color: '#6b7280', fontSize: '11px', verticalAlign: 'middle' }}>ESIC No.</td>
              <td style={{ border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '600', color: '#4b5563', fontSize: '11px', verticalAlign: 'middle', backgroundColor: '#ffffff' }}>N/A</td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f9fafb', border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '700', color: '#6b7280', fontSize: '11px', verticalAlign: 'middle' }}>Designation</td>
              <td style={{ border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '600', color: '#4b5563', fontSize: '11px', verticalAlign: 'middle', backgroundColor: '#ffffff' }}>{employee.position || '-'}</td>
              <td style={{ backgroundColor: '#f9fafb', border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '700', color: '#6b7280', fontSize: '11px', verticalAlign: 'middle' }}>Bank A/C No.</td>
              <td style={{ border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '600', color: '#4b5563', fontSize: '11px', verticalAlign: 'middle', backgroundColor: '#ffffff' }}>{employee.accountNumber || '-'}</td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f9fafb', border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '700', color: '#6b7280', fontSize: '11px', verticalAlign: 'middle' }}>Date of Joining</td>
              <td style={{ border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '600', color: '#4b5563', fontSize: '11px', verticalAlign: 'middle', backgroundColor: '#ffffff' }}>{formatDateToDDMMYYYY(employee.joiningDate)}</td>
              <td style={{ backgroundColor: '#f9fafb', border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '700', color: '#6b7280', fontSize: '11px', verticalAlign: 'middle' }}>Days in Month</td>
              <td style={{ border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '600', color: '#4b5563', fontSize: '11px', verticalAlign: 'middle', backgroundColor: '#ffffff' }}>{record.daysInMonth || 30}</td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#f9fafb', border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '700', color: '#6b7280', fontSize: '11px', verticalAlign: 'middle' }}>Employee Code</td>
              <td colSpan={3} style={{ border: '1.5px solid #d1d5db', padding: '10px 14px', fontWeight: '600', color: '#4b5563', fontSize: '11px', verticalAlign: 'middle', backgroundColor: '#f8fafc' }}>{employee.employeeId}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Leave Details */}
      {leaveRecord && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#6b7280', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #9ca3af', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '4px', height: '16px', backgroundColor: '#9ca3af', borderRadius: '2px' }}></span>
            LEAVE DETAILS
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #6b7280' }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: '#6b7280', color: '#ffffff', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '12px 10px', letterSpacing: '0.5px', border: '2px solid rgba(255,255,255,0.25)', verticalAlign: 'middle' }}>LEAVE TYPE</th>
                <th style={{ backgroundColor: '#6b7280', color: '#ffffff', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '12px 10px', letterSpacing: '0.5px', border: '2px solid rgba(255,255,255,0.25)', verticalAlign: 'middle' }}>TOTAL IN ACCOUNT</th>
                <th style={{ backgroundColor: '#6b7280', color: '#ffffff', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '12px 10px', letterSpacing: '0.5px', border: '2px solid rgba(255,255,255,0.25)', verticalAlign: 'middle' }}>AVAILED</th>
                <th style={{ backgroundColor: '#6b7280', color: '#ffffff', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '12px 10px', letterSpacing: '0.5px', border: '2px solid rgba(255,255,255,0.25)', verticalAlign: 'middle' }}>SUBSISTING</th>
                <th style={{ backgroundColor: '#6b7280', color: '#ffffff', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '12px 10px', letterSpacing: '0.5px', border: '2px solid rgba(255,255,255,0.25)', verticalAlign: 'middle' }}>LWP</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: '#ffffff' }}>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>PL</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{leaveRecord.plTotalLeaveInAccount || 0}</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', textAlign: 'center', color: (leaveRecord.plLeaveAvailed || 0) > 0 ? '#dc2626' : '#4b5563', fontSize: '11px', verticalAlign: 'middle' }}>{leaveRecord.plLeaveAvailed || 0}</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{leaveRecord.plSubsistingLeave || 0}</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>-</td>
              </tr>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>CL</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{leaveRecord.clTotalLeaveInAccount || 0}</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', textAlign: 'center', color: (leaveRecord.clLeaveAvailed || 0) > 0 ? '#dc2626' : '#4b5563', fontSize: '11px', verticalAlign: 'middle' }}>{leaveRecord.clLeaveAvailed || 0}</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{leaveRecord.clSubsistingLeave || 0}</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>3.0</td>
              </tr>
              <tr style={{ backgroundColor: '#ffffff' }}>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>SL</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{leaveRecord.slTotalLeaveInAccount || 0}</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', textAlign: 'center', color: (leaveRecord.slLeaveAvailed || 0) > 0 ? '#dc2626' : '#4b5563', fontSize: '11px', verticalAlign: 'middle' }}>{leaveRecord.slLeaveAvailed || 0}</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{leaveRecord.slSubsistingLeave || 0}</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>-</td>
              </tr>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <td style={{ border: '1.5px solid #d1d5db', padding: '11px 12px', fontWeight: '700', color: '#6b7280', textAlign: 'left', fontSize: '11px', verticalAlign: 'middle' }}>Total Leaves Taken</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '11px 12px', fontWeight: '700', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{(leaveRecord.plLeaveAvailed || 0) + (leaveRecord.clLeaveAvailed || 0) + (leaveRecord.slLeaveAvailed || 0)}</td>
                <td colSpan={3} style={{ border: '1.5px solid #d1d5db', padding: '11px 12px', fontWeight: '700', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>Total Leave Without Pay: 3.0</td>
              </tr>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <td style={{ border: '1.5px solid #d1d5db', padding: '11px 12px', fontWeight: '700', color: '#6b7280', textAlign: 'left', fontSize: '11px', verticalAlign: 'middle' }}>Total Present Days</td>
                <td style={{ border: '1.5px solid #d1d5db', padding: '11px 12px', fontWeight: '700', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{record.daysInMonth - ((leaveRecord.plLeaveAvailed || 0) + (leaveRecord.clLeaveAvailed || 0) + (leaveRecord.slLeaveAvailed || 0))}</td>
                <td colSpan={3} style={{ border: '1.5px solid #d1d5db', padding: '11px 12px', fontWeight: '700', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>Total Days Payable: {record.daysInMonth}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Salary Details */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#6b7280', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #9ca3af', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '4px', height: '16px', backgroundColor: '#9ca3af', borderRadius: '2px' }}></span>
          SALARY DETAILS
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #6b7280' }}>
          <thead>
            <tr>
              <th colSpan={3} style={{ backgroundColor: '#6b7280', color: '#ffffff', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center', padding: '14px', letterSpacing: '0.8px', border: '2px solid #4b5563' }}>EARNING</th>
              <th colSpan={2} style={{ backgroundColor: '#6b7280', color: '#ffffff', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center', padding: '14px', letterSpacing: '0.8px', border: '2px solid #4b5563' }}>DEDUCTION</th>
            </tr>
            <tr>
              <th style={{ backgroundColor: '#9ca3af', color: '#ffffff', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '10px 8px', letterSpacing: '0.5px', border: '2px solid #6b7280', verticalAlign: 'middle' }}>COMPONENT</th>
              <th style={{ backgroundColor: '#9ca3af', color: '#ffffff', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '10px 8px', letterSpacing: '0.5px', border: '2px solid #6b7280', verticalAlign: 'middle' }}>ACTUAL</th>
              <th style={{ backgroundColor: '#9ca3af', color: '#ffffff', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '10px 8px', letterSpacing: '0.5px', border: '2px solid #6b7280', verticalAlign: 'middle' }}>EARNED</th>
              <th style={{ backgroundColor: '#9ca3af', color: '#ffffff', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '10px 8px', letterSpacing: '0.5px', border: '2px solid #6b7280', verticalAlign: 'middle' }}>COMPONENT</th>
              <th style={{ backgroundColor: '#9ca3af', color: '#ffffff', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '10px 8px', letterSpacing: '0.5px', border: '2px solid #6b7280', verticalAlign: 'middle' }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {earningRows.map((row, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                <td style={{ border: '2px solid #9ca3af', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{row.label}</td>
                <td style={{ border: '2px solid #9ca3af', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{row.actual !== undefined ? formatCurrency(row.actual) : "0.00"}</td>
                <td style={{ border: '2px solid #9ca3af', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{row.earned !== undefined ? formatCurrency(row.earned) : "0.00"}</td>
                <td style={{ border: '2px solid #9ca3af', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{deductionRows[idx]?.label || ""}</td>
                <td style={{ border: '2px solid #9ca3af', padding: '10px 12px', fontWeight: '600', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{deductionRows[idx]?.amount !== undefined && deductionRows[idx]?.amount !== null ? formatCurrency(deductionRows[idx].amount) : "0.00"}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <td style={{ border: '2px solid #9ca3af', padding: '11px 12px', fontWeight: '700', color: '#6b7280', textAlign: 'center', textTransform: 'uppercase', fontSize: '11px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Gross Earnings</td>
              <td style={{ border: '2px solid #9ca3af', padding: '11px 12px', fontWeight: '700', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{formatCurrency(record.actualGross)}</td>
              <td style={{ border: '2px solid #9ca3af', padding: '11px 12px', fontWeight: '700', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{formatCurrency(record.earnedGross)}</td>
              <td style={{ border: '2px solid #9ca3af', padding: '11px 12px', fontWeight: '700', color: '#6b7280', textAlign: 'center', textTransform: 'uppercase', fontSize: '11px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Total Deduction</td>
              <td style={{ border: '2px solid #9ca3af', padding: '11px 12px', fontWeight: '700', color: '#4b5563', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' }}>{formatCurrency(record.deductions)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#6b7280' }}>
              <td colSpan={3} style={{ border: '2px solid #4b5563', padding: '14px 18px', fontWeight: '700', color: '#ffffff', textAlign: 'center', fontSize: '14px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Net Salary Credited</td>
              <td colSpan={2} style={{ border: '2px solid #4b5563', padding: '14px 18px', fontWeight: '700', color: '#ffffff', textAlign: 'center', fontSize: '16px' }}>₹ {formatCurrency(netSalary)}</td>
            </tr>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td colSpan={3} style={{ border: '2px solid #9ca3af', padding: '12px 16px', fontWeight: '700', color: '#6b7280', textAlign: 'center', fontSize: '11px' }}>Amount in Words</td>
              <td colSpan={2} style={{ border: '2px solid #9ca3af', padding: '12px 16px', fontStyle: 'italic', color: '#9ca3af', fontWeight: '600', textAlign: 'center', fontSize: '11px' }}>
                {convertNumberToWords(netSalary)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '30px', paddingTop: '15px', borderTop: '2px solid #9ca3af', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '30px', fontWeight: '700', marginBottom: '6px', letterSpacing: '0.3px' }}>WyzentiQa Xcellence (OPC) Pvt.Ltd.</p>
        <p style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '500', marginTop: '5px' }}>Imperial Heights - 4/404, Near Akshar Chowk, Atladra, Vadodara - 390012, Gujarat, India</p>
      </div>
    </div>
  );
};
