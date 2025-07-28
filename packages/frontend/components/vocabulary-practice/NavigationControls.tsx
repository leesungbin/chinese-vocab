import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface NavigationControlsProps {
  currentIndex: number
  filteredDataLength: number
  memorizedWords: Set<number>
  showMemorizedWords: boolean
  nextWord: () => void
  prevWord: () => void
  themeStyles: any
}

export function NavigationControls({
  currentIndex,
  filteredDataLength,
  memorizedWords,
  showMemorizedWords,
  nextWord,
  prevWord,
  themeStyles,
}: NavigationControlsProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={prevWord}
          className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
        >
          <ChevronLeft className="h-4 w-4" />
          {t('vocabulary.previousWord')}
        </Button>

        <div
          className={`flex flex-col items-center text-sm ${themeStyles.secondaryText} backdrop-blur-md ${themeStyles.glassBackground} px-4 py-2 rounded-full ${themeStyles.glassBorder}`}
        >
          <div>
            {currentIndex + 1} {t('vocabulary.of')} {filteredDataLength}
          </div>
          {!showMemorizedWords && memorizedWords.size > 0 && (
            <div className="text-xs opacity-75">
              ({memorizedWords.size} {t('vocabulary.memorized')})
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={nextWord}
          className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
        >
          {t('vocabulary.nextWord')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div
        className={`backdrop-blur-md ${themeStyles.glassBackground} rounded-full h-3 ${themeStyles.glassBorder} overflow-hidden`}
      >
        <div
          className={`${themeStyles.progressFill} h-full rounded-full transition-all duration-300`}
          style={{
            width: `${((currentIndex + 1) / filteredDataLength) * 100}%`,
          }}
        ></div>
      </div>
    </>
  )
}
