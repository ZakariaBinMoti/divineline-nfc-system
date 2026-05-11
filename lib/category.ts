export type Category = 'identity' | 'healing' | 'no-fear' | 'kids'

const PREFIX_MAP: Record<string, Category> = {
  'ID': 'identity',
  'HL': 'healing',
  'NF': 'no-fear',
  'KD': 'kids',
}

export function getCategoryFromCode(braceletCode: string): Category | null {
  const prefix = braceletCode.split('-')[0]?.toUpperCase()
  return PREFIX_MAP[prefix] ?? null
}

export const CATEGORY_LABELS: Record<Category, string> = {
  'identity': 'Identity',
  'healing': 'Healing',
  'no-fear': 'No Fear',
  'kids': 'Kids Identity',
}
