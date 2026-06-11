"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose,
} from "@/components/ui/sheet"

type AdminPage = "overview" | "data" | "analytics" | "supervision"

const NAV: { key: AdminPage; href: string; label: string }[] = [
  { key: "overview", href: "/admin", label: "Vue d'ensemble" },
  { key: "data", href: "/admin/data", label: "Données" },
  { key: "analytics", href: "/admin/analytics", label: "Analytics" },
  { key: "supervision", href: "/admin/supervision", label: "Supervision" },
]

/**
 * En-tête d'administration responsive.
 * - Desktop (md+) : logo + liens inline + actions + déconnexion.
 * - Mobile : bouton burger ouvrant un panneau latéral (Sheet) avec les liens ;
 *   actions et déconnexion restent accessibles, compactés, dans la barre.
 */
export function AdminNav({
  current,
  actions,
}: {
  current: AdminPage
  actions?: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function logout() {
    localStorage.clear()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b bg-card/80 backdrop-blur-sm">
      {/* Gauche : burger (mobile) + logo + liens (desktop) */}
      <div className="flex items-center gap-3 min-w-0">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b">
              <SheetTitle className="flex items-center gap-2">
                <img src="/JARMY-logo-01.svg" alt="Jarmy" className="h-6" />
                <span className="text-muted-foreground text-sm font-normal">Admin</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-2" aria-label="Navigation admin">
              {NAV.map((item) => (
                <SheetClose asChild key={item.key}>
                  <Link
                    href={item.href}
                    className={`rounded-lg px-4 py-3 text-sm transition-colors ${
                      item.key === current
                        ? "bg-primary/10 font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    aria-current={item.key === current ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
              <button
                onClick={() => { setOpen(false); logout() }}
                className="mt-2 flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/admin" className="flex items-center shrink-0" aria-label="Accueil admin">
          <img src="/JARMY-logo-01.svg" alt="Jarmy" className="h-7" />
        </Link>

        <nav className="hidden md:flex gap-4 text-sm ml-2" aria-label="Navigation admin">
          {NAV.map((item) =>
            item.key === current ? (
              <span key={item.key} className="font-semibold text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                key={item.key}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>

      {/* Droite : actions spécifiques à la page + déconnexion */}
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Déconnexion" className="hidden md:inline-flex">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
