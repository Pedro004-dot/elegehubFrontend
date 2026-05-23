import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCurrentCampaign } from '../hooks/useCurrentCampaign'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  fetchCampaignMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
} from '../services/authService'
import type { CampaignMember } from '../types'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietario',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-primary text-primary-foreground',
  admin: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  editor: 'bg-green-500/20 text-green-700 dark:text-green-300',
  viewer: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
}

export function TeamSettingsPage() {
  const campaign = useCurrentCampaign()
  const { user } = useAuth()
  const [members, setMembers] = useState<CampaignMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer')
  const [isInviting, setIsInviting] = useState(false)

  const isOwnerOrAdmin = campaign.userRole === 'owner' || campaign.userRole === 'admin'

  useEffect(() => {
    loadMembers()
  }, [campaign.id])

  const loadMembers = async () => {
    setIsLoading(true)
    try {
      const data = await fetchCampaignMembers(campaign.id)
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar membros')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!inviteEmail.trim()) {
      setError('Email e obrigatorio')
      return
    }

    setIsInviting(true)
    try {
      await inviteMember(campaign.id, { email: inviteEmail.trim(), role: inviteRole })
      setInviteEmail('')
      await loadMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao convidar membro')
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    try {
      await updateMemberRole(campaign.id, memberId, newRole)
      await loadMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar role')
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return

    try {
      await removeMember(campaign.id, memberId)
      await loadMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover membro')
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Equipe da Campanha</h1>
        <p className="text-muted-foreground">{campaign.name}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
          <button
            className="ml-2 underline"
            onClick={() => setError(null)}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Invite Form */}
      {isOwnerOrAdmin && (
        <Card className="mb-8 p-6">
          <h2 className="mb-4 text-lg font-semibold">Convidar Membro</h2>
          <form onSubmit={handleInvite} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="inviteEmail" className="sr-only">
                Email
              </Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isInviting}
              />
            </div>
            <div className="w-40">
              <Label htmlFor="inviteRole" className="sr-only">
                Funcao
              </Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as any)}
                disabled={isInviting}
              >
                <SelectTrigger id="inviteRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isInviting}>
              {isInviting ? 'Convidando...' : 'Convidar'}
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            O usuario precisa ter uma conta no ElegeHub para ser convidado.
          </p>
        </Card>
      )}

      {/* Members List */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Membros ({members.length})</h2>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Carregando...</div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum membro encontrado
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                    {member.user_id === user?.id ? '👤' : '🧑'}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.user_id === user?.id ? 'Voce' : `Usuario ${member.user_id.slice(0, 8)}...`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Desde {new Date(member.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {member.role === 'owner' || !isOwnerOrAdmin ? (
                    <Badge className={ROLE_COLORS[member.role]}>
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  ) : (
                    <Select
                      value={member.role}
                      onValueChange={(v) => handleUpdateRole(member.id, v as any)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {isOwnerOrAdmin && member.role !== 'owner' && member.user_id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Roles Description */}
      <div className="mt-8 rounded-lg bg-muted/50 p-6">
        <h3 className="mb-4 font-semibold">Sobre as funcoes</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Proprietario:</strong> Controle total da campanha, pode
            adicionar/remover membros e alterar configuracoes.
          </div>
          <div>
            <strong className="text-foreground">Administrador:</strong> Pode gerenciar membros e todas
            as funcionalidades, exceto excluir a campanha.
          </div>
          <div>
            <strong className="text-foreground">Editor:</strong> Pode criar e editar conteudos, cortes
            de video e publicacoes.
          </div>
          <div>
            <strong className="text-foreground">Visualizador:</strong> Apenas visualiza dados e
            relatorios, sem permissao para editar.
          </div>
        </div>
      </div>
    </div>
  )
}
