import { useMemo } from 'react'

interface DashboardHeaderProps {
  candidateName?: string
  state?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getRelativeTime(): string {
  // Mock: always show "há 5 min" for now
  return 'há 5 min'
}

export function DashboardHeader({
  candidateName = 'João',
  state = 'MG',
}: DashboardHeaderProps) {
  const greeting = useMemo(() => getGreeting(), [])
  const relativeTime = useMemo(() => getRelativeTime(), [])

  return (
    <header className="flex items-center justify-between border-b border-border pb-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {greeting}, {candidateName}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Última atualização: {relativeTime} · {state}
        </p>
      </div>
    </header>
  )
}
