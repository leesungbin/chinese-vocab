import { useLanguageStore } from '@/stores/languageStore'
import ko from '@/locales/ko.json'
import en from '@/locales/en.json'

const translations = {
  ko,
  en
}

type TranslationKey = string
type NestedTranslation = Record<string, any>

function getNestedValue(obj: NestedTranslation, path: string): string {
  const result = path.split('.').reduce((current, key) => {
    return current?.[key]
  }, obj)
  return typeof result === 'string' ? result : path
}

export function useTranslation() {
  const language = useLanguageStore((state) => state.language)
  
  const t = (key: TranslationKey): string => {
    const translation = translations[language]
    return getNestedValue(translation, key)
  }

  return { t, language }
}