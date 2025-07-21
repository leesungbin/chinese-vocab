import { useLocalStorage } from './useLocalStorage'

interface ThemeStyles {
  background: string
  decorativeBlur: string
  decorativeBlurLight: string
  mainText: string
  secondaryText: string
  tertiaryText: string
  glassBackground: string
  glassBackgroundStrong: string
  glassBorder: string
  glassBorderStrong: string
  buttonGlass: string
  buttonGlassHover: string
  progressFill: string
}

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const themeStyles: ThemeStyles = {
    background: isDarkMode ? "bg-black" : "bg-gray-50",
    decorativeBlur: isDarkMode ? "bg-white/5" : "bg-white/30",
    decorativeBlurLight: isDarkMode ? "bg-white/3" : "bg-white/20",
    mainText: isDarkMode ? "text-white" : "text-gray-900",
    secondaryText: isDarkMode ? "text-gray-300" : "text-gray-600",
    tertiaryText: isDarkMode ? "text-gray-400" : "text-gray-500",
    glassBackground: isDarkMode ? "bg-white/10" : "bg-white/60",
    glassBackgroundStrong: isDarkMode ? "bg-white/15" : "bg-white/80",
    glassBorder: isDarkMode ? "border-white/20" : "border-white/40",
    glassBorderStrong: isDarkMode ? "border-white/30" : "border-white/60",
    buttonGlass: isDarkMode ? "bg-white/20" : "bg-white/70",
    buttonGlassHover: isDarkMode ? "hover:bg-white/30" : "hover:bg-white/90",
    progressFill: isDarkMode ? "bg-white" : "bg-gray-800",
  }

  return {
    isDarkMode,
    toggleTheme,
    themeStyles
  }
}