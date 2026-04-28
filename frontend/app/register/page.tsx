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
import { Sparkles, CheckCircle, Loader2, User, Mail, Lock } from 'lucide-react'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    const success = await registerUser({
      email: data.email,
      full_name: data.full_name,
      password: data.password,
      confirm_password: data.confirm_password,
    })
    setLoading(false)
    if (success) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-6xl">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-purple-600 p-12 flex-col justify-center items-center text-center rounded-l-3xl">
              <div className="max-w-sm">
                <Sparkles className="h-16 w-16 text-white/80 mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Join MatchifyAI Today
                </h2>
                <p className="text-blue-100 mb-8">
                  Start optimizing your CV and land your dream job faster
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>100% Free to start</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 md:p-12">
              <div className="mb-8 text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Create Account
                </h1>
                <p className="text-gray-300">
                  Start your journey to your dream job
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-gray-200 text-base">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="John Doe"
                      {...register('full_name')}
                      className={`pl-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                        errors.full_name ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.full_name && (
                    <p className="text-sm text-red-400">{errors.full_name.message}</p>
                  )}
                </div>

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
                  <Label htmlFor="password" className="text-gray-200 text-base">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
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

                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-gray-200 text-base">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirm_password"
                      type="password"
                      placeholder="Confirm your password"
                      {...register('confirm_password')}
                      className={`pl-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                        errors.confirm_password ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.confirm_password && (
                    <p className="text-sm text-red-400">{errors.confirm_password.message}</p>
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
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-center text-gray-300 pt-4">
                  Already have an account?{' '}
                  <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                    Sign in
                  </Link>
                </p>

                <p className="text-xs text-center text-gray-400 pt-2">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}