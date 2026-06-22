import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "@/components/Navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Ticket as TicketIcon,
  Plus,
  Search,
  RefreshCw,
  Eye,
  MessageSquare,
  Settings,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Download,
  Zap,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";

interface Ticket {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  userEmail: string;
  userName: string;
  status: "open" | "pending" | "in_progress" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  replies: Array<{
    from: string;
    message: string;
    timestamp: string;
    isAdmin: boolean;
  }>;
  createdAt: string;
  lastUpdated: string;
}

interface Stats {
  total: number;
  open: number;
  pending: number;
  inProgress: number;
  closed: number;
  highPriority: number;
  urgentPriority: number;
}

export default function Helpdesk() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState<{
    isMonitoring: boolean;
    message: string;
  } | null>(null);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    userEmail: "",
    userName: "",
    priority: "medium",
    category: "other",
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (userRole !== "admin" && userRole !== "it") {
      navigate("/");
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchTickets(), fetchStats(), fetchMonitoringStatus()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  const fetchMonitoringStatus = async () => {
    try {
      const response = await fetch("/api/helpdesk/monitor/status");
      const data = await response.json();
      if (data.success) {
        setMonitoringStatus(data.data);
      }
    } catch (error) {
      console.error("Error fetching monitoring status:", error);
    }
  };

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/helpdesk/tickets?${params}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/helpdesk/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreateTicket = async () => {
    try {
      const response = await fetch("/api/helpdesk/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateModal(false);
        setNewTicket({
          subject: "",
          description: "",
          userEmail: "",
          userName: "",
          priority: "medium",
          category: "other",
        });
        loadData();
      } else {
        alert("Error creating ticket: " + data.error);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Error creating ticket");
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const response = await fetch(`/api/helpdesk/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        loadData();
        if (selectedTicket && selectedTicket.ticketId === ticketId) {
          setSelectedTicket(data.data);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleUpdatePriority = async (ticketId: string, priority: string) => {
    try {
      const response = await fetch(`/api/helpdesk/tickets/${ticketId}/priority`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });

      const data = await response.json();

      if (data.success) {
        loadData();
        if (selectedTicket && selectedTicket.ticketId === ticketId) {
          setSelectedTicket(data.data);
        }
      }
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  const handleClearAllTickets = async () => {
    const password = prompt("Enter password to clear all tickets:");
    
    if (password === null) {
      return; // User cancelled
    }

    if (password !== "123") {
      alert("Incorrect password!");
      return;
    }

    const confirmClear = confirm(
      `⚠️ WARNING ⚠️\n\nThis will permanently delete ALL ${tickets.length} tickets!\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?`
    );

    if (!confirmClear) {
      return;
    }

    try {
      setIsRefreshing(true);
      const response = await fetch("/api/helpdesk/clear-all-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Successfully deleted ${data.deletedCount} tickets!`);
        loadData(); // Reload to show empty list
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error clearing tickets:", error);
      alert("Error clearing tickets");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSendingReply(true);
    try {
      const currentUser = localStorage.getItem("currentUser") || "Admin";

      const response = await fetch(`/api/helpdesk/tickets/${selectedTicket.ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage,
          from: currentUser,
          isAdmin: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedTicket(data.data);
        setReplyMessage("");
        loadData();
      } else {
        alert("Error sending reply: " + data.error);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Error sending reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  const exportToExcel = () => {
    if (tickets.length === 0) {
      alert("No tickets to export");
      return;
    }

    const exportData = tickets.map((t) => ({
      "Ticket ID": t.ticketId,
      Subject: t.subject,
      "User Email": t.userEmail,
      "User Name": t.userName,
      Status: t.status,
      Priority: t.priority,
      Category: t.category,
      Description: t.description,
      "Created Date": new Date(t.createdAt).toLocaleDateString(),
      "Created Time": new Date(t.createdAt).toLocaleTimeString(),
      "Last Updated": new Date(t.lastUpdated).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

    const timestamp = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Helpdesk_Tickets_${timestamp}.xlsx`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Zap className="h-4 w-4" />;
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <TicketIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "in_progress":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      case "closed":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/50";
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading Helpdesk..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <TicketIcon className="h-7 w-7 text-purple-400" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                IT Helpdesk
              </h1>
              <p className="text-slate-400 text-sm">
                Ticket Management & Email Automation
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {monitoringStatus && (
              <Badge
                variant="outline"
                className={`${
                  monitoringStatus.isMonitoring
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : "bg-slate-500/20 text-slate-400 border-slate-500/50"
                }`}
              >
                <Zap className="h-3 w-3 mr-1" />
                {monitoringStatus.isMonitoring ? "Monitoring Active" : "Monitoring Inactive"}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/helpdesk/settings")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllTickets}
              disabled={isRefreshing || tickets.length === 0}
              className="border-red-600 text-red-400 hover:bg-red-900/20"
              title="Clear all tickets (requires password)"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isRefreshing}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="text-slate-400 text-xs mb-1">Total</div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-blue-500/50">
              <CardContent className="p-4">
                <div className="text-blue-400 text-xs mb-1">Open</div>
                <div className="text-2xl font-bold text-white">{stats.open}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-yellow-500/50">
              <CardContent className="p-4">
                <div className="text-yellow-400 text-xs mb-1">Pending</div>
                <div className="text-2xl font-bold text-white">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-purple-500/50">
              <CardContent className="p-4">
                <div className="text-purple-400 text-xs mb-1">In Progress</div>
                <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-green-500/50">
              <CardContent className="p-4">
                <div className="text-green-400 text-xs mb-1">Closed</div>
                <div className="text-2xl font-bold text-white">{stats.closed}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-orange-500/50">
              <CardContent className="p-4">
                <div className="text-orange-400 text-xs mb-1">High</div>
                <div className="text-2xl font-bold text-white">{stats.highPriority}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-red-500/50">
              <CardContent className="p-4">
                <div className="text-red-400 text-xs mb-1">Urgent</div>
                <div className="text-2xl font-bold text-white">{stats.urgentPriority}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchTickets()}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchTickets} className="bg-purple-500 hover:bg-purple-600">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Tickets ({tickets.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Ticket ID</TableHead>
                    <TableHead className="text-slate-300">Subject</TableHead>
                    <TableHead className="text-slate-300">User</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Priority</TableHead>
                    <TableHead className="text-slate-300">Created</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                        No tickets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tickets.map((ticket) => (
                      <TableRow key={ticket._id} className="border-slate-700">
                        <TableCell className="text-white font-mono text-sm">
                          {ticket.ticketId}
                        </TableCell>
                        <TableCell className="text-white max-w-xs truncate">
                          {ticket.subject}
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm">
                          <div>{ticket.userName || ticket.userEmail.split("@")[0]}</div>
                          <div className="text-xs text-slate-500">{ticket.userEmail}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(ticket.status)} border`}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1 capitalize">{ticket.status.replace("_", " ")}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getPriorityColor(ticket.priority)} border`}>
                            {ticket.priority.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowTicketModal(true);
                            }}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Ticket Details Modal */}
      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Ticket Details</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm">Ticket ID</label>
                  <div className="text-white font-mono">{selectedTicket.ticketId}</div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Created</label>
                  <div className="text-white">{new Date(selectedTicket.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">User</label>
                  <div className="text-white">{selectedTicket.userName || selectedTicket.userEmail}</div>
                  <div className="text-slate-400 text-xs">{selectedTicket.userEmail}</div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Category</label>
                  <div className="text-white capitalize">{selectedTicket.category}</div>
                </div>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Status</label>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => handleUpdateStatus(selectedTicket.ticketId, value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Priority</label>
                  <Select
                    value={selectedTicket.priority}
                    onValueChange={(value) => handleUpdatePriority(selectedTicket.ticketId, value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject & Description */}
              <div>
                <label className="text-slate-400 text-sm">Subject</label>
                <div className="text-white font-semibold">{selectedTicket.subject}</div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Description</label>
                <div className="bg-slate-700/50 p-4 rounded-lg text-white whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Replies */}
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Conversation</label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                    selectedTicket.replies.map((reply, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          reply.isAdmin
                            ? "bg-purple-500/20 border border-purple-500/50"
                            : "bg-slate-700/50 border border-slate-600"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">
                            {reply.isAdmin ? "🛠️ " : "👤 "}
                            {reply.from}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(reply.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-white text-sm whitespace-pre-wrap">{reply.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-sm text-center py-4">No replies yet</div>
                  )}
                </div>
              </div>

              {/* Reply Form */}
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Send Reply</label>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="bg-slate-700 border-slate-600 text-white mb-2"
                  rows={4}
                />
                <Button
                  onClick={handleSendReply}
                  disabled={isSendingReply || !replyMessage.trim()}
                  className="bg-purple-500 hover:bg-purple-600 w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {isSendingReply ? "Sending..." : "Send Reply & Email User"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Ticket Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription className="text-slate-400">
              Manually create a support ticket
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm mb-2 block">Subject *</label>
              <Input
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Brief description of the issue"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-2 block">Description *</label>
              <Textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Detailed description of the issue"
                className="bg-slate-700 border-slate-600 text-white"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm mb-2 block">User Email *</label>
                <Input
                  type="email"
                  value={newTicket.userEmail}
                  onChange={(e) => setNewTicket({ ...newTicket, userEmail: e.target.value })}
                  placeholder="user@example.com"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-2 block">User Name</label>
                <Input
                  value={newTicket.userName}
                  onChange={(e) => setNewTicket({ ...newTicket, userName: e.target.value })}
                  placeholder="John Doe"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Priority</label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Category</label>
                <Select
                  value={newTicket.category}
                  onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                    <SelectItem value="access">Access</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleCreateTicket}
              disabled={!newTicket.subject || !newTicket.description || !newTicket.userEmail}
              className="bg-purple-500 hover:bg-purple-600 w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
