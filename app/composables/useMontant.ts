// Les montants sont rangés en centimes et affichés en euros. La conversion vit
// ici, une fois, pour qu'on ne la voie jamais traîner dans un template.
export function euros(centimes: number | null | undefined): string {
  if (centimes == null) return '—'
  return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(
    centimes / 100,
  )
}
