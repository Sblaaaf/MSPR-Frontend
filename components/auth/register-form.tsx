"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [sexe, setSexe] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!nom || !prenom || !sexe) {
      setError("Veuillez remplir tous les champs.")
      return
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8003/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nom, prenom, email, password, sexe }),
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess("Compte créé avec succès ! Vous pouvez maintenant vous connecter.")
        console.log("[v0] Register success:", data)
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      } else {
        setError(data.detail || "Erreur lors de la création du compte")
      }
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
        />
        <Input
          type="text"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          required
          className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
        />
        <div className="flex gap-4 items-center">
          <label className="text-sm">Sexe :</label>
          <select
            value={sexe}
            onChange={(e) => setSexe(e.target.value)}
            required
            className="h-12 rounded-xl bg-card border border-border/50 focus:border-primary px-2"
          >
            <option value="">Sélectionner</option>
            <option value="femme">Femme</option>
            <option value="homme">Homme</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
        />
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
        />
        <Input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
      {success && (
        <p className="text-sm text-primary text-center">{success}</p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl text-base font-medium"
      >
        {isLoading ? (
          <Spinner className="w-5 h-5" />
        ) : (
          "S'inscrire"
        )}
      </Button>
    </form>
  )
}
