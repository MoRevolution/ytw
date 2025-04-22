"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Firebase imports would go here in a real implementation
// import { onAuthStateChanged, signOut } from "firebase/auth"
// import { auth } from "@/lib/firebase"

type User = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

type AuthContextType = {
  isLoggedIn: boolean
  user: User | null
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from localStorage for now
    // In a real implementation, you would use Firebase's onAuthStateChanged
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loggedIn)

    // Mock user data if logged in
    if (loggedIn) {
      setUser({
        uid: "mock-uid",
        email: "user@example.com",
        displayName: "Alex Johnson",
        photoURL: "/placeholder.svg?height=40&width=40",
      })
    }

    // Real implementation would look like:
    /*
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    });

    return () => unsubscribe();
    */
  }, [])

  const login = () => {
    // In a real implementation, this would be handled by Firebase's signInWithPopup
    localStorage.setItem("isLoggedIn", "true")
    setIsLoggedIn(true)
    setUser({
      uid: "mock-uid",
      email: "user@example.com",
      displayName: "Alex Johnson",
      photoURL: "/placeholder.svg?height=40&width=40",
    })
  }

  const logout = () => {
    // In a real implementation, you would use Firebase's signOut
    // signOut(auth);
    localStorage.removeItem("isLoggedIn")
    setIsLoggedIn(false)
    setUser(null)
    router.push("/")
  }

  return <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
