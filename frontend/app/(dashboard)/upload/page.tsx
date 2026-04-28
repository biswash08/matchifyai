'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  Save,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { toast } from 'sonner'

interface AnalysisResult {
  match_score: number
  matched_keywords: string[]
  missing_keywords: string[]
  matched_count: number
  total_keywords: number
  ai_suggestions: string
}

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saving, setSaving] = useState(false)

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'application/pdf' || 
        droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(droppedFile)
      setResult(null)
      toast.success('File uploaded successfully!')
    } else if (droppedFile) {
      toast.error('Please upload a PDF or DOCX file')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile)
        setResult(null)
        toast.success('File uploaded successfully!')
      } else {
        toast.error('Please upload a PDF or DOCX file')
      }
    }
  }

  const removeFile = () => {
    setFile(null)
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a CV')
      return
    }
    if (!jobDescription) {
      toast.error('Please enter a job description')
      return
    }

    setLoading(true)
    setUploadProgress(0)
    setResult(null)
    
    const formData = new FormData()
    formData.append('cv_file', file)
    formData.append('job_description', jobDescription)
    if (jobTitle) formData.append('job_title', jobTitle)

    try {
      const response = await axios.post('http://localhost:8000/api/analyzer/public-analyze/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percent)
          }
        },
      })
      
      setResult(response.data)
      toast.success('Analysis complete!')
    } catch (error: any) {
      console.error('Analysis error:', error)
      toast.error(error.response?.data?.error || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToHistory = async () => {
    if (!result || !file) return

    setSaving(true)
    const formData = new FormData()
    formData.append('cv_file', file)
    formData.append('job_description', jobDescription)
    formData.append('job_title', jobTitle)
    formData.append('match_score', result.match_score.toString())
    formData.append('matched_keywords', JSON.stringify(result.matched_keywords))
    formData.append('missing_keywords', JSON.stringify(result.missing_keywords))
    formData.append('ai_suggestions', result.ai_suggestions)

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        toast.error('Please login to save results')
        router.push('/login')
        return
      }

      await axios.post('http://localhost:8000/api/analyzer/save/', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      toast.success('Analysis saved to your history!')
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        router.push('/login')
      } else {
        toast.error('Failed to save. Please try again.')
      }
    } finally {
      setSaving(false)
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
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-gray-300">
                    Hi, {getFirstName(user.full_name || user.email)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {getInitials(user.full_name || user.email)}
                  </div>
                  <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-gray-300 hover:text-white">
                    Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => router.push('/login')} className="text-gray-300 hover:text-white">
                    Sign In
                  </Button>
                  <Button onClick={() => router.push('/register')} className="bg-gradient-to-r from-purple-500 to-blue-500">
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">CV Analyzer</h1>
            <p className="text-gray-300 mt-1">Upload your CV and paste a job description for AI-powered analysis</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload Form */}
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">Upload CV</CardTitle>
                <CardDescription className="text-gray-400">
                  Drag and drop or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => document.getElementById('cv-upload')?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                    ${file ? 'bg-green-500/10 border-green-500' : 'border-white/20 hover:border-purple-500 hover:bg-purple-500/5'}
                  `}
                >
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-4">
                      <FileText className="h-10 w-10 text-green-400" />
                      <div className="text-left">
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile()
                        }}
                        className="p-1 hover:bg-white/10 rounded-full transition"
                      >
                        <X className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-300">Drag & drop or click to browse</p>
                      <p className="text-gray-500 text-sm mt-1">PDF or DOCX (Max 5MB)</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">Job Description</CardTitle>
                <CardDescription className="text-gray-400">
                  Paste the job description you want to match against
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="text"
                  placeholder="Job Title (Optional)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={loading || !file || !jobDescription}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing... {uploadProgress}%
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analyze Now
                </>
              )}
            </Button>

            {loading && uploadProgress > 0 && uploadProgress < 100 && (
              <Progress value={uploadProgress} className="h-2" />
            )}
          </div>

          {/* Right Column - Results */}
          <div>
            <AnimatePresence>
              {result ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className={`bg-white/10 backdrop-blur-lg border-2 ${getScoreBg(result.match_score)}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-white">
                        <span>Analysis Results</span>
                        <span className={`text-4xl font-bold ${getScoreColor(result.match_score)}`}>
                          {result.match_score}%
                        </span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-gray-300">
                        <Target className="h-4 w-4" />
                        {getScoreLabel(result.match_score)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <p className="text-2xl font-bold text-white">{result.matched_count}</p>
                          <p className="text-gray-400 text-sm">Keywords Matched</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <p className="text-2xl font-bold text-white">{result.total_keywords}</p>
                          <p className="text-gray-400 text-sm">Total Keywords</p>
                        </div>
                      </div>

                      {/* Matched Keywords */}
                      {result.matched_keywords.length > 0 && (
                        <div>
                          <p className="text-green-400 font-semibold mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Matched Keywords ({result.matched_keywords.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.matched_keywords.slice(0, 15).map((kw) => (
                              <Badge key={kw} className="bg-green-500/20 text-green-300 hover:bg-green-500/30">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Keywords */}
                      {result.missing_keywords.length > 0 && (
                        <div>
                          <p className="text-red-400 font-semibold mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Missing Keywords ({result.missing_keywords.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.missing_keywords.slice(0, 15).map((kw) => (
                              <Badge key={kw} className="bg-red-500/20 text-red-300 hover:bg-red-500/30">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* AI Suggestions */}
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-purple-400 font-semibold mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        AI Suggestions
                    </p>
                    <div className="text-gray-300 text-sm whitespace-pre-line max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {result.ai_suggestions}
                    </div>
                    </div>
                      {/* Save Button */}
                      <Button
                        onClick={handleSaveToHistory}
                        disabled={saving}
                        variant="outline"
                        className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {user ? 'Save to History' : 'Login to Save Results'}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-full flex items-center justify-center min-h-[500px]">
                  <CardContent className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
                      Upload your CV and job description<br />
                      to see analysis results here
                    </p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}