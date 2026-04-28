'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  LogOut,
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

export default function AnalysisDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, logout, loading: authLoading } = useAuth()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)

  const id = params.id as string

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && id) {
      fetchAnalysis()
    }
  }, [user, id])

  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`http://localhost:8000/api/analyzer/history/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setAnalysis(response.data)
    } catch (error) {
      console.error('Error fetching analysis:', error)
      toast.error('Failed to load analysis')
      router.push('/history')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500/20 border-green-500/50'
    if (score >= 50) return 'bg-yellow-500/20 border-yellow-500/50'
    return 'bg-red-500/20 border-red-500/50'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Excellent Match!'
    if (score >= 50) return 'Good Match'
    return 'Needs Improvement'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  const matchedKeywords = parseKeywords(analysis.matched_keywords)
  const missingKeywords = parseKeywords(analysis.missing_keywords)

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
                  Hi, {getFirstName(user?.full_name || user?.email || 'User')}
                </span>
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    {getInitials(user?.full_name || user?.email || 'U')}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/history')}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {analysis.job_title || 'CV Analysis'}
          </h1>
          <p className="text-gray-300 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(analysis.created_at)}
          </p>
        </div>

        {/* Score Card */}
        <Card className={`bg-white/10 backdrop-blur-lg border-2 ${getScoreBg(analysis.match_score)} mb-6`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span>Match Score</span>
              <span className={`text-4xl font-bold ${getScoreColor(analysis.match_score)}`}>
                {analysis.match_score}%
              </span>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-gray-300">
              <Target className="h-4 w-4" />
              {getScoreLabel(analysis.match_score)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">{matchedKeywords.length}</p>
                <p className="text-gray-400 text-sm">Keywords Matched</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">{missingKeywords.length}</p>
                <p className="text-gray-400 text-sm">Missing Keywords</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {analysis.job_description}
            </p>
          </CardContent>
        </Card>

        {/* Matched Keywords */}
        {matchedKeywords.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Matched Keywords ({matchedKeywords.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                These keywords from the job description were found in your CV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {matchedKeywords.map((kw: string) => (
                  <Badge key={kw} className="bg-green-500/20 text-green-300 hover:bg-green-500/30 text-sm py-1">
                    {kw}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Missing Keywords */}
        {missingKeywords.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Missing Keywords ({missingKeywords.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                These keywords from the job description were NOT found in your CV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {missingKeywords.map((kw: string) => (
                  <Badge key={kw} className="bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm py-1">
                    {kw}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Suggestions */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Suggestions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personalized recommendations to improve your CV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300 whitespace-pre-line">
                {analysis.ai_suggestions}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}