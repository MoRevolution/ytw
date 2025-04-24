"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { openDB } from "idb"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { isDataInIndexedDB} from "@/lib/indexeddb"
import { fetchAndProcessWatchHistory } from "@/lib/fetch-watch-history"
import { WATCH_HISTORY_FILE } from "@/lib/constants"

// Firebase imports would go here in a real implementation
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth} from "@/lib/firebase"

interface GoogleLoginProps {
  variant: "login" | "signup"
}

export function GoogleLogin({ variant }: GoogleLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      provider.addScope("https://www.googleapis.com/auth/drive")

      const result = await signInWithPopup(auth, provider)
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken
      const user = result.user

      // Create/update user via API
      const createUserResponse = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          accessToken: token,
        }),
      });

      const { isNewUser } = await createUserResponse.json();

      // Check if data exists in IndexedDB
      const hasData = await isDataInIndexedDB(WATCH_HISTORY_FILE);
      
      if (!hasData) {
        console.log("📦 No watch history data found in IndexedDB, fetching...");
        try {
          if (!token) {
            throw new Error("No access token available");
          }
          await fetchAndProcessWatchHistory(token, user.uid);
          
          toast({
            title: "Data imported",
            description: "Your YouTube watch history has been successfully imported.",
          });
        } catch (error: any) {
          console.error("❌ Error:", error.message);
          toast({
            title: "Warning",
            description: "Could not fetch watch history. Please try again later.",
          });
        }
      } else {
        console.log("📦 Using existing watch history data from IndexedDB");
      }
      
      // Complete login process with actual user data
      login({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isSampleUser: false
      })
      
      toast({
        title: isNewUser ? "Welcome!" : "Welcome back!",
        description: isNewUser 
          ? "Your account has been created successfully." 
          : "You have been successfully logged in.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error during Google login process:", error)
      toast({
        title: "Error",
        description: "An error occurred during the login process. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full bg-white text-black hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 flex items-center gap-2"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
      )}
      <span className="ml-2">{variant === "login" ? "Sign in with Google" : "Sign up with Google"}</span>
    </Button>
  )
}
