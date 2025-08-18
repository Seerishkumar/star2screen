"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, Globe, Settings, AlertTriangle, CheckCircle } from "lucide-react"

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
  timestamp?: string
}

export default function ProductionDebugPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [overallStatus, setOverallStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  const runTest = async (testName: string, endpoint: string) => {
    setLoading(true)
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      
      const result: TestResult = {
        success: response.ok,
        message: data.message || data.error || 'Test completed',
        data: data,
        timestamp: new Date().toISOString()
      }
      
      setResults(prev => ({ ...prev, [testName]: result }))
      
      if (response.ok) {
        console.log(`✅ ${testName} passed:`, data)
      } else {
        console.error(`❌ ${testName} failed:`, data)
      }
      
    } catch (error) {
      const result: TestResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        error: 'Network or fetch error',
        timestamp: new Date().toISOString()
      }
      setResults(prev => ({ ...prev, [testName]: result }))
      console.error(`❌ ${testName} error:`, error)
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    setOverallStatus('testing')
    setResults({})
    
    // Run tests in sequence
    await runTest('Environment Variables', '/api/debug/env')
    await runTest('Database Connection', '/api/test/banners')
    await runTest('Admin Banners API', '/api/admin/banners')
    
    // Check overall status
    const allResults = Object.values(results)
    const hasErrors = allResults.some(r => !r.success)
    setOverallStatus(hasErrors ? 'error' : 'success')
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (success: boolean) => {
    return success ? 
      <Badge variant="default" className="bg-green-100 text-green-800">✅ Passed</Badge> :
      <Badge variant="destructive">❌ Failed</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Debug Dashboard</h1>
          <p className="text-gray-600">Diagnose banner fetching issues in production</p>
        </div>

        {/* Overall Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Overall Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant={overallStatus === 'idle' ? 'secondary' : overallStatus === 'success' ? 'default' : 'destructive'}>
                {overallStatus === 'idle' && '⏳ Ready to Test'}
                {overallStatus === 'testing' && '🔄 Testing...'}
                {overallStatus === 'success' && '✅ All Tests Passed'}
                {overallStatus === 'error' && '❌ Some Tests Failed'}
              </Badge>
              
              <Button 
                onClick={runAllTests} 
                disabled={loading}
                className="ml-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  'Run All Tests'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Individual Tests */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Environment Variables Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Environment Variables
              </CardTitle>
              <CardDescription>Check if Supabase credentials are set</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => runTest('Environment Variables', '/api/debug/env')}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                Test Environment
              </Button>
              
              {results['Environment Variables'] && (
                <div className="space-y-2">
                  {getStatusBadge(results['Environment Variables'].success)}
                  <p className="text-sm">{results['Environment Variables'].message}</p>
                  {results['Environment Variables'].data?.environment && (
                    <div className="text-xs bg-gray-100 p-2 rounded">
                      <pre>{JSON.stringify(results['Environment Variables'].data.environment, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Database Connection Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Connection
              </CardTitle>
              <CardDescription>Test Supabase database connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => runTest('Database Connection', '/api/test/banners')}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                Test Connection
              </Button>
              
              {results['Database Connection'] && (
                <div className="space-y-2">
                  {getStatusBadge(results['Database Connection'].success)}
                  <p className="text-sm">{results['Database Connection'].message}</p>
                  {results['Database Connection'].data?.bannerCount !== undefined && (
                    <p className="text-xs text-gray-600">
                      Found {results['Database Connection'].data.bannerCount} banners
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Banners API Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Admin Banners API
              </CardTitle>
              <CardDescription>Test the main banner API endpoint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => runTest('Admin Banners API', '/api/admin/banners')}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                Test API
              </Button>
              
              {results['Admin Banners API'] && (
                <div className="space-y-2">
                  {getStatusBadge(results['Admin Banners API'].success)}
                  <p className="text-sm">{results['Admin Banners API'].message}</p>
                  {results['Admin Banners API'].data?.count !== undefined && (
                    <p className="text-xs text-gray-600">
                      API returned {results['Admin Banners API'].data.count} banners
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        {Object.keys(results).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(results).map(([testName, result]) => (
                  <div key={testName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{testName}</h3>
                      {getStatusIcon(result.success)}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm">{result.message}</p>
                      {result.timestamp && (
                        <p className="text-xs text-gray-500">Tested at: {result.timestamp}</p>
                      )}
                      
                      {result.error && (
                        <Alert variant="destructive">
                          <AlertDescription>{result.error}</AlertDescription>
                        </Alert>
                      )}
                      
                      {result.data && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-600">View Response Data</summary>
                          <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Troubleshooting Tips */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Troubleshooting Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p><strong>If Environment Variables fail:</strong> Check your production .env.local file</p>
              <p><strong>If Database Connection fails:</strong> Verify Supabase URL and service role key</p>
              <p><strong>If Admin API fails:</strong> Check RLS policies and table structure</p>
              <p><strong>If all tests pass but banners still don't show:</strong> Check browser console and network tab</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 