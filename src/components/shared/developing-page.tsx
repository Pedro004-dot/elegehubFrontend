import { Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface DevelopingPageProps {
  title: string
  description?: string
}

export function DevelopingPage({ title, description }: DevelopingPageProps) {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Construction className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-semibold text-center">{title}</h1>
          <p className="text-muted-foreground text-center">
            Estamos desenvolvendo
          </p>
          {description && (
            <p className="text-sm text-muted-foreground text-center">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
