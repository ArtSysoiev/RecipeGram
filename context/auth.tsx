import { useRouter } from 'expo-router'
import React, { createContext, useContext, useState } from 'react'

interface User {
  id: number
  username: string
  profile_image?: string
}

interface AuthContextType {
  user: User | null | undefined
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const logout = () => {
    setUser(null)
    router.replace('/') 
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}