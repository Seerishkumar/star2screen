"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Star, Zap } from "lucide-react"

interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  billing_cycle: string
  features: string[]
  limits: Record<string, any>
  is_active: boolean
}

export function SubscriptionPlans() {
  const { user, profile } = useAuth()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!user) return

    setSubscribing(planId)
    try {
      // TODO: Integrate with payment processor (Stripe/Razorpay)
      console.log("Subscribing to plan:", planId)

      // For now, just update the user's subscription
      const { error } = await supabase
        .from("author_profiles")
        .update({
          subscription_plan: plans.find((p) => p.id === planId)?.slug,
          is_premium: true,
          premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("user_id", user.id)

      if (error) throw error

      alert("Subscription updated successfully!")
    } catch (error) {
      console.error("Error subscribing:", error)
      alert("Failed to subscribe. Please try again.")
    } finally {
      setSubscribing(null)
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return <Zap className="h-5 w-5" />
      case "basic":
        return <Star className="h-5 w-5" />
      case "premium":
        return <Crown className="h-5 w-5" />
      case "enterprise":
        return <Crown className="h-5 w-5" />
      default:
        return <Star className="h-5 w-5" />
    }
  }

  const isCurrentPlan = (planSlug: string) => {
    return profile?.subscription_plan === planSlug
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${
            plan.slug === "premium" ? "border-primary shadow-lg scale-105" : ""
          } ${isCurrentPlan(plan.slug) ? "ring-2 ring-primary" : ""}`}
        >
          {plan.slug === "premium" && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
          )}

          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">{getPlanIcon(plan.name)}</div>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <div className="text-3xl font-bold">
              ₹{plan.price}
              <span className="text-sm font-normal text-muted-foreground">/{plan.billing_cycle}</span>
            </div>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              {isCurrentPlan(plan.slug) ? (
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id}
                  className="w-full"
                  variant={plan.slug === "premium" ? "default" : "outline"}
                >
                  {subscribing === plan.id ? "Processing..." : plan.price === 0 ? "Get Started" : "Upgrade"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
