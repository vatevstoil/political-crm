// Избирателни секции за Франция — извлечени от Решение № 4511-НС / 27.02.2026 на ЦИК
// https://www.cik.bg/bg/decisions/4511/2026-02-27

export interface VotingSection {
  id: string
  label: string
  city: string
}

export const FRANCE_VOTING_SECTIONS: VotingSection[] = [
  { id: 'FR-001', label: 'Париж (Посолство 1)', city: 'Париж' },
  { id: 'FR-002', label: 'Париж (Посолство 2)', city: 'Париж' },
  { id: 'FR-003', label: 'Париж (Посолство 3)', city: 'Париж' },
  { id: 'FR-004', label: 'Бокузе', city: 'Бокузе' },
  { id: 'FR-005', label: 'Бордо', city: 'Бордо' },
  { id: 'FR-006', label: 'Гренобъл', city: 'Гренобъл' },
  { id: 'FR-007', label: 'Лил', city: 'Лил' },
  { id: 'FR-008', label: 'Лион (Генерално консулство)', city: 'Лион' },
  { id: 'FR-009', label: 'Маринян', city: 'Маринян' },
  { id: 'FR-010', label: 'Марсилия', city: 'Марсилия' },
  { id: 'FR-011', label: 'Монпелие', city: 'Монпелие' },
  { id: 'FR-012', label: 'Ница', city: 'Ница' },
  { id: 'FR-013', label: 'Рен', city: 'Рен' },
  { id: 'FR-014', label: 'Сен-Назер', city: 'Сен-Назер' },
  { id: 'FR-015', label: 'Страсбург (ПП при СЕ)', city: 'Страсбург' },
  { id: 'FR-016', label: 'Туар', city: 'Туар' },
  { id: 'FR-017', label: 'Тулуза', city: 'Тулуза' },
]

// Options format for EditableField dropdown
export const VOTING_SECTION_OPTIONS = [
  { value: '', label: '— Без секция —' },
  ...FRANCE_VOTING_SECTIONS.map(s => ({ value: s.label, label: s.label })),
]
