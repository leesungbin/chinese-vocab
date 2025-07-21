import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X, Shuffle } from "lucide-react"

interface SettingsModalProps {
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  showChinese: boolean
  setShowChinese: (show: boolean) => void
  showPinyin: boolean
  setShowPinyin: (show: boolean) => void
  showKorean: boolean
  setShowKorean: (show: boolean) => void
  showMemorizedWords: boolean
  setShowMemorizedWords: (show: boolean) => void
  vocabularyDataLength: number
  shuffleWords: () => void
  resetToOriginal: () => void
  isShuffled: boolean
  selectedDay: number | null
  availableDays: number[]
  filterByDay: (day: number | null) => void
  memorizedWords: Set<number>
  resetAllMemorizedWords: () => void
  resetRevealStates: () => void
  themeStyles: any
}

export function SettingsModal({
  settingsOpen,
  setSettingsOpen,
  showChinese,
  setShowChinese,
  showPinyin,
  setShowPinyin,
  showKorean,
  setShowKorean,
  showMemorizedWords,
  setShowMemorizedWords,
  vocabularyDataLength,
  shuffleWords,
  resetToOriginal,
  isShuffled,
  selectedDay,
  availableDays,
  filterByDay,
  memorizedWords,
  resetAllMemorizedWords,
  resetRevealStates,
  themeStyles
}: SettingsModalProps) {
  
  const handleResetMemorizedWords = () => {
    resetAllMemorizedWords()
    resetRevealStates()
  }

  if (!settingsOpen) return null

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`backdrop-blur-md ${themeStyles.glassBackground} rounded-2xl ${themeStyles.glassBorder} shadow-xl p-6 w-full max-w-md mx-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${themeStyles.mainText}`}>Settings</h2>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(false)} aria-label="Close settings">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Display Settings */}
        <h3 className={`text-lg font-semibold ${themeStyles.mainText} mb-4`}>Display Settings</h3>
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-chinese" className={`text-sm font-medium ${themeStyles.secondaryText}`}>
              Always show Chinese characters
            </Label>
            <Switch 
              id="show-chinese" 
              checked={showChinese} 
              onCheckedChange={setShowChinese}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-pinyin" className={`text-sm font-medium ${themeStyles.secondaryText}`}>
              Always show pronunciation (Pinyin)
            </Label>
            <Switch 
              id="show-pinyin" 
              checked={showPinyin} 
              onCheckedChange={setShowPinyin}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-korean" className={`text-sm font-medium ${themeStyles.secondaryText}`}>
              Always show Korean meaning
            </Label>
            <Switch 
              id="show-korean" 
              checked={showKorean} 
              onCheckedChange={setShowKorean}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-memorized" className={`text-sm font-medium ${themeStyles.secondaryText}`}>
              Show memorized words
            </Label>
            <Switch 
              id="show-memorized" 
              checked={showMemorizedWords} 
              onCheckedChange={setShowMemorizedWords}
            />
          </div>
        </div>

        {/* Word Order & Filtering */}
        <h3 className={`text-lg font-semibold ${themeStyles.mainText} mb-4`}>Word Order & Filtering</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              onClick={shuffleWords}
              disabled={vocabularyDataLength === 0}
              className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
            >
              <Shuffle className="h-4 w-4" />
              Shuffle Words
            </Button>
            <Button
              variant="outline"
              onClick={resetToOriginal}
              disabled={vocabularyDataLength === 0 || (!isShuffled && selectedDay === null)}
              className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
            >
              Reset Order
            </Button>
          </div>
          
          {availableDays.length > 0 && (
            <div className="space-y-2">
              <Label className={`text-sm font-medium ${themeStyles.secondaryText}`}>Filter by Day Group</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedDay === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => filterByDay(null)}
                  className={`backdrop-blur-md ${selectedDay === null ? themeStyles.progressFill + ' text-white' : themeStyles.buttonGlass + ' ' + themeStyles.mainText} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover}`}
                >
                  All Days
                </Button>
                {availableDays.map(day => (
                  <Button
                    key={day}
                    variant={selectedDay === day ? "default" : "outline"}
                    size="sm"
                    onClick={() => filterByDay(day)}
                    className={`backdrop-blur-md ${selectedDay === day ? themeStyles.progressFill + ' text-white' : themeStyles.buttonGlass + ' ' + themeStyles.mainText} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover}`}
                  >
                    Day {day}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Memorized Words Reset */}
        <div className="flex items-center justify-between mt-6">
          <Label className={`text-sm font-medium ${themeStyles.secondaryText}`}>Reset Memorized Words</Label>
          <Button
            variant="outline"
            disabled={memorizedWords.size === 0}
            onClick={handleResetMemorizedWords}
            className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
          >
            Reset Memorized Words
          </Button>
        </div>
      </div>
    </div>
  )
}