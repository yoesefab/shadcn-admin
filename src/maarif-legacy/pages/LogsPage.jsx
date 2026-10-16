import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { RecordsTable } from '@/features/maarif/records-table'
import { StatusBadge } from '@/features/maarif/status-badge'
import { frenchDateOrder } from '@/features/maarif/table-format'
import { TablePageHeading } from '@/features/maarif/table-page'

const AUDIT_EVENTS = [
  {
    id: 'AUD-2026-014286',
    date: '27 août 2026 à 22:41',
    user: 'Nadia El Mansouri',
    action: 'Modification',
    entityType: 'Paramètre système',
    entity: 'Limite d’import',
    summary: 'Limite de lignes mise à jour',
    result: 'Réussi',
  },
  {
    id: 'AUD-2026-014285',
    date: '27 août 2026 à 18:06',
    user: 'Salma Berrada',
    action: 'Création',
    entityType: 'Mouvement de stock',
    entity: 'MVT-2026-0384',
    summary: 'Correction de stock enregistrée',
    result: 'Réussi',
  },
  {
    id: 'AUD-2026-014284',
    date: '27 août 2026 à 16:42',
    user: 'Youssef Alaoui',
    action: 'Modification',
    entityType: 'Commande',
    entity: 'CMD-2026-1842',
    summary: 'Statut de commande mis à jour',
    result: 'Réussi',
  },
  {
    id: 'AUD-2026-014283',
    date: '27 août 2026 à 15:18',
    user: 'Imane Benjelloun',
    action: 'Export',
    entityType: 'Rapport',
    entity: 'Ventes · août 2026',
    summary: 'Rapport CSV généré',
    result: 'Réussi',
  },
  {
    id: 'AUD-2026-014282',
    date: '27 août 2026 à 13:24',
    user: 'Nadia El Mansouri',
    action: 'Modification',
    entityType: 'Utilisateur',
    entity: 'USR-008',
    summary: 'Rôle du compte modifié',
    result: 'Réussi',
  },
  {
    id: 'AUD-2026-014281',
    date: '27 août 2026 à 11:05',
    user: 'Amine Chraïbi',
    action: 'Création',
    entityType: 'Mouvement de stock',
    entity: 'MVT-2026-0383',
    summary: 'Réception fournisseur enregistrée',
    result: 'Réussi',
  },
  {
    id: 'AUD-2026-014280',
    date: '26 août 2026 à 17:56',
    user: 'Youssef Alaoui',
    action: 'Modification',
    entityType: 'Produit',
    entity: 'LIV-000184',
    summary: 'Seuil minimum mis à jour',
    result: 'Réussi',
  },
  {
    id: 'AUD-2026-014279',
    date: '26 août 2026 à 16:20',
    user: 'Nadia El Mansouri',
    action: 'Connexion',
    entityType: 'Session',
    entity: 'Administration',
    summary: 'Connexion administrateur réussie',
    result: 'Réussi',
  },
  {
    id: 'AUD-2026-014278',
    date: '26 août 2026 à 14:37',
    user: 'Salma Berrada',
    action: 'Modification',
    entityType: 'Alerte',
    entity: 'ALT-2026-0718',
    summary: 'Alerte de stock résolue',
    result: 'Réussi',
  },
  {
    id: 'AUD-2026-014277',
    date: '26 août 2026 à 10:12',
    user: 'Imane Benjelloun',
    action: 'Import',
    entityType: 'Fichier de ventes',
    entity: 'ventes_2026-08-26.csv',
    summary: 'Import validé et confirmé',
    result: 'Réussi',
  },
  {
    id: 'AUD-2026-014276',
    date: '25 août 2026 à 18:08',
    user: 'Amine Chraïbi',
    action: 'Création',
    entityType: 'Mouvement de stock',
    entity: 'MVT-2026-0379',
    summary: 'Produit endommagé enregistré',
    result: 'Réussi',
  },
  {
    id: 'AUD-2026-014275',
    date: '25 août 2026 à 09:46',
    user: 'Nadia El Mansouri',
    action: 'Modification',
    entityType: 'Paramètre système',
    entity: 'Historique prévisionnel',
    summary: 'Historique minimum mis à jour',
    result: 'Réussi',
  },
]

function AuditLogSection({ auditEvents = AUDIT_EVENTS }) {
  const [period, setPeriod] = useState('7 derniers jours')
  // The audit fixtures represent the snapshot taken on 27 August, not live events.
  const cutoff =
    period === '24 dernières heures'
      ? 202608270000
      : period === '7 derniers jours'
        ? 202608210000
        : 202607290000
  const events = auditEvents.filter(
    (event) => frenchDateOrder(event.date) >= cutoff
  )
  return (
    <div className='flex min-w-0 flex-col gap-4'>
      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger aria-label='Filtrer par date' className='w-56'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['24 dernières heures', '7 derniers jours', '30 derniers jours'].map(
            (value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
      <RecordsTable
        key={period}
        label='Journal d’audit'
        data={events}
        rowId={(row) => row.id}
        selectable={false}
        searchPlaceholder='Rechercher une activité…'
        fields={[
          {
            key: 'date',
            label: 'Date',
            value: (row) => frenchDateOrder(row.date),
            render: (row) => row.date,
          },
          { key: 'id', label: 'Événement', hidden: true },
          { key: 'user', label: 'Utilisateur', filter: true },
          {
            key: 'action',
            label: 'Action',
            filter: true,
            render: (row) => <Badge variant='outline'>{row.action}</Badge>,
          },
          { key: 'entityType', label: 'Type d’entité', filter: true },
          { key: 'entity', label: 'Entité' },
          {
            key: 'summary',
            label: 'Activité',
            render: (row) => (
              <p className='w-64 whitespace-normal'>{row.summary}</p>
            ),
          },
          {
            key: 'result',
            label: 'Résultat',
            render: (row) => <StatusBadge status={row.result} />,
          },
        ]}
      />
    </div>
  )
}

export function LogsPage({ auditEvents }) {
  return (
    <div className='flex min-w-0 flex-col gap-6'>
      <TablePageHeading
        title='Logs'
        description='Consultez le journal d’audit et suivez l’activité administrative.'
      />
      <AuditLogSection auditEvents={auditEvents} />
    </div>
  )
}
