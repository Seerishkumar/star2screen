"use client"

import { useState, useEffect } from "react"

interface Statistics {
  totalProfiles: number
  totalCategories: number
  totalArticles: number
  totalJobs: number
}

export function StatisticsSection() {
  const [stats, setStats] = useState<Statistics>({
    totalProfiles: 0,
    totalCategories: 0,
    totalArticles: 0,
    totalJobs: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      // For now, we'll use mock data since we don't have a statistics API
      // In a real app, you'd fetch from /api/statistics
      setStats({
        totalProfiles: 1250,
        totalCategories: 28,
        totalArticles: 156,
        totalJobs: 89,
      })
    } catch (error) {
      console.error("Error fetching statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12 bg-primary text-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-primary text-white">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent-gold mb-2">{stats.totalProfiles.toLocaleString()}+</div>
            <div className="text-sm text-gray-200">Registered Professionals</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent-gold mb-2">{stats.totalCategories}+</div>
            <div className="text-sm text-gray-200">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent-gold mb-2">{stats.totalArticles}+</div>
            <div className="text-sm text-gray-200">Articles & News</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent-gold mb-2">{stats.totalJobs}+</div>
            <div className="text-sm text-gray-200">Active Jobs</div>
          </div>
        </div>
      </div>
    </section>
  )
}
