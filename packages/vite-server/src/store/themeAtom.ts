import { atom } from 'jotai'

type Theme = 'light' | 'dark'

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme') as Theme
    return saved || 'light'
  }
  return 'light'
}

export const themeAtom = atom<Theme>(getInitialTheme())

export const themeWithPersistenceAtom = atom(
  (get) => get(themeAtom),
  (_get, set, newTheme: Theme) => {
    set(themeAtom, newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }
)
