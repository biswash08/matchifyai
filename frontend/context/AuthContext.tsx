'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

interface User {
  id: number
  email: string
  full_name: string
  date_joined: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
}

interface RegisterData {
  email: string
  full_name: string
  password: string
  confirm_password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = 'http://localhost:8000/api/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('access_token')
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/login/`, { email, password })
      
      const { access, user } = response.data
      
      localStorage.setItem('access_token', access)
      localStorage.setItem('user', JSON.stringify(user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      setUser(user)
      toast.success(`Welcome back, ${user.full_name}!`)
      return true
    } catch (error) {
      toast.error('Invalid email or password')
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/register/`, userData)
      
      const { access, user } = response.data
      
      localStorage.setItem('access_token', access)
      localStorage.setItem('user', JSON.stringify(user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      setUser(user)
      toast.success(`Welcome to MatchifyAI, ${user.full_name}!`)
      return true
    } catch (error: any) {
      const errorMsg = error.response?.data?.email?.[0] || 
                       error.response?.data?.confirm_password?.[0] ||
                       error.response?.data?.error || 
                       'Registration failed'
      toast.error(errorMsg)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}