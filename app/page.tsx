export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">HealthAI</h1>
        <p className="text-muted-foreground mb-8">Application de santé et nutrition personnalisée</p>
        <a 
          href="/login"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-accent transition-colors"
        >
          Accéder à l&apos;application
        </a>
      </div>
    </main>
  );
}
