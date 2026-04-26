"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Salad, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const userRole = localStorage.getItem("user_role")
    
    if (!userId || userRole !== "admin") {
      router.push("/login")
      return
    }
    
    setIsAuthorized(true)
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user_id")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_name")
    localStorage.removeItem("user_role")
    router.push("/login")
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Salad className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Jarmy Admin</span>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Area reserved for administrators. Coming soon...
          </p>
        </div>
      </section>
    </main>
  )
}
