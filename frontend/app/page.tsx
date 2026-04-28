'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Upload, FileText, Zap, Shield, ArrowRight, CheckCircle, XCircle, AlertCircle, Loader2, Save, Target, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { toast } from 'sonner'

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setCvFile(file)
        setResult(null)
        toast.success('File uploaded successfully!')
      } else {
        toast.error('Please upload a PDF or DOCX file')
      }
    }
  }

  const handleAnalyze = async () => {
    if (!cvFile) {
      toast.error('Please upload your CV')
      return
    }
    if (!jobDescription) {
      toast.error('Please paste the job description')
      return
    }

    setLoading(true)
    setUploadProgress(0)
    setResult(null)
    
    const formData = new FormData()
    formData.append('cv_file', cvFile)
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

  const handleSaveResult = async () => {
    if (!result || !cvFile) return

    if (user) {
      const formData = new FormData()
      formData.append('cv_file', cvFile)
      formData.append('job_description', jobDescription)
      formData.append('job_title', jobTitle)
      formData.append('match_score', result.match_score.toString())
      formData.append('matched_keywords', JSON.stringify(result.matched_keywords))
      formData.append('missing_keywords', JSON.stringify(result.missing_keywords))
      formData.append('ai_suggestions', result.ai_suggestions)

      try {
        const token = localStorage.getItem('access_token')
        await axios.post('http://localhost:8000/api/analyzer/save/', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        })
        toast.success('Analysis saved to your history!')
      } catch (error) {
        toast.error('Failed to save. Please try again.')
      }
    } else {
      router.push('/register?redirect=/')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                MatchifyAI
              </span>
            </div>
            <div className="flex gap-3">
              {user ? (
                <Button onClick={() => router.push('/dashboard')} variant="ghost" className="text-gray-300 hover:text-white">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button onClick={() => router.push('/login')} variant="ghost" className="text-gray-300 hover:text-white">
                    Sign In
                  </Button>
                  <Button onClick={() => router.push('/register')} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Match Your CV with{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Any Job
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload your CV, paste a job description, and get an instant AI-powered match score.
            No login required to try!
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Analyze Your CV</CardTitle>
                <CardDescription className="text-gray-300">
                  Enter job details and upload your CV for instant analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-200">Job Title (Optional)</Label>
                  <Input
                    placeholder="e.g., Senior Frontend Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Job Description *</Label>
                  <textarea
                    placeholder="Paste the full job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    className="w-full rounded-md bg-white/10 border-white/20 text-white placeholder:text-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Upload CV *</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
                      ${cvFile ? 'bg-green-500/10 border-green-500' : 'border-white/20 hover:border-purple-500'}
                    `}
                    onClick={() => document.getElementById('cv-upload')?.click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    {cvFile ? (
                      <div className="space-y-1">
                        <p className="text-green-400 font-medium">{cvFile.name}</p>
                        <p className="text-gray-400 text-sm">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setCvFile(null)
                            setResult(null)
                          }}
                          className="text-red-400 text-sm hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-300">Click or drag to upload CV</p>
                        <p className="text-gray-400 text-sm mt-1">PDF or DOCX (Max 5MB)</p>
                      </>
                    )}
                    <input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !cvFile || !jobDescription}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Analyze Match
                    </>
                  )}
                </Button>

                {loading && uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress value={uploadProgress} className="h-2" />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
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
                        <span className={`text-3xl font-bold ${getScoreColor(result.match_score)}`}>
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
                            {result.matched_keywords.slice(0, 15).map((kw: string) => (
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
                            <XCircle className="w-4 h-4 mr-2" />
                            Missing Keywords ({result.missing_keywords.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.missing_keywords.slice(0, 15).map((kw: string) => (
                              <Badge key={kw} className="bg-red-500/20 text-red-300 hover:bg-red-500/30">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Suggestions */}
                      <Alert className="bg-yellow-500/10 border-yellow-500/20">
                        <Lightbulb className="h-4 w-4 text-yellow-400 mt-1" />
                        <AlertDescription className="text-yellow-300 whitespace-pre-line max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {result.ai_suggestions}
                        </AlertDescription>
                      </Alert>

                      {/* Save Button */}
                      <Button
                        onClick={handleSaveResult}
                        variant="outline"
                        className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {user ? 'Save to History' : 'Login to Save Results'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-full flex items-center justify-center min-h-[500px]">
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
                      Upload your CV and job description<br />
                      to see analysis results here
                    </p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
            <CardHeader>
              <Zap className="w-10 h-10 text-purple-400 mb-2" />
              <CardTitle className="text-white">Instant Analysis</CardTitle>
              <CardDescription className="text-gray-400">
                Get match scores and keyword analysis in seconds
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
            <CardHeader>
              <Shield className="w-10 h-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">No Login Required</CardTitle>
              <CardDescription className="text-gray-400">
                Try it now, create an account to save results
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
            <CardHeader>
              <Sparkles className="w-10 h-10 text-green-400 mb-2" />
              <CardTitle className="text-white">AI-Powered</CardTitle>
              <CardDescription className="text-gray-400">
                Smart suggestions to improve your CV
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}