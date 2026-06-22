import React from 'react';

interface PayslipData {
  companyName: string;
  companyAddress: string;
  employeeName: string;
  uanNo: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  employeeCode: string;
  esicNo: string;
  bankAccountNo: string;
  daysInMonth: number;
  leaves: {
    type: string;
    total: number;
    availed: number;
    subsisting: number;
    lwp: number;
  }[];
  totalLeavesTaken: number;
  totalLeaveWithoutPay: number;
  totalPresentDays: number;
  totalDaysPayable: number;
  earnings: {
    name: string;
    actualGross: number;
    earnedGross: number;
  }[];
  deductions: {
    name: string;
    amount: number;
  }[];
  grossEarnings: number;
  earnedGrossEarnings: number;
  totalDeduction: number;
  netSalaryCredited: number;
  month: number;
  year: number;
  amountInWords: string;
}

export function Payslip({ data }: { data: PayslipData }) {
  const monthName = new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  const [logoUrl, setLogoUrl] = React.useState<string>("");

  React.useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("/api/settings/company-logo");
        const result = await response.json();
        if (result.success && result.data?.value) {
          setLogoUrl(result.data.value);
        }
      } catch (error) {
        console.error("Failed to fetch logo:", error);
      }
    };
    fetchLogo();
  }, []);

  const fmt = (v: number) => Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ fontFamily: '"Inter",sans-serif', background: '#fff', maxWidth: '100%', width: '100%', margin: 0, border: 'none', overflow: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px 18px', borderBottom: '2px solid #e5e7eb', minHeight: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ height: '60px', width: 'auto', objectFit: 'contain', border: 'none', outline: 'none' }} />
          ) : (
            <div style={{ background: '#4a5f7a', color: '#fff', fontSize: '24px', fontWeight: 900, padding: '12px 16px', borderRadius: '6px' }}>WX</div>
          )}
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ color: '#7cb668', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>SALARY SLIP</h2>
          <p style={{ color: '#1e293b', fontSize: '18px', fontWeight: 900, margin: '4px 0 0 0' }}>{monthName}</p>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* Employee Information */}
        <div style={{ padding: 0, margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#4a5f7a', color: '#fff', borderRadius: '8px 8px 0 0', overflow: 'hidden', marginBottom: 0, border: '2px solid #cbd5e1', borderBottom: 'none' }}>
            <div style={{ background: '#7cb668', padding: '11px 16px', fontSize: '15px', fontWeight: 900, minWidth: '46px', textAlign: 'center', borderRight: '2px solid #cbd5e1' }}>01</div>
            <div style={{ padding: '11px 18px', fontWeight: 700, fontSize: '11px', letterSpacing: '.8px', textTransform: 'uppercase' }}>EMPLOYEE INFORMATION</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, border: '2px solid #cbd5e1', marginTop: 0, borderRadius: '8px', overflow: 'hidden', fontSize: '11.5px' }}>
            <tbody>
              <tr>
                <th style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, border: '1.5px solid #cbd5e1', padding: '10px 14px', textAlign: 'left', fontSize: '10.5px', width: '25%' }}>Name</th>
                <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 14px', color: '#1e293b', fontWeight: 600, background: '#fff', width: '25%' }}>{data.employeeName}</td>
                <th style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, border: '1.5px solid #cbd5e1', padding: '10px 14px', textAlign: 'left', fontSize: '10.5px', width: '25%' }}>UAN No.</th>
                <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 14px', color: '#1e293b', fontWeight: 600, background: '#fff', width: '25%' }}>{data.uanNo}</td>
              </tr>
              <tr>
                <th style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, border: '1.5px solid #cbd5e1', padding: '10px 14px', textAlign: 'left', fontSize: '10.5px' }}>Department</th>
                <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 14px', color: '#1e293b', fontWeight: 600, background: '#fff' }}>{data.department}</td>
                <th style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, border: '1.5px solid #cbd5e1', padding: '10px 14px', textAlign: 'left', fontSize: '10.5px' }}>ESIC No.</th>
                <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 14px', color: '#1e293b', fontWeight: 600, background: '#fff' }}>{data.esicNo}</td>
              </tr>
              <tr>
                <th style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, border: '1.5px solid #cbd5e1', padding: '10px 14px', textAlign: 'left', fontSize: '10.5px' }}>Designation</th>
                <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 14px', color: '#1e293b', fontWeight: 600, background: '#fff' }}>{data.designation}</td>
                <th style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, border: '1.5px solid #cbd5e1', padding: '10px 14px', textAlign: 'left', fontSize: '10.5px' }}>Bank A/C No.</th>
                <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 14px', color: '#1e293b', fontWeight: 600, background: '#fff' }}>{data.bankAccountNo}</td>
              </tr>
              <tr>
                <th style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, border: '1.5px solid #cbd5e1', padding: '10px 14px', textAlign: 'left', fontSize: '10.5px' }}>Date of Joining</th>
                <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 14px', color: '#1e293b', fontWeight: 600, background: '#fff' }}>{data.dateOfJoining}</td>
                <th style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, border: '1.5px solid #cbd5e1', padding: '10px 14px', textAlign: 'left', fontSize: '10.5px' }}>Days in Month</th>
                <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 14px', color: '#1e293b', fontWeight: 600, background: '#fff' }}>{data.daysInMonth}</td>
              </tr>
              <tr>
                <th style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, border: '1.5px solid #cbd5e1', padding: '10px 14px', textAlign: 'left', fontSize: '10.5px' }}>Employee Code</th>
                <td colSpan={3} style={{ border: '1.5px solid #cbd5e1', padding: '10px 14px', color: '#1e293b', fontWeight: 600, background: '#fff' }}>{data.employeeCode}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Leave Details */}
        <div style={{ padding: 0, margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#4a5f7a', color: '#fff', borderRadius: '8px 8px 0 0', overflow: 'hidden', marginBottom: 0, border: '2px solid #cbd5e1', borderBottom: 'none' }}>
            <div style={{ background: '#7cb668', padding: '11px 16px', fontSize: '15px', fontWeight: 900, minWidth: '46px', textAlign: 'center', borderRight: '2px solid #cbd5e1' }}>02</div>
            <div style={{ padding: '11px 18px', fontWeight: 700, fontSize: '11px', letterSpacing: '.8px', textTransform: 'uppercase' }}>LEAVE DETAILS</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, border: '2px solid #cbd5e1', marginTop: 0, borderRadius: '0 0 15px 15px', borderTop: 'none', fontSize: '11.5px' }}>
            <thead>
              <tr>
                <th style={{ background: '#4a5f7a', color: '#fff', padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: '10.5px', letterSpacing: '.4px', border: '1.5px solid #cbd5e1' }}>Leave Type</th>
                <th style={{ background: '#4a5f7a', color: '#fff', padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: '10.5px', letterSpacing: '.4px', border: '1.5px solid #cbd5e1' }}>Total in Account</th>
                <th style={{ background: '#7cb668', color: '#fff', padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: '10.5px', letterSpacing: '.4px', border: '1.5px solid #cbd5e1' }}>Availed</th>
                <th style={{ background: '#4a5f7a', color: '#fff', padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: '10.5px', letterSpacing: '.4px', border: '1.5px solid #cbd5e1' }}>Subsisting</th>
                <th style={{ background: '#4a5f7a', color: '#fff', padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: '10.5px', letterSpacing: '.4px', border: '1.5px solid #cbd5e1' }}>LWP</th>
              </tr>
            </thead>
            <tbody>
              {data.leaves.map((leave, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', color: '#1e293b', fontWeight: 600, background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>{leave.type}</td>
                  <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', color: '#1e293b', fontWeight: 600, background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>{leave.total.toFixed(1)}</td>
                  <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', color: '#7cb668', fontWeight: 700, background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>{leave.availed.toFixed(1)}</td>
                  <td style={{ border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', color: '#1e293b', fontWeight: 600, background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>{leave.subsisting.toFixed(1)}</td>
                  {idx === 0 && <td rowSpan={3} style={{ border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', color: '#1e293b', fontWeight: 600, background: '#fff' }}>{data.totalLeaveWithoutPay.toFixed(1)}</td>}
                </tr>
              ))}
              <tr>
                <td style={{ background: '#f0f9ec', fontWeight: 700, fontSize: '11px', color: '#64748b', border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'left', paddingLeft: '14px' }}>Total Leaves Taken</td>
                <td style={{ background: '#f0f9ec', fontWeight: 700, fontSize: '11px', color: '#1e293b', border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'center' }}>{data.totalLeavesTaken.toFixed(1)}</td>
                <td colSpan={2} style={{ background: '#f0f9ec', fontWeight: 700, fontSize: '11px', color: '#1e293b', border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'center' }}>Total Leave Without Pay (LWP)</td>
                <td style={{ background: '#f0f9ec', fontWeight: 700, fontSize: '11px', color: '#1e293b', border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'center' }}>{data.totalLeaveWithoutPay.toFixed(1)}</td>
              </tr>
              <tr>
                <td style={{ background: '#f0f9ec', fontWeight: 700, fontSize: '11px', color: '#64748b', border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'left', paddingLeft: '14px', borderBottomLeftRadius: '13px' }}>Total Present Days</td>
                <td style={{ background: '#f0f9ec', fontWeight: 700, fontSize: '11px', color: '#1e293b', border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'center' }}>{data.totalPresentDays.toFixed(1)}</td>
                <td colSpan={2} style={{ background: '#f0f9ec', fontWeight: 700, fontSize: '11px', color: '#1e293b', border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'center' }}>Total Days Payable</td>
                <td style={{ background: '#f0f9ec', fontWeight: 700, fontSize: '11px', color: '#1e293b', border: '1.5px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', borderBottomRightRadius: '13px' }}>{data.totalDaysPayable.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Salary Details */}
        <div style={{ padding: 0, margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#4a5f7a', color: '#fff', borderRadius: '8px 8px 0 0', overflow: 'hidden', marginBottom: 0, border: '2px solid #cbd5e1', borderBottom: 'none' }}>
            <div style={{ background: '#7cb668', padding: '11px 16px', fontSize: '15px', fontWeight: 900, minWidth: '46px', textAlign: 'center', borderRight: '2px solid #cbd5e1' }}>03</div>
            <div style={{ padding: '11px 18px', fontWeight: 700, fontSize: '11px', letterSpacing: '.8px', textTransform: 'uppercase' }}>SALARY DETAILS</div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', marginTop: '10px', position: 'relative' }}>
            {/* Earnings Box */}
            <div style={{ border: '2px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
              <div style={{ background: '#546e7a', padding: '12px 14px', textAlign: 'center', fontSize: '13.5px', fontWeight: 700, color: '#fff', letterSpacing: '.5px' }}>EARNINGS</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', flex: 1 }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#f4f8f3', color: '#6A7D97', padding: '10px', textAlign: 'center', fontWeight: 700, fontSize: '11.5px', border: '1px solid #dce3ea', borderTop: 'none' }}>Component</th>
                      <th style={{ background: '#f4f8f3', color: '#6A7D97', padding: '10px', textAlign: 'center', fontWeight: 700, fontSize: '11.5px', border: '1px solid #dce3ea', borderTop: 'none' }}>Actual (₹)</th>
                      <th style={{ background: '#f4f8f3', color: '#6A7D97', padding: '10px', textAlign: 'center', fontWeight: 700, fontSize: '11.5px', border: '1px solid #dce3ea', borderTop: 'none' }}>Earned (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.earnings.map((earning, idx) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #dce3ea', padding: '10px', textAlign: 'center', color: '#334155' }}>{earning.name}</td>
                        <td style={{ border: '1px solid #dce3ea', padding: '10px', textAlign: 'center', color: '#334155' }}>{fmt(earning.actualGross || 0)}</td>
                        <td style={{ border: '1px solid #dce3ea', padding: '10px', textAlign: 'center', color: '#334155' }}>{fmt(earning.earnedGross || 0)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ background: '#eaf3e8', fontWeight: 700, color: '#6A7D97', border: '1px solid #dce3ea', padding: '10px', textAlign: 'center' }}>Gross Earnings</td>
                      <td style={{ background: '#eaf3e8', fontWeight: 700, color: '#6A7D97', border: '1px solid #dce3ea', padding: '10px', textAlign: 'center' }}>{fmt(data.grossEarnings)}</td>
                      <td style={{ background: '#eaf3e8', fontWeight: 700, color: '#6A7D97', border: '1px solid #dce3ea', padding: '10px', textAlign: 'center' }}>{fmt(data.earnedGrossEarnings)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deductions Box */}
            <div style={{ border: '2px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
              <div style={{ background: '#81c784', padding: '12px 14px', textAlign: 'center', fontSize: '13.5px', fontWeight: 700, color: '#fff', letterSpacing: '.5px' }}>DEDUCTIONS</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', flex: 1 }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#f4f8f3', color: '#6A7D97', padding: '10px', textAlign: 'center', fontWeight: 700, fontSize: '11.5px', border: '1px solid #dce3ea', borderTop: 'none' }}>Component</th>
                      <th style={{ background: '#f4f8f3', color: '#6A7D97', padding: '10px', textAlign: 'center', fontWeight: 700, fontSize: '11.5px', border: '1px solid #dce3ea', borderTop: 'none' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.deductions.map((deduction, idx) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #dce3ea', padding: '10px', textAlign: 'center', color: '#334155' }}>{deduction.name}</td>
                        <td style={{ border: '1px solid #dce3ea', padding: '10px', textAlign: 'center', color: '#334155' }}>{fmt(deduction.amount || 0)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ background: '#eaf3e8', fontWeight: 700, color: '#6A7D97', border: '1px solid #dce3ea', padding: '10px', textAlign: 'center' }}>Total Deduction</td>
                      <td style={{ background: '#eaf3e8', fontWeight: 700, color: '#6A7D97', border: '1px solid #dce3ea', padding: '10px', textAlign: 'center' }}>{fmt(data.totalDeduction)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', marginTop: '18px', borderRadius: '15px', overflow: 'hidden', border: '2px solid #cbd5e1' }}>
            <div style={{ background: '#4a5f7a', color: '#fff', padding: '14px 18px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '.4px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, background: '#7cb668', padding: '5px 11px', borderRadius: '4px' }}>04</span>
              Net Salary Credited
            </div>
            <div style={{ background: '#7cb668', color: '#fff', padding: '14px', textAlign: 'center', fontSize: '24px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ₹ {fmt(data.netSalaryCredited)}
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '16px 28px', borderTop: '2px solid #cbd5e1', marginTop: '12px', background: '#fafafa' }}>
        <h3 style={{ color: '#1e293b', fontSize: '14px', fontWeight: 800, margin: '0 0 3px 0' }}>WyzentiQa Xcellence (OPC) Pvt. Ltd.</h3>
        <p style={{ color: '#64748b', fontSize: '10.5px', fontWeight: 500, lineHeight: '1.4', margin: 0 }}>Imperial Heights - 4/404, Near Akshar Chowk, Atladra, Vadodara - 390012, Gujarat, India</p>
      </div>
    </div>
  );
}
