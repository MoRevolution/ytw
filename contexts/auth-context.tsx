"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

// Firebase imports would go here in a real implementation
// import { onAuthStateChanged, signOut } from "firebase/auth"
// import { auth } from "@/lib/firebase"

type User = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  isSampleUser?: boolean
}

type AuthContextType = {
  isLoggedIn: boolean
  user: User | null
  login: (userData?: User) => void
  logout: () => void
  viewSampleUser: () => void
}

const sampleUser: User = {
  uid: "sample-user",
  email: "alex.johnson@example.com",
  displayName: "Alex Johnson",
  photoURL: "/placeholder.svg?height=40&width=40",
  isSampleUser: true
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !user?.isSampleUser) {
        setIsLoggedIn(true)
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isSampleUser: false
        })
      } else if (!user?.isSampleUser) {
        setIsLoggedIn(false)
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, []) // Remove user from dependencies

  const login = (userData?: User) => {
    if (userData) {
      setIsLoggedIn(true)
      setUser(userData)
    }
  }

  const logout = () => {
    auth.signOut()
    setIsLoggedIn(false)
    setUser(null)
    router.push("/")
  }

  const viewSampleUser = () => {
    setIsLoggedIn(true)
    setUser(sampleUser)
    router.push("/dashboard")
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, viewSampleUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
