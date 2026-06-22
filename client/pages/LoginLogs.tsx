import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface LoginLog {
  _id: string;
  username: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  loginTime: string;
  status: "success" | "failed";
  failureReason?: string;
  createdAt: string;
}

export default function LoginLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");

  useEffect(() => {
    // Check if user is admin or IT
    const role = localStorage.getItem("userRole");
    if (role !== "admin" && role !== "it") {
      navigate("/");
      return;
    }

    fetchLogs();
  }, [navigate]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/login-logs?limit=100");
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    return log.status === filter;
  });

  const successCount = logs.filter((log) => log.status === "success").length;
  const failedCount = logs.filter((log) => log.status === "failed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Login Logs
            </h1>
            <p className="text-slate-400">View all user login attempts</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchLogs}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Attempts</p>
                  <p className="text-2xl font-semibold text-white">{logs.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Successful</p>
                  <p className="text-2xl font-semibold text-green-400">{successCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Failed</p>
                  <p className="text-2xl font-semibold text-red-400">{failedCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={filter === "all" ? "bg-blue-500" : "border-slate-600 text-slate-300"}
          >
            All ({logs.length})
          </Button>
          <Button
            onClick={() => setFilter("success")}
            variant={filter === "success" ? "default" : "outline"}
            className={filter === "success" ? "bg-green-500" : "border-slate-600 text-slate-300"}
          >
            Success ({successCount})
          </Button>
          <Button
            onClick={() => setFilter("failed")}
            variant={filter === "failed" ? "default" : "outline"}
            className={filter === "failed" ? "bg-red-500" : "border-slate-600 text-slate-300"}
          >
            Failed ({failedCount})
          </Button>
        </div>

        {/* Logs Table */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Login History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No logs found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Username</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">IP Address</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Date & Time</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log._id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          {log.status === "success" ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">{log.username}</td>
                        <td className="py-3 px-4 text-slate-300">{log.ipAddress}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {format(new Date(log.loginTime), "MMM dd, yyyy HH:mm:ss")}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-sm">
                          {log.failureReason || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
