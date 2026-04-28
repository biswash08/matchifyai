'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { Sparkles, Brain, CheckCircle, Loader2, Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    const success = await login(data.email, data.password)
    setLoading(false)
    if (success) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-5xl">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Form */}
            <div className="p-8 md:p-12">
              <div className="mb-8 text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-300">
                  Sign in to your MatchifyAI account
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200 text-base">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register('email')}
                      className={`pl-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-gray-200 text-base">
                      Password
                    </Label>
                    <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      {...register('password')}
                      className={`pl-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <p className="text-center text-gray-300 pt-4">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
                    Create one
                  </Link>
                </p>
              </form>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden md:flex bg-gradient-to-br from-purple-600 to-blue-600 p-12 flex-col justify-center items-center text-center rounded-r-3xl">
              <div className="max-w-sm">
                <Brain className="h-16 w-16 text-white/80 mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Match Your Dream Job
                </h2>
                <p className="text-purple-100 mb-8">
                  AI-powered CV analysis that helps you stand out from thousands of applicants
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>Instant match score</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>Keyword analysis</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>AI improvement suggestions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}