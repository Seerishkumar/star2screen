"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAdminToken, getAdminUser, hasPermission, type UserRole } from "@/lib/auth-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: UserRole
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({ children, requiredRole, fallback, redirectTo = "/admin/login" }: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = getAdminToken()
      const user = getAdminUser()

      if (!token || !user) {
        setIsAuthorized(false)
        if (redirectTo) {
          router.push(redirectTo)
        }
        return
      }

      const currentUserRole = user.role as UserRole
      setUserRole(currentUserRole)

      const authorized = hasPermission(currentUserRole, requiredRole)
      setIsAuthorized(authorized)

      if (!authorized && redirectTo) {
        router.push("/admin")
      }
    }

    checkAuth()
  }, [requiredRole, redirectTo, router])

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need {requiredRole} permissions to view this page.
            {userRole && (
              <span className="block mt-2">
                Your current role: <strong>{userRole}</strong>
              </span>
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
