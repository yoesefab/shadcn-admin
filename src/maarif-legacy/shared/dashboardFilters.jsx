import { CalendarBlank } from '@phosphor-icons/react'

export const DEFAULT_FILTERS = {
  period: '01–27 août 2026',
  category: 'Toutes',
  language: 'Toutes',
  author: 'Tous',
  publisher: 'Tous',
}

export const FILTER_DEFINITIONS = [
  {
    key: 'period',
    label: 'Période',
    options: [
      '01–27 août 2026',
      '01–27 juillet 2026',
      '01 janvier–27 août 2026',
    ],
    icon: CalendarBlank,
  },
  {
    key: 'category',
    label: 'Catégorie',
    options: ['Toutes', 'Roman', 'Jeunesse', 'Scolaire', 'Essai'],
  },
  {
    key: 'language',
    label: 'Langue',
    options: ['Toutes', 'Français', 'Arabe', 'Anglais'],
  },
  {
    key: 'author',
    label: 'Auteur',
    options: ['Tous', 'Tahar Ben Jelloun', 'Mohamed Choukri', 'Albert Camus'],
  },
  {
    key: 'publisher',
    label: 'Éditeur',
    options: ['Tous', 'Gallimard', 'Le Seuil', 'La Croisée des chemins'],
  },
]
