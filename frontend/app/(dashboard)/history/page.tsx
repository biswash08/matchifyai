'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  Eye, 
  Trash2,
  Loader2,
  Sparkles,
  LogOut,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

interface Analysis {
  id: number
  job_title: string
  job_description: string
  match_score: number
  matched_keywords: string[] | string
  missing_keywords: string[] | string
  ai_suggestions: string
  created_at: string
}

export default function HistoryPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchHistory()
    }
  }, [user])

  const parseKeywords = (keywords: string[] | string): string[] => {
    if (Array.isArray(keywords)) return keywords
    if (typeof keywords === 'string') {
      try {
        const parsed = JSON.parse(keywords)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
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

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get('http://localhost:8000/api/analyzer/history/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setAnalyses(response.data)
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeleting(id)
    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`http://localhost:8000/api/analyzer/history/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setAnalyses(analyses.filter(a => a.id !== id))
      toast.success('Analysis deleted successfully')
    } catch (error) {
      toast.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const handleView = (id: number) => {
    router.push(`/history/${id}`)
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 70) return { label: 'Excellent', color: 'bg-green-500' }
    if (score >= 50) return { label: 'Good', color: 'bg-yellow-500' }
    return { label: 'Needs Work', color: 'bg-red-500' }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading your history...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar - Same as Dashboard */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
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
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Analysis History</h1>
            <p className="text-gray-300 mt-1">View and manage all your past CV analyses</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => router.push('/dashboard')} 
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/upload')} 
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Content */}
        {analyses.length === 0 ? (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No analyses yet</h3>
              <p className="text-gray-400 mb-6">
                You haven't saved any CV analyses yet. Upload your first CV to get started!
              </p>
              <Button onClick={() => router.push('/upload')} className="bg-gradient-to-r from-purple-500 to-blue-500">
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Your First CV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {analyses.map((analysis) => {
              const scoreBadge = getScoreBadge(analysis.match_score)
              const matchedCount = parseKeywords(analysis.matched_keywords).length
              const missingCount = parseKeywords(analysis.missing_keywords).length
              
              return (
                <Card key={analysis.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-200">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-white text-xl">
                        {analysis.job_title || 'Untitled Analysis'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(analysis.created_at)}
                      </CardDescription>
                    </div>
                    <Badge className={`${scoreBadge.color} text-white px-3 py-1`}>
                      {scoreBadge.label} - {analysis.match_score}%
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`h-4 w-4 ${getScoreColor(analysis.match_score)}`} />
                          <span className="text-sm text-gray-300">
                            Score: <span className={getScoreColor(analysis.match_score)}>{analysis.match_score}%</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-400" />
                          <span className="text-sm text-gray-300">
                            {matchedCount} matched / {missingCount} missing
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleView(analysis.id)}
                          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(analysis.id)}
                          disabled={deleting === analysis.id}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          {deleting === analysis.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}