'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Sparkles, FileText, TrendingUp, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Get initials from full name (e.g., "John Doe" -> "JD")
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get first name for greeting (e.g., "John Doe" -> "John")
  const getFirstName = (name: string) => {
    return name.split(' ')[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                MatchifyAI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-300">
                  Hi, {getFirstName(user.full_name || user.email)}
                </span>
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    {getInitials(user.full_name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" onClick={logout} className="text-gray-300 hover:text-white">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-300 mt-1">
            Welcome back, {user.full_name}! Ready to analyze some CVs?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <FileText className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <CardDescription className="text-gray-400">CVs analyzed</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Match</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <CardDescription className="text-gray-400">Match score average</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Analysis</CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <CardDescription className="text-gray-400">Most recent</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition cursor-pointer"
                onClick={() => router.push('/upload')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                Upload New CV
              </CardTitle>
              <CardDescription className="text-gray-400">
                Analyze your CV against a job description
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition cursor-pointer"
                onClick={() => router.push('/history')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                View History
              </CardTitle>
              <CardDescription className="text-gray-400">
                See your past CV analyses
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Coming Soon Card */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0">
          <CardHeader>
            <CardTitle className="text-white text-2xl">✨ CV Analyzer Ready!</CardTitle>
            <CardDescription className="text-purple-100">
              Upload your CV and paste job descriptions to get AI-powered match scores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/upload')}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Get Started
              <FileText className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}