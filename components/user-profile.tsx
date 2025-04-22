"use client"

import { useState } from "react"
import Link from "next/link"
import { LogOut, Settings, User } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

export function UserProfile() {
  const [open, setOpen] = useState(false)
  const { isLoggedIn, user, login, logout } = useAuth()

  // If not logged in, show login button instead
  if (!isLoggedIn) {
    return (
      <Link href="/login">
        <Button size="sm">Log In</Button>
      </Link>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={user?.photoURL || "/placeholder.svg"} alt={user?.displayName || "User"} />
            <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline-block">{user?.displayName || "User"}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL || "/placeholder.svg"} alt={user?.displayName || "User"} />
            <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium">{user?.displayName || "User"}</p>
            <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Your Profile</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
