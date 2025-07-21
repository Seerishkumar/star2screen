"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function ProductionCheckPage() {
  const [loading, setLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [apiStatus, setApiStatus] = useState<Record<string, any>>({})
  const [refreshing, setRefreshing] = useState(false)

  const apiEndpoints = [
    "/api/banners",
    "/api/articles",
    "/api/news",
    "/api/reviews",
    "/api/ads",
    "/api/videos",
    "/api/profiles/all",
  ]

  const checkDatabase = async () => {
    try {
      const res = await fetch("/api/debug/database-connection")
      const data = await res.json()
      setDbStatus(data)
    } catch (error) {
      console.error("Error checking database:", error)
      setDbStatus({ success: false, error: "Failed to check database" })
    }
  }

  const checkApiEndpoints = async () => {
    const results: Record<string, any> = {}

    for (const endpoint of apiEndpoints) {
      try {
        const res = await fetch(endpoint)
        const data = await res.json()
        results[endpoint] = {
          status: res.status,
          success: res.ok,
          isStaticFallback: data.isStaticFallback || false,
          count: Array.isArray(data) ? data.length : data.data ? data.data.length : "N/A",
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        results[endpoint] = {
          status: 500,
          success: false,
          error: "Failed to fetch",
          timestamp: new Date().toISOString(),
        }
      }
    }

    setApiStatus(results)
  }

  const refreshAll = async () => {
    setRefreshing(true)
    setLoading(true)
    await Promise.all([checkDatabase(), checkApiEndpoints()])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    refreshAll()
  }, [])

  const getStatusIcon = (success: boolean, isStaticFallback?: boolean) => {
    if (success && !isStaticFallback) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (success && isStaticFallback) return <AlertCircle className="h-5 w-5 text-yellow-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (success: boolean, isStaticFallback?: boolean) => {
    if (success && !isStaticFallback) return <Badge className="bg-green-500">Database Data</Badge>
    if (success && isStaticFallback) return <Badge className="bg-yellow-500">Static Fallback</Badge>
    return <Badge className="bg-red-500">Failed</Badge>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Production Database Verification</h1>
        <Button onClick={refreshAll} disabled={refreshing}>
          {refreshing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <RefreshCw className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p className="text-lg">Checking database and API status...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {dbStatus?.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Database Connection
              </CardTitle>
              <CardDescription>
                Environment: {dbStatus?.environment || "unknown"} / {dbStatus?.vercelEnv || "unknown"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dbStatus?.success ? (
                <div className="grid gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Database URL:</h3>
                    <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                      {dbStatus?.databaseUrl || "Not available"}
                    </code>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Table Counts:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {dbStatus?.tableCounts &&
                        Object.entries(dbStatus.tableCounts).map(([table, count]) => (
                          <div
                            key={table}
                            className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded"
                          >
                            <span className="font-mono text-sm">{table}:</span>
                            <Badge className={count === "Error" ? "bg-red-500" : "bg-blue-500"}>
                              {count === "Error" ? "Missing" : count}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-500">
                  <p className="font-bold">Connection Error:</p>
                  <p>{dbStatus?.error || "Unknown error"}</p>
                  {dbStatus?.details && (
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto text-xs">
                      {JSON.stringify(dbStatus.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Last checked: {dbStatus?.timestamp ? new Date(dbStatus.timestamp).toLocaleString() : "Never"}
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Endpoints Status</CardTitle>
              <CardDescription>Checking if APIs return database data or static fallbacks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {apiEndpoints.map((endpoint) => {
                  const status = apiStatus[endpoint]
                  return (
                    <div
                      key={endpoint}
                      className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded"
                    >
                      <div className="flex items-center gap-2">
                        {status && getStatusIcon(status.success, status.isStaticFallback)}
                        <span className="font-mono">{endpoint}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {status && getStatusBadge(status.success, status.isStaticFallback)}
                        {status?.count !== "N/A" && <Badge variant="outline">{status?.count} items</Badge>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">Green = Database Data, Yellow = Static Fallback, Red = Failed</p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {!dbStatus?.success && (
                  <li className="text-red-500">Database connection failed. Check your environment variables.</li>
                )}

                {dbStatus?.success && Object.values(dbStatus.tableCounts).includes("Error") && (
                  <li className="text-yellow-500">
                    Some tables are missing. Run the database setup script to create them.
                  </li>
                )}

                {Object.values(apiStatus).some((status) => status?.isStaticFallback) && (
                  <li className="text-yellow-500">
                    Some APIs are using static fallback data. Run the database setup script to add real data.
                  </li>
                )}

                {dbStatus?.success && !Object.values(dbStatus.tableCounts).includes("Error") && (
                  <li className="text-green-500">
                    All database tables exist. Make sure they contain the necessary data.
                  </li>
                )}

                {Object.values(apiStatus).every((status) => status?.success && !status?.isStaticFallback) && (
                  <li className="text-green-500">All APIs are returning database data successfully.</li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => (window.location.href = "/api/debug/database-connection")}>
                View Raw Database Info
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
