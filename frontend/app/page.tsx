'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Upload, FileText, Zap, Shield, ArrowRight, CheckCircle, XCircle, AlertCircle, Loader2, Save } from 'lucide-react'
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0])
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
    const formData = new FormData()
    formData.append('cv_file', cvFile)
    formData.append('job_description', jobDescription)
    formData.append('job_title', jobTitle || 'Untitled Analysis')

    try {
      const response = await axios.post('http://localhost:8000/api/analyzer/public-analyze/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(response.data)
      toast.success('Analysis complete!')
    } catch (error) {
      toast.error('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveResult = () => {
    if (user) {
      // Save to history (implement in next step)
      toast.success('Analysis saved to your history!')
    } else {
      router.push('/register?redirect=analysis')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 70) return { label: 'Excellent Match', color: 'bg-green-500' }
    if (score >= 50) return { label: 'Good Match', color: 'bg-yellow-500' }
    return { label: 'Needs Improvement', color: 'bg-red-500' }
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
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-purple-500 transition cursor-pointer"
                    onClick={() => document.getElementById('cv-upload')?.click()}>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300">
                      {cvFile ? cvFile.name : 'Click or drag to upload CV'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">PDF or DOCX (Max 5MB)</p>
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
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Analyze Match
                    </>
                  )}
                </Button>
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
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Analysis Results</CardTitle>
                      <CardDescription className="text-gray-300">
                        Your CV match score and recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Score Circle */}
                      <div className="text-center">
                        <div className="relative inline-flex items-center justify-center">
                          <svg className="w-32 h-32">
                            <circle
                              className="text-gray-700"
                              strokeWidth="8"
                              stroke="currentColor"
                              fill="transparent"
                              r="58"
                              cx="64"
                              cy="64"
                            />
                            <circle
                              className={getScoreColor(result.match_score)}
                              strokeWidth="8"
                              strokeDasharray={364.4}
                              strokeDashoffset={364.4 * (1 - result.match_score / 100)}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="58"
                              cx="64"
                              cy="64"
                            />
                          </svg>
                          <div className="absolute">
                            <span className={`text-4xl font-bold ${getScoreColor(result.match_score)}`}>
                              {result.match_score}%
                            </span>
                          </div>
                        </div>
                        <Badge className={`mt-3 ${getScoreBadge(result.match_score).color} text-white`}>
                          {getScoreBadge(result.match_score).label}
                        </Badge>
                      </div>

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

                      {/* Keywords */}
                      <div>
                        <p className="text-green-400 font-semibold mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Matched Keywords ({result.matched_keywords.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.matched_keywords.slice(0, 10).map((kw: string) => (
                            <Badge key={kw} variant="secondary" className="bg-green-500/20 text-green-300">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-red-400 font-semibold mb-2 flex items-center">
                          <XCircle className="w-4 h-4 mr-2" />
                          Missing Keywords ({result.missing_keywords.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.missing_keywords.slice(0, 10).map((kw: string) => (
                            <Badge key={kw} variant="secondary" className="bg-red-500/20 text-red-300">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* AI Suggestions */}
                      <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <p className="text-purple-400 font-semibold mb-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          AI Suggestions
                        </p>
                        <p className="text-gray-300 text-sm whitespace-pre-line">
                          {result.ai_suggestions}
                        </p>
                      </div>

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
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <Zap className="w-10 h-10 text-purple-400 mb-2" />
              <CardTitle className="text-white">Instant Analysis</CardTitle>
              <CardDescription className="text-gray-400">
                Get match scores and keyword analysis in seconds
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <Shield className="w-10 h-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">No Login Required</CardTitle>
              <CardDescription className="text-gray-400">
                Try it now, create an account to save results
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/5 border-white/10">
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