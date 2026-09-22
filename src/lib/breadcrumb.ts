import { NAV_ITEMS } from '../config/nav'

export interface Crumb {
  label: string
  /** Absent sur le segment courant (dernier). */
  href?: string
  current?: boolean
}

// Fil d'Ariane partagé entre l'UI (SiteBreadcrumb) et le JSON-LD
// BreadcrumbList (schema de page) : libellés repris de NAV_ITEMS par
// correspondance de chemin, currentLabel pour un segment final hors nav
// (ex. « Plaquette »).
export const breadcrumbItems = (pathname: string, currentLabel?: string): Crumb[] => {
  const segments = pathname.split('/').filter(Boolean)
  const paths = ['/', ...segments.map((_, i) => '/' + segments.slice(0, i + 1).join('/'))]
  return paths.map((p, i) => {
    const isLast = i === paths.length - 1
    const nav = NAV_ITEMS.find(n => n.url === p)
    const label = nav?.label ?? (isLast && currentLabel ? currentLabel : p.split('/').pop() ?? p)
    return isLast
      ? { label, current: true }
      : { label, href: p === '/' ? '/' : p + '/' }
  })
}
