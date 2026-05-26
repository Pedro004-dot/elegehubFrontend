import { useState, useRef } from 'react'
import { Film, X, Upload, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useCuts } from '../hooks/use-cuts'
import { VideoCutCard } from '../components/video-cut-card'
import type { VideoCut } from '../types'

interface UploadStatus {
  fileName: string
  status: 'uploading' | 'success' | 'error'
  url?: string
  error?: string
}

export function CutsGalleryPage() {
  const { data: cuts, total, isLoading } = useCuts()
  const [selectedCut, setSelectedCut] = useState<VideoCut | null>(null)
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const statuses: UploadStatus[] = []

    for (const file of Array.from(files)) {
      const fileName = file.name
      statuses.push({ fileName, status: 'uploading' })
      setUploadStatuses([...statuses])

      try {
        // Determinar pasta baseado no tipo
        const isVideo = file.type.startsWith('video/')
        const folder = isVideo ? 'videos' : 'thumbnails'
        const path = `${folder}/${fileName}`

        // Upload para Supabase Storage
        const { error } = await supabase.storage
          .from('video-cuts')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: true,
          })

        if (error) throw error

        // Gerar URL publica
        const { data: urlData } = supabase.storage
          .from('video-cuts')
          .getPublicUrl(path)

        const idx = statuses.findIndex(s => s.fileName === fileName)
        statuses[idx] = { fileName, status: 'success', url: urlData.publicUrl }
        setUploadStatuses([...statuses])

        console.log(`Upload concluido: ${urlData.publicUrl}`)
      } catch (err) {
        const idx = statuses.findIndex(s => s.fileName === fileName)
        statuses[idx] = {
          fileName,
          status: 'error',
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        }
        setUploadStatuses([...statuses])
      }
    }

    setIsUploading(false)
    // Limpar input para permitir selecionar os mesmos arquivos novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Film className="w-5 h-5" />
              Cortes
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {total} {total === 1 ? 'corte pronto' : 'cortes prontos'} para publicacao
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleUploadClick} disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Enviando...' : 'Upload Videos'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Badge variant="secondary" className="text-sm">
              Preview - Em breve
            </Badge>
          </div>
        </div>

        {/* Status de uploads */}
        {uploadStatuses.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Uploads:</p>
            <div className="space-y-2">
              {uploadStatuses.map((status, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {status.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                  {status.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {status.status === 'error' && (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span className={status.status === 'error' ? 'text-red-500' : ''}>
                    {status.fileName}
                  </span>
                  {status.url && (
                    <code className="text-xs bg-background px-2 py-0.5 rounded max-w-md truncate">
                      {status.url}
                    </code>
                  )}
                  {status.error && (
                    <span className="text-xs text-red-500">({status.error})</span>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setUploadStatuses([])}
            >
              Limpar
            </Button>
          </div>
        )}
      </div>

      {/* Galeria */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[9/16]" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cuts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Film className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium">Nenhum corte encontrado</h2>
            <p className="text-muted-foreground mt-1 max-w-md">
              Os cortes gerados automaticamente pelos agentes de IA aparecerao aqui.
              Faca upload de um video para comecar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cuts.map(cut => (
              <VideoCutCard
                key={cut.id}
                cut={cut}
                onPlay={() => setSelectedCut(cut)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de video */}
      {selectedCut && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCut(null)}
        >
          <div
            className="relative max-w-lg w-full bg-background rounded-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Botao fechar */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedCut(null)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Video ou placeholder */}
            <div className="aspect-[9/16] bg-muted">
              {selectedCut.videoUrl ? (
                <video
                  src={selectedCut.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Film className="w-16 h-16 mb-4" />
                  <p className="text-sm">Video nao disponivel no preview</p>
                </div>
              )}
            </div>

            {/* Info do corte */}
            <div className="p-4">
              <h3 className="font-semibold">{selectedCut.title}</h3>
              {selectedCut.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedCut.description}
                </p>
              )}

              {selectedCut.suggestedCaption && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Legenda sugerida
                  </p>
                  <p className="text-sm">{selectedCut.suggestedCaption}</p>
                </div>
              )}

              {selectedCut.suggestedHashtags && selectedCut.suggestedHashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {selectedCut.suggestedHashtags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CutsGalleryPage
