import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface CampaignSwitcherProps {
  collapsed?: boolean
}

export function CampaignSwitcher({ collapsed = false }: CampaignSwitcherProps) {
  const { campaigns, currentCampaign, switchCampaign, isLoading } = useAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="px-2 py-3">
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="px-2 py-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/onboarding/create-campaign')}
        >
          <Plus className="mr-2 h-4 w-4" />
          {!collapsed && 'Criar Campanha'}
        </Button>
      </div>
    )
  }

  if (collapsed) {
    return (
      <div className="flex justify-center py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
          {currentCampaign?.state || '?'}
        </div>
      </div>
    )
  }

  return (
    <div className="px-2 py-3">
      <Select
        value={currentCampaign?.id || ''}
        onValueChange={(value) => value && switchCampaign(value)}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2 truncate">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
              {currentCampaign?.state || '?'}
            </div>
            <div className="flex-1 truncate text-left">
              <span className="block truncate text-sm font-medium">
                {currentCampaign?.candidate_name || 'Selecione'}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {currentCampaign?.position || ''}
              </span>
            </div>
          </div>
        </SelectTrigger>
        <SelectContent>
          {campaigns.map((campaign) => (
            <SelectItem key={campaign.id} value={campaign.id}>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                  {campaign.state}
                </div>
                <div>
                  <span className="block text-sm font-medium">{campaign.candidate_name}</span>
                  <span className="block text-xs text-muted-foreground">{campaign.position}</span>
                </div>
              </div>
            </SelectItem>
          ))}
          <div className="border-t pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate('/onboarding/create-campaign')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}
