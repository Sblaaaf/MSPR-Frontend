"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo et titre */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">HealthAI</h1>
          <p className="text-muted-foreground text-sm">
            {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </p>
        </div>

        {/* Formulaire */}
        {isLogin ? (
          <LoginForm />
        ) : (
          <RegisterForm onSuccess={() => setIsLogin(true)} />
        )}

        {/* Toggle Login/Register */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? (
              <>
                Pas encore de compte ?{" "}
                <span className="text-primary font-medium">S&apos;inscrire</span>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <span className="text-primary font-medium">Se connecter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
