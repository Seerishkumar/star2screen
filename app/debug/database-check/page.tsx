"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Globe, Server } from "lucide-react"

type DatabaseInfo = {
  success: boolean
  environment: {
    nodeEnv: string
    vercelEnv: string
    isProduction: boolean
    isVercel: boolean
  }
  database: {
    projectId: string
    fullUrl: string
    urlPreview: string
  }
  tableCounts: Record<string, number | string>
  timestamp: string
  error?: string
  details?: any
}

export default function DatabaseCheckPage() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const checkDatabase = async () => {
    try {
      const response = await fetch("/api/debug/database-connection")
      const data = await response.json()
      setDbInfo(data)
    } catch (error) {
      console.error("Error checking database:", error)
      setDbInfo({
        success: false,
        error: "Failed to check database connection",
        environment: { nodeEnv: "unknown", vercelEnv: "unknown", isProduction: false, isVercel: false },
        database: { projectId: "unknown", fullUrl: "unknown", urlPreview: "unknown" },
        tableCounts: {},
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    await checkDatabase()
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  const getTableStatus = (count: number | string) => {
    if (count === "Error") return { color: "bg-red-500", text: "Missing", icon: XCircle }
    if (count === 0) return { color: "bg-yellow-500", text: "Empty", icon: AlertCircle }
    return { color: "bg-green-500", text: `${count} rows`, icon: CheckCircle }
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Database Connection Check</h1>
          <p className="text-gray-600 mt-2">Verify which database you're connected to and check table status</p>
        </div>
        <Button onClick={refresh} disabled={refreshing}>
          {refreshing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <RefreshCw className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p className="text-lg">Checking database connection...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Environment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Environment Information
              </CardTitle>
              <CardDescription>Current environment and deployment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Node Environment</p>
                  <Badge variant={dbInfo?.environment.isProduction ? "default" : "secondary"}>
                    {dbInfo?.environment.nodeEnv || "unknown"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vercel Environment</p>
                  <p className="font-medium">{dbInfo?.environment.vercelEnv || "local"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Platform</p>
                  <p className="font-medium">{dbInfo?.environment.isVercel ? "Vercel" : "Local"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={dbInfo?.success ? "default" : "destructive"}>
                    {dbInfo?.success ? "Connected" : "Failed"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Connection Details
              </CardTitle>
              <CardDescription>Information about the connected Supabase database</CardDescription>
            </CardHeader>
            <CardContent>
              {dbInfo?.success ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Database Project ID</p>
                    <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-lg font-mono">
                      {dbInfo.database.projectId}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Database URL</p>
                    <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm font-mono break-all">
                      {dbInfo.database.fullUrl}
                    </code>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Same Database Check:</strong> If you see the same Project ID in both development and
                      production, you're using the same database for both environments.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Connection Failed:</strong> {dbInfo?.error}
                    {dbInfo?.details && (
                      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                        {JSON.stringify(dbInfo.details, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Table Status */}
          {dbInfo?.success && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Database Tables Status
                </CardTitle>
                <CardDescription>Row counts for all application tables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(dbInfo.tableCounts).map(([tableName, count]) => {
                    const status = getTableStatus(count)
                    const StatusIcon = status.icon
                    return (
                      <div key={tableName} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium font-mono text-sm">{tableName}</h4>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <Badge className={status.color}>{status.text}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dbInfo?.success ? (
                  <>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Database Connected:</strong> Successfully connected to Supabase project{" "}
                        <code>{dbInfo.database.projectId}</code>
                      </AlertDescription>
                    </Alert>

                    {Object.values(dbInfo.tableCounts).includes("Error") && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Missing Tables:</strong> Some tables don't exist in your database. This could mean:
                          <ul className="list-disc ml-4 mt-2">
                            <li>You haven't run the database setup scripts</li>
                            <li>You're connected to a different database than expected</li>
                            <li>The tables were created with different names</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {Object.values(dbInfo.tableCounts).some((count) => count === 0) && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Empty Tables:</strong> Some tables exist but have no data. Run the data seeding
                          scripts to populate them.
                        </AlertDescription>
                      </Alert>
                    )}

                    {!Object.values(dbInfo.tableCounts).includes("Error") &&
                      !Object.values(dbInfo.tableCounts).includes(0) && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>All Good:</strong> All tables exist and contain data. Your database is properly set
                            up!
                          </AlertDescription>
                        </Alert>
                      )}
                  </>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Connection Failed:</strong> Cannot connect to database. Check your environment variables:
                      <ul className="list-disc ml-4 mt-2">
                        <li>NEXT_PUBLIC_SUPABASE_URL</li>
                        <li>SUPABASE_SERVICE_ROLE_KEY</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamp */}
          <div className="text-center text-sm text-gray-500">
            Last checked: {dbInfo?.timestamp ? new Date(dbInfo.timestamp).toLocaleString() : "Never"}
          </div>
        </div>
      )}
    </div>
  )
}
