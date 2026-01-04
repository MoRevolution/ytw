"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { openDB } from "idb"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { isWatchHistoryDataComplete } from "@/lib/indexeddb"
import { processAndStoreWatchHistoryByYear } from "@/lib/process-watch-history"

// Firebase imports would go here in a real implementation
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth} from "@/lib/firebase"

interface GoogleLoginProps {
  variant: "login" | "signup"
}

export function GoogleLogin({ variant }: GoogleLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoadingStatus, setDataLoadingStatus] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setDataLoadingStatus("Signing in with Google...")

    try {
      const provider = new GoogleAuthProvider()
      provider.addScope("https://www.googleapis.com/auth/drive")

      const result = await signInWithPopup(auth, provider)
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken
      const user = result.user

      if (!token) {
        throw new Error("No access token available")
      }

      setDataLoadingStatus("Creating your account...")

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
      const hasCompleteData = await isWatchHistoryDataComplete();
      let isSampleUser = false;
      
      if (!hasCompleteData) {
        setDataLoadingStatus("Fetching your YouTube watch history...")
        console.log("[Login] Watch history data not found or incomplete, fetching...");
        
        try {
          console.log("[Login] Getting ID token for API call...");
          const idToken = await user.getIdToken();
          console.log("[Login] ID token obtained, length:", idToken?.length);
          
          console.log("[Login] Calling /api/users/get-history...");
          const response = await fetch('/api/users/get-history', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
          });
          
          console.log("[Login] Response status:", response.status);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[Login] Error response:", errorData);
            
            // Handle specific error types
            if (errorData.error === 'NO_TAKEOUT_FOLDER') {
              throw new Error('NO_TAKEOUT: ' + (errorData.message || 'No Takeout export found'));
            }
            if (errorData.error === 'TOKEN_ERROR') {
              throw new Error('TOKEN_ERROR: ' + (errorData.message || 'Please re-login'));
            }
            if (errorData.error === 'INVALID_TAKEOUT') {
              throw new Error('INVALID_TAKEOUT: ' + (errorData.message || 'Takeout missing history'));
            }
            
            throw new Error(`Failed to fetch watch history: ${response.status} - ${errorData.message || errorData.details || 'Unknown error'}`);
          }
          
          const responseData = await response.json();
          console.log("[Login] Response received, has data:", !!responseData.data);
          
          const { data } = responseData;
          
          if (!data) {
            throw new Error("No watch history data in response");
          }
          
          console.log("[Login] Processing and storing watch history...");
          // Process and store the watch history data
          await processAndStoreWatchHistoryByYear(data);
          console.log("[Login] Watch history stored successfully!");
          
          toast({
            title: "Data imported",
            description: "Your YouTube watch history has been successfully imported.",
          });
        } catch (error: any) {
          console.error("[Login] Watch history fetch error:");
          console.error("[Login] Error message:", error.message);
          console.error("[Login] Full error:", error);
          
          // Show appropriate message based on error type
          if (error.message.includes('NO_TAKEOUT')) {
            toast({
              title: "No Takeout Export Found",
              description: "Please create a Google Takeout export with your YouTube history first.",
              variant: "destructive",
            });
          } else if (error.message.includes('TOKEN_ERROR')) {
            toast({
              title: "Session Error",
              description: "Please log out and log in again to refresh your session.",
              variant: "destructive",
            });
          } else if (error.message.includes('INVALID_TAKEOUT')) {
            toast({
              title: "Invalid Takeout Export",
              description: "Your Takeout export doesn't contain YouTube history. Please export again with history included.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Using Sample Data",
              description: "Could not fetch your watch history. You'll see sample data on the dashboard.",
            });
          }
          isSampleUser = true;
        }
      } else {
        console.log("📦 Using existing watch history data from IndexedDB");
      }
      
      setDataLoadingStatus("Finalizing your data...")
      
      login({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isSampleUser
      })
      
      toast({
        title: isNewUser ? "Welcome!" : "Welcome back!",
        description: isNewUser 
          ? "Your account has been created successfully." 
          : "You have been successfully logged in.",
      })

      router.push("/dashboard");

    } catch (error) {
      console.error("Error during Google login process:", error)
      toast({
        title: "Error",
        description: "An error occurred during the login process. Please try again.",
      })
    } finally {
      // Clean up loading states
      setIsLoading(false)
      setDataLoadingStatus(null)
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
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{dataLoadingStatus || "Loading..."}</span>
        </>
      ) : (
        <>
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
          <span className="ml-2">{variant === "login" ? "Sign in with Google" : "Sign up with Google"}</span>
        </>
      )}
    </Button>
  )
}
