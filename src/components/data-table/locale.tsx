import { createContext, useContext, type ReactNode } from 'react'

const english = {
  reset: 'Reset',
  view: 'View',
  columns: 'Toggle columns',
  hide: 'Hide',
  asc: 'Asc',
  desc: 'Desc',
  selected: 'selected',
  empty: 'No results found.',
  clear: 'Clear filters',
  rowsPerPage: 'Rows per page',
  of: 'of',
  first: 'Go to first page',
  previous: 'Go to previous page',
  next: 'Go to next page',
  last: 'Go to last page',
  goTo: 'Go to page',
}
const french: typeof english = {
  reset: 'Réinitialiser',
  view: 'Affichage',
  columns: 'Colonnes visibles',
  hide: 'Masquer',
  asc: 'Croissant',
  desc: 'Décroissant',
  selected: 'sélectionnés',
  empty: 'Aucun résultat.',
  clear: 'Effacer les filtres',
  rowsPerPage: 'Lignes par page',
  of: 'sur',
  first: 'Première page',
  previous: 'Page précédente',
  next: 'Page suivante',
  last: 'Dernière page',
  goTo: 'Aller à la page',
}

const DataTableLocaleContext = createContext({
  labels: english,
  columnLabels: {} as Record<string, string>,
})

export function DataTableFrenchProvider({
  children,
  columnLabels,
}: {
  children: ReactNode
  columnLabels: Record<string, string>
}) {
  return (
    <DataTableLocaleContext.Provider value={{ labels: french, columnLabels }}>
      {children}
    </DataTableLocaleContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDataTableLocale = () => useContext(DataTableLocaleContext)
