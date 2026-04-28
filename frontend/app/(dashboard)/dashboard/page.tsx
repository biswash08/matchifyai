'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Sparkles, FileText, TrendingUp, Clock, Loader2, ChevronRight } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

interface Analysis {
  id: number
  job_title: string
  match_score: number
  created_at: string
}

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    averageMatch: 0,
    lastScore: 0,
    lastDate: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchAnalyses()
    }
  }, [user])

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get('http://localhost:8000/api/analyzer/history/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = response.data
      setAnalyses(data)
      
      // Calculate stats
      const total = data.length
      const averageMatch = total > 0 
        ? Math.round(data.reduce((sum: number, item: Analysis) => sum + item.match_score, 0) / total)
        : 0
      
      const lastAnalysis = total > 0 ? data[0] : null
      
      setStats({
        total,
        averageMatch,
        lastScore: lastAnalysis?.match_score || 0,
        lastDate: lastAnalysis?.created_at || ''
      })
    } catch (error) {
      console.error('Error fetching analyses:', error)
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getFirstName = (name: string) => {
    return name.split(' ')[0]
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const recentAnalyses = analyses.slice(0, 2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
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
                <Button variant="ghost" onClick={handleLogout} className="text-gray-300 hover:text-white">
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
          <Card className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <FileText className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <CardDescription className="text-gray-400">CVs analyzed</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Match</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getScoreColor(stats.averageMatch)}`}>
                {stats.total > 0 ? `${stats.averageMatch}%` : '0%'}
              </div>
              <CardDescription className="text-gray-400">Average match score</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Analysis</CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stats.lastScore > 0 ? getScoreColor(stats.lastScore) : 'text-gray-400'}`}>
                {stats.lastScore > 0 ? `${stats.lastScore}%` : '-'}
              </div>
              <CardDescription className="text-gray-400">
                {stats.lastDate ? formatDate(stats.lastDate) : 'No analyses yet'}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Recent Analyses Section */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">Recent Analyses</CardTitle>
              <CardDescription className="text-gray-400">
                Your most recent CV analyses
              </CardDescription>
            </div>
            {analyses.length > 0 && (
              <Button 
                variant="ghost" 
                onClick={() => router.push('/history')}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No analyses yet. Upload your first CV!</p>
                <Button 
                  onClick={() => router.push('/upload')} 
                  variant="link" 
                  className="text-purple-400 mt-2"
                >
                  Start Analyzing
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnalyses.map((analysis) => (
                  <div 
                    key={analysis.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-all group"
                    onClick={() => router.push(`/history/${analysis.id}`)}
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium group-hover:text-purple-400 transition">
                        {analysis.job_title || 'Untitled Analysis'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {formatDate(analysis.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-xl font-bold ${getScoreColor(analysis.match_score)}`}>
                        {analysis.match_score}%
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-purple-400 transition" />
                    </div>
                  </div>
                ))}
                
                {/* Show remaining count if more than 2 */}
                {analyses.length > 2 && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="link" 
                      onClick={() => router.push('/history')}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      And {analyses.length - 2} more analysis{analyses.length - 2 !== 1 ? 'es' : ''} →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
                See all your past CV analyses
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Empty State */}
        {analyses.length === 0 && (
          <Card className="bg-gradient-to-r from-purple-600/50 to-blue-600/50 border-0">
            <CardHeader>
              <CardTitle className="text-white text-2xl">✨ Start Your First Analysis!</CardTitle>
              <CardDescription className="text-purple-100">
                You haven't analyzed any CVs yet. Upload your first CV to get AI-powered match scores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/upload')}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Your First CV
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}