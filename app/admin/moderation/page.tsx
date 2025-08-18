"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Shield, MessageSquare, Flag, ArrowLeft, Search, Eye, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminUser {
  id: number
  email: string
  name: string
  role: string
}

interface Report {
  id: string
  reporter_id: string
  reporter_name: string
  reported_content_type: string
  reported_content_id: string
  reported_content_title: string
  reason: string
  description: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  sender_id: string
  sender_name: string
  receiver_id: string
  receiver_name: string
  content: string
  is_read: boolean
  created_at: string
}

export default function ModerationPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("adminToken")
    const userStr = localStorage.getItem("adminUser")

    if (!token || !userStr) {
      router.push("/admin/login")
      return
    }

    try {
      const user = JSON.parse(userStr)
      setAdminUser(user)
      
      // Check if user has moderation permissions
      if (!["super_admin", "admin", "moderator"].includes(user.role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access moderation",
          variant: "destructive",
        })
        router.push("/admin")
        return
      }
    } catch (error) {
      console.error("Failed to parse admin user:", error)
      router.push("/admin/login")
      return
    }

    setLoading(false)
    loadReports()
    loadMessages()
  }, [router, toast])

  const loadReports = async () => {
    try {
      const response = await fetch("/api/admin/reports")
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error("Error loading reports:", error)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await fetch("/api/admin/messages")
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const handleBackToDashboard = () => {
    router.push("/admin")
  }

  const handleReportAction = async (reportId: string, action: "resolve" | "dismiss") => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Report ${action}d successfully`,
        })
        loadReports()
        setReportDialogOpen(false)
      } else {
        throw new Error("Failed to update report")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      })
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.reported_content_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default"
      case "reviewed":
        return "secondary"
      case "resolved":
        return "default"
      case "dismissed":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading moderation panel...</p>
        </div>
      </div>
    )
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>Access denied. Please log in as an administrator.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold">Messages & Reports</h1>
                <p className="text-sm text-gray-600">Moderate content and handle reports</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {adminUser.role.replace("_", " ")}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium">{adminUser.name}</p>
                <p className="text-xs text-gray-600">{adminUser.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Reports</CardTitle>
                <CardDescription>
                  Review and manage user-reported content
                </CardDescription>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{report.reported_content_title}</div>
                            <div className="text-sm text-muted-foreground">
                              {report.reported_content_type}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{report.reporter_name}</TableCell>
                        <TableCell>{report.reason}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(report.status)}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report)
                              setReportDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredReports.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No reports found matching your criteria.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Messages</CardTitle>
                <CardDescription>
                  Monitor user communications and messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Message monitoring coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Detail Dialog */}
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>
                Review the reported content and take appropriate action
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Reported Content</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.reported_content_title} ({selectedReport.reported_content_type})
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Reporter</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.reporter_name}</p>
                </div>
                <div>
                  <h4 className="font-medium">Reason</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.reason}</p>
                </div>
                <div>
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleReportAction(selectedReport.id, "dismiss")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                  <Button
                    onClick={() => handleReportAction(selectedReport.id, "resolve")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
} 