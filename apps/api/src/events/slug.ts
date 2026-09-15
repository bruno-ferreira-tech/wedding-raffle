export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .replace(/&/g, ' e ')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace into hyphens
    .replace(/-+/g, '-') // collapse duplicate hyphens
    .replace(/^-+|-+$/g, ''); // trim hyphens from ends
}
