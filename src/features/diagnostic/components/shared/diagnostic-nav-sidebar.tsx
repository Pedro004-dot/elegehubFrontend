/**
 * DiagnosticNavSidebar
 *
 * Sticky sidebar for navigating between diagnostic sections.
 */

import { useNavigate, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SECTION_INFO } from '../../types'
import type { SectionType } from '../../types'
import {
  FileText,
  User,
  Map,
  Users,
  BarChart,
  MessageSquare,
  ListTodo,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Section icons mapping
const SECTION_ICONS: Record<SectionType, typeof FileText> = {
  executive_summary: FileText,
  candidate_profile: User,
  territorial: Map,
  competitors: Users,
  benchmark: BarChart,
  narrative: MessageSquare,
  action_plan: ListTodo,
}

// Section order for navigation
const SECTION_ORDER: SectionType[] = [
  'executive_summary',
  'candidate_profile',
  'territorial',
  'competitors',
  'benchmark',
  'narrative',
  'action_plan',
]

interface DiagnosticNavSidebarProps {
  availableSections: SectionType[]
}

export function DiagnosticNavSidebar({
  availableSections,
}: DiagnosticNavSidebarProps) {
  const navigate = useNavigate()
  const { sectionType } = useParams<{ sectionType: SectionType }>()

  return (
    <aside className="w-60 shrink-0 sticky top-6 self-start">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-ink-secondary hover:text-ink-primary"
        onClick={() => navigate('/diagnostico')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao diagnostico
      </Button>

      <nav className="space-y-1">
        {SECTION_ORDER.map((type) => {
          const info = SECTION_INFO[type]
          const Icon = SECTION_ICONS[type]
          const isAvailable = availableSections.includes(type)
          const isActive = sectionType === type

          return (
            <button
              key={type}
              onClick={() => isAvailable && navigate(`/diagnostico/secao/${type}`)}
              disabled={!isAvailable}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                isActive
                  ? 'bg-brand-subtle text-brand font-medium'
                  : isAvailable
                  ? 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                  : 'text-ink-muted cursor-not-allowed'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-small truncate">{info.title}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
