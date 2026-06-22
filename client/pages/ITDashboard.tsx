import AppNav from "@/components/Navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ServerCog,
  User,
  Building2,
  Plus,
  ArrowRight,
  CheckCircle,
  Bell,
  Settings,
  Eye,
  AlertCircle,
  X,
  RefreshCw,
  ArrowLeft,
  Download,
  DatabaseBackup,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  getPendingNotifications,
  markAsProcessed,
  deleteNotification,
} from "@/lib/notifications";

interface ITRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  systemId: string;
  tableNumber: string;
  department: string;
  emails: { email: string; password: string }[];
  vitelGlobal: {
    id?: string;
    provider?: "vitel" | "vonage";
    type?: string;
    extNumber?: string;
    password?: string;
  };
  lmPlayer: { id: string; password: string; license: string };
  notes?: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface Employee {
  id: string;
  fullName: string;
  department: string;
  status: "active" | "inactive";
}
interface Department {
  id: string;
  name: string;
}

interface PendingITNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  tableNumber: string;
  email: string;
  createdAt: string;
  processed: boolean;
}

export default function ITDashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ITRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingNotifications, setPendingNotifications] = useState<
    PendingITNotification[]
  >([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState<{
    percent: number;
    message: string;
    done?: number;
    total?: number;
    stage?: string;
  } | null>(null);
  const [backupLogs, setBackupLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const fetchBackupLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch("/api/db-backup/logs");
      const data = await res.json();
      if (data.success) setBackupLogs(data.data);
    } catch {}
    setIsLoadingLogs(false);
  };

  const handleBackup = async () => {
    const pwd = prompt("🔒 DB BACKUP\n\nEnter Password:");
    if (pwd !== "123") {
      if (pwd !== null) alert("❌ Incorrect Password!");
      return;
    }
    setIsBackingUp(true);
    setBackupProgress({ percent: 0, message: "Starting backup..." });

    const currentUser = localStorage.getItem("currentUser") || "Unknown";

    try {
      const res = await fetch("/api/db-backup", {
        method: "POST",
        headers: { "x-user": currentUser },
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              setBackupProgress({
                percent: data.percent,
                message: data.message,
                done: data.done,
                total: data.total,
                stage: data.stage,
              });
              if (data.type === "done" || data.type === "error") {
                fetchBackupLogs();
                setTimeout(() => {
                  setIsBackingUp(false);
                  setBackupProgress(null);
                }, 3000);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setBackupProgress({ percent: 0, message: "❌ Network error during backup." });
      setTimeout(() => { setIsBackingUp(false); setBackupProgress(null); }, 3000);
    }
  };
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load IT records from database
  const loadITRecords = async (showError = true) => {
    try {
      const response = await fetch("/api/it-accounts");
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch IT accounts");
      }
      const itsData = await response.json();
      if (itsData.success && itsData.data) {
        // Map MongoDB _id to id for consistency
        const mappedRecords = itsData.data.map((rec: any) => ({
          ...rec,
          id: rec._id,
        }));
        setRecords(mappedRecords);
        setLastError(null);
        setLastUpdated(new Date());
      }
    } catch (error) {
      if (showError) {
        console.error("Failed to load IT records:", error);
      }
      // Only set last error if it's a persistent issue
      if (error instanceof Error && error.message.includes("fetch")) {
        setLastError("Network error: Server might be restarting...");
      } else {
        setLastError(
          error instanceof Error ? error.message : "Failed to load IT records",
        );
      }
    }
  };

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadITRecords(false),
        (async () => {
          const res = await fetch("/api/departments");
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              setDepartments(
                data.data.map((dept: any) => ({ ...dept, id: dept._id })),
              );
            }
          }
        })(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Delete IT record with password protection
  const handleDeleteRecord = async (recordId: string, recordName: string) => {
    // Ask for password
    const password = prompt(`Enter password to delete IT account for ${recordName}:`);
    
    if (password === null) {
      // User cancelled
      return;
    }
    
    if (password !== "123") {
      alert("Incorrect password! Deletion cancelled.");
      return;
    }

    // Confirm deletion
    const confirmDelete = confirm(
      `Are you sure you want to delete IT account for ${recordName}?\n\nThis action cannot be undone!`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/it-accounts/${recordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete IT account");
      }

      const result = await response.json();
      
      if (result.success) {
        alert(`IT account for ${recordName} deleted successfully!`);
        // Reload the records
        await loadITRecords();
      } else {
        throw new Error(result.error || "Failed to delete IT account");
      }
    } catch (error) {
      console.error("Error deleting IT account:", error);
      alert(
        `Failed to delete IT account: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const exportToExcel = () => {
    if (records.length === 0) {
      alert("No IT records to export");
      return;
    }

    // Prepare data for export with ALL information
    const exportData = records.map((r) => {
      // Format all emails with passwords
      const emailDetails = r.emails.map((e, idx) => {
        const provider = e.provider === "CUSTOM" ? e.providerCustom : e.provider;
        return `${idx + 1}. ${provider}: ${e.email} | Password: ${e.password || "-"}`;
      }).join(" | ");

      return {
        "Employee ID": r.employeeId,
        "Employee Name": r.employeeName,
        "Department": r.department,
        "Table Number": r.tableNumber,
        "Status": r.status === "active" ? "Active" : "Inactive",
        "System ID": r.systemId,
        "Email Accounts": emailDetails || "-",
        "Email 1": r.emails[0]?.email || "-",
        "Email 1 Password": r.emails[0]?.password || "-",
        "Email 2": r.emails[1]?.email || "-",
        "Email 2 Password": r.emails[1]?.password || "-",
        "Email 3": r.emails[2]?.email || "-",
        "Email 3 Password": r.emails[2]?.password || "-",
        "VG/VON Provider": (r as any).vitelGlobal?.provider === "vonage" ? "Vonage" : "Vitel Global",
        "VG/VON ID": r.vitelGlobal?.id || "-",
        "LM ID": r.lmPlayer.id || "-",
        "LM Password": r.lmPlayer.password || "-",
        "LM License": r.lmPlayer.license || "Standard",
        "Notes": r.notes || "-",
        "Created Date": new Date(r.createdAt).toLocaleDateString(),
        "Created Time": new Date(r.createdAt).toLocaleTimeString(),
      };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths for all columns
    const columnWidths = [
      { wch: 12 }, // Employee ID
      { wch: 20 }, // Employee Name
      { wch: 15 }, // Department
      { wch: 12 }, // Table Number
      { wch: 10 }, // Status
      { wch: 12 }, // System ID
      { wch: 45 }, // Email Accounts (combined)
      { wch: 25 }, // Email 1
      { wch: 20 }, // Email 1 Password
      { wch: 25 }, // Email 2
      { wch: 20 }, // Email 2 Password
      { wch: 25 }, // Email 3
      { wch: 20 }, // Email 3 Password
      { wch: 15 }, // VG/VON Provider
      { wch: 15 }, // VG/VON ID
      { wch: 12 }, // LM ID
      { wch: 20 }, // LM Password
      { wch: 12 }, // LM License
      { wch: 30 }, // Notes
      { wch: 12 }, // Created Date
      { wch: 12 }, // Created Time
    ];
    worksheet["!cols"] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IT Accounts");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `IT_Accounts_${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, filename);
  };

  useEffect(() => {
    // Check access control
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Only admin and it users can access IT dashboard
    if (userRole !== "admin" && userRole !== "it") {
      navigate("/");
      return;
    }

    loadAllData().finally(() => setIsLoading(false));
    fetchBackupLogs();

    // Load pending notifications for new employees
    const pending = getPendingNotifications();
    setPendingNotifications(pending as any);

    // Polling mechanism - check for new IT records and notifications every 10 seconds (increased from 5s)
    const refreshInterval = setInterval(() => {
      // Don't poll if the page is hidden to save resources and avoid noise
      if (!document.hidden) {
        loadITRecords(false);
        const freshPending = getPendingNotifications();
        setPendingNotifications(freshPending as any);
      }
    }, 10000);

    // Also reload when page becomes visible (tab focus)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadITRecords(false);
        const freshPending = getPendingNotifications();
        setPendingNotifications(freshPending as any);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);

  // Remove the separate useEffects for assets and pc-laptops as they are now in loadAllData

  const handleProcessEmployee = (notification: PendingITNotification) => {
    // Do NOT mark processed here. Keep notification until IT record is created.
    const urlParams = new URLSearchParams({
      employeeId: notification.employeeId,
      employeeName: notification.employeeName,
      department: notification.department,
      tableNumber: notification.tableNumber,
    });
    window.location.href = `/it?${urlParams.toString()}`;
  };

  // Delete/dismiss a notification
  const handleDeleteNotification = async (notificationId: string, employeeName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown item click
    
    const confirmDelete = confirm(`Remove notification for ${employeeName}?`);
    if (!confirmDelete) return;

    try {
      await deleteNotification(notificationId);
      // Refresh notifications
      const updated = await getPendingNotifications();
      setPendingNotifications(updated);
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification");
    }
  };

  const filtered = records.filter((r) => {
    const matchDept = deptFilter === "all" || r.department === deptFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const providerLabel =
      (r as any).vitelGlobal?.provider === "vonage"
        ? "vonage"
        : (r as any).vitelGlobal?.provider
          ? "vitel"
          : "vitel";
    const text =
      `${r.employeeName} ${r.systemId} ${r.emails.map((e) => e.email).join(" ")} ${r.vitelGlobal?.id || ""} ${providerLabel}`.toLowerCase();
    const matchQuery = !query || text.includes(query.toLowerCase());
    return matchDept && matchStatus && matchQuery;
  });

  if (isLoading) {
    return <LoadingScreen message="Loading IT Dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900 animate-fade-in">

      {/* Backup Progress Overlay */}
      {isBackingUp && backupProgress && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <DatabaseBackup className="h-6 w-6 text-yellow-400 animate-pulse flex-shrink-0" />
              <h3 className="text-white font-bold text-lg">DB Backup in Progress</h3>
              {backupProgress.stage && (
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  backupProgress.stage === "mongodb"
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-purple-500/20 text-purple-300"
                }`}>
                  {backupProgress.stage === "mongodb" ? "📦 MongoDB" : "🖼️ Files"}
                </span>
              )}
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-4 mb-3 overflow-hidden">
              <div
                className="h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${backupProgress.percent}%`,
                  background: backupProgress.percent === 100
                    ? "linear-gradient(90deg,#22c55e,#16a34a)"
                    : "linear-gradient(90deg,#eab308,#f59e0b)",
                }}
              />
            </div>
            {/* Percent + collection count */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-yellow-400 font-bold text-2xl">{backupProgress.percent}%</span>
              {backupProgress.done !== undefined && backupProgress.total !== undefined && (
                <span className="text-slate-400 text-sm">
                  {backupProgress.done} / {backupProgress.total} collections
                </span>
              )}
            </div>
            {/* Current message */}
            <p className="text-slate-300 text-sm truncate">{backupProgress.message}</p>
            {backupProgress.percent === 100 && (
              <p className="text-green-400 text-sm font-semibold mt-2">✅ Backup Complete!</p>
            )}
          </div>
        </div>
      )}

      <AppNav />
      {/* Backup Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowLogsModal(false)}>
          <div className="bg-slate-800 border border-slate-600 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <DatabaseBackup className="h-5 w-5 text-yellow-400" />
                <h3 className="text-white font-bold text-lg">Backup History</h3>
                <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">{backupLogs.length} records</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => fetchBackupLogs()} disabled={isLoadingLogs} className="text-slate-400 hover:text-white">
                  <RefreshCw className={`h-4 w-4 ${isLoadingLogs ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowLogsModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Modal Body */}
            <div className="overflow-auto flex-1 p-4">
              {backupLogs.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No backup history found.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                      <th className="text-left py-2 px-3">Status</th>
                      <th className="text-left py-2 px-3">User</th>
                      <th className="text-left py-2 px-3">Date & Time</th>
                      <th className="text-left py-2 px-3">Duration</th>
                      <th className="text-left py-2 px-3">Collections</th>
                      <th className="text-left py-2 px-3">Docs</th>
                      <th className="text-left py-2 px-3">Files</th>
                      <th className="text-left py-2 px-3">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupLogs.map((log, i) => {
                      const start = new Date(log.startedAt);
                      const end = log.completedAt ? new Date(log.completedAt) : null;
                      const duration = end ? `${Math.round((end.getTime() - start.getTime()) / 1000)}s` : "—";
                      return (
                        <tr key={log._id || i} className="border-b border-slate-800 hover:bg-slate-700/30">
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              log.status === "success" ? "bg-green-500/20 text-green-400"
                              : log.status === "failed" ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                            }`}>
                              {log.status === "success" ? "✅ Success" : log.status === "failed" ? "❌ Failed" : "⏳ Running"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-white font-medium">{log.performedBy}</td>
                          <td className="py-2 px-3 text-slate-300 whitespace-nowrap">
                            {start.toLocaleDateString("en-IN")} {start.toLocaleTimeString("en-IN")}
                          </td>
                          <td className="py-2 px-3 text-slate-400">{duration}</td>
                          <td className="py-2 px-3 text-slate-300">{log.collectionsCount || "—"}</td>
                          <td className="py-2 px-3 text-slate-300">{log.totalDocs || "—"}</td>
                          <td className="py-2 px-3 text-slate-300">{log.filesCount || "—"}</td>
                          <td className="py-2 px-3 text-red-400 text-xs max-w-[150px] truncate">{log.errorMessage || ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 overflow-x-hidden">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 self-start"
              title="Go back to previous page"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ServerCog className="h-7 w-7 text-blue-400 flex-shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                IT Dashboard
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Overview of IT accounts and systems
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
            {lastError && (
              <Badge
                variant="outline"
                className="border-red-500/50 text-red-400 bg-red-500/10 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" /> {lastError}
              </Badge>
            )}
            {lastUpdated && !lastError && (
              <span className="text-slate-500 text-xs hidden sm:inline">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
              onClick={exportToExcel}
              title="Download IT accounts information as Excel file"
            >
              <Download className="h-4 w-4 mr-2" /> Export Excel
            </Button>
            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20 hover:text-yellow-300 transition-all duration-300"
                onClick={handleBackup}
                disabled={isBackingUp}
                title="Backup all data to secondary MongoDB"
              >
                <DatabaseBackup className={`h-4 w-4 mr-2 ${isBackingUp ? "animate-pulse" : ""}`} />
                {isBackingUp ? "Backing up..." : "DB Backup"}
              </Button>
              {/* Hover tooltip — last backup info */}
              {!isBackingUp && backupLogs.length > 0 && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wide">Last Backup</p>
                  <p className="text-white text-sm font-medium">
                    {backupLogs[0].status === "success" ? "✅" : "❌"} {backupLogs[0].performedBy}
                  </p>
                  <p className="text-slate-300 text-xs mt-1">
                    {new Date(backupLogs[0].startedAt).toLocaleDateString("en-IN")}{" "}
                    {new Date(backupLogs[0].startedAt).toLocaleTimeString("en-IN")}
                  </p>
                  <p className="text-yellow-400 text-xs mt-1">Click history icon to view all logs →</p>
                </div>
              )}
            </div>
            {/* Logs history button */}
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
              onClick={() => { fetchBackupLogs(); setShowLogsModal(true); }}
              title="View backup history"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingLogs ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
              onClick={loadAllData}
              disabled={isRefreshing}
              title="Refresh IT records and notifications"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 relative"
                >
                  <Bell className="h-4 w-4" />
                  {pendingNotifications.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      {pendingNotifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-slate-800 border-slate-700 text-white w-80"
                align="end"
              >
                {pendingNotifications.length === 0 ? (
                  <DropdownMenuItem className="focus:bg-slate-700 cursor-default">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle className="h-4 w-4" />
                      No pending IT setups
                    </div>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <div className="px-3 py-2 text-sm font-semibold text-slate-300 border-b border-slate-700">
                      Pending IT Setups ({pendingNotifications.length})
                    </div>
                    {pendingNotifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="focus:bg-slate-700 cursor-pointer p-3"
                        onClick={() => handleProcessEmployee(notification)}
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">
                              {notification.employeeName}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="bg-orange-500/20 text-orange-400 text-xs"
                              >
                                New
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-slate-400 hover:text-red-400 hover:bg-red-900/20"
                                onClick={(e) => handleDeleteNotification(notification.id, notification.employeeName, e)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">
                            {notification.department} •{" "}
                            {isNaN(Number(notification.tableNumber))
                              ? notification.tableNumber
                              : `Table ${notification.tableNumber}`}
                          </div>
                          <div className="text-xs text-slate-500">
                            Created{" "}
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString()}
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white mt-2 w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProcessEmployee(notification);
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Process IT Setup
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => (window.location.href = "/it")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Add Credentials <Plus className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </header>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">IT Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-slate-700 text-slate-300"
                >
                  {filtered.length}
                </Badge>
                <span className="text-slate-400">results</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, system, email"
                  className="bg-slate-800/50 border-slate-700 text-white w-full sm:w-64"
                />
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-full sm:w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem key="all" value="all">
                      All Departments
                    </SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id || d._id || d.name} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 w-full sm:w-auto"
                  onClick={() => {
                    setQuery("");
                    setDeptFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>System ID</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Emails</TableHead>
                    <TableHead>VG/VON</TableHead>
                    <TableHead>VG/VON ID</TableHead>
                    <TableHead>LM ID</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer hover:bg-slate-800/50 transition-colors"
                      onClick={() => navigate(`/it-preview/${r.id}`)}
                    >
                      <TableCell className="font-medium text-blue-400 hover:underline">
                        {r.employeeName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "active" ? "default" : "secondary"
                          }
                          className={
                            r.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {r.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.department}</TableCell>
                      <TableCell>{r.systemId}</TableCell>
                      <TableCell>{r.tableNumber}</TableCell>
                      <TableCell>
                        {r.emails.map((e) => e.email).join(", ") || "-"}
                      </TableCell>
                      <TableCell>
                        {r.vitelGlobal?.id
                          ? (r as any).vitelGlobal?.provider === "vonage"
                            ? "Vonage"
                            : "Vitel Global"
                          : "-"}
                      </TableCell>
                      <TableCell>{r.vitelGlobal?.id || "-"}</TableCell>
                      <TableCell>{r.lmPlayer.id || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/it-preview/${r.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRecord(r.id, r.employeeName);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => (window.location.href = "/it")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Go to IT Form <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
