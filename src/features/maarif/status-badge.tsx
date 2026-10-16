import { type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

type Tone =
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'
  | 'neutral'
  | 'sky'
  | 'purple'

const statusTones: Record<string, Tone> = {
  Actif: 'success',
  Disponible: 'success',
  Livrée: 'success',
  Terminé: 'success',
  Résolue: 'success',
  Réussi: 'success',
  Valide: 'success',
  'Stock faible': 'warning',
  'Risque de rupture': 'warning',
  'En préparation': 'purple',
  Nouvelle: 'warning',
  'Terminé avec erreurs': 'warning',
  Élevée: 'warning',
  Expédiée: 'sky',
  Acquittée: 'info',
  'En cours': 'info',
  Moyenne: 'info',
  Désactivé: 'danger',
  Inactif: 'danger',
  Échec: 'danger',
  Annulée: 'danger',
  Annulé: 'danger',
  Critique: 'danger',
  'Rupture de stock': 'danger',
  'Date invalide': 'danger',
  'Référence dupliquée': 'danger',
  'SKU inconnu': 'danger',
  'Quantité invalide': 'danger',
  Brouillon: 'purple',
}

const toneClasses = {
  success: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  purple:
    'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
}

export function StatusBadge({
  status,
  children,
}: {
  status: string
  children?: ReactNode
}) {
  const tone = statusTones[status] ?? 'neutral'
  return (
    <Badge
      variant={tone === 'neutral' ? 'secondary' : 'default'}
      className={tone === 'neutral' ? undefined : toneClasses[tone]}
    >
      {children ?? status}
    </Badge>
  )
}
