import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, Volume2, AlertTriangle } from "lucide-react"
import type { VocabItem } from "@/utils/vocabularyService"
import { useAuth } from "@/hooks/useAuth"

interface VocabularyCardProps {
  currentWord: VocabItem
  isLoading: boolean
  vocabularyDataLength: number
  memorizedWords: Set<number>
  showChinese: boolean
  showPinyin: boolean
  showKorean: boolean
  pinyinRevealed: boolean
  setPinyinRevealed: (revealed: boolean) => void
  koreanRevealed: boolean
  setKoreanRevealed: (revealed: boolean) => void
  chineseRevealed: boolean
  handleRevealChinese: () => void
  toggleMemorized: (wordId: number) => void
  themeStyles: any
  showMemorizedWords: boolean
}

export function VocabularyCard({
  currentWord,
  isLoading,
  vocabularyDataLength,
  memorizedWords,
  showChinese,
  showPinyin,
  showKorean,
  pinyinRevealed,
  setPinyinRevealed,
  koreanRevealed,
  setKoreanRevealed,
  chineseRevealed,
  handleRevealChinese,
  toggleMemorized,
  themeStyles,
  showMemorizedWords
}: VocabularyCardProps) {
  const { isAuthenticated } = useAuth()
  const [showTTSAlert, setShowTTSAlert] = useState(false)

  // Calculate font size based on Chinese text length
  const getFontSizeForChinese = (text: string) => {
    const length = text.length
    if (length <= 2) return 'text-8xl' // Very large for 1-2 characters
    if (length <= 4) return 'text-7xl' // Large for 3-4 characters
    if (length <= 6) return 'text-6xl' // Medium-large for 5-6 characters
    if (length <= 8) return 'text-5xl' // Medium for 7-8 characters
    if (length <= 12) return 'text-4xl' // Small-medium for 9-12 characters
    return 'text-3xl' // Small for longer text
  }

  const speakChinese = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.chinese)
      
      // Wait for voices to load if they haven't already
      const setVoiceAndSpeak = () => {
        const voices = speechSynthesis.getVoices()
        
        // Check if no voices are available at all
        if (voices.length === 0) {
          setShowTTSAlert(true)
          setTimeout(() => setShowTTSAlert(false), 5000)
          return
        }
        
        // Try to find Chinese voices in order of preference
        const chineseVoice = voices.find(v => 
          v.lang === "zh-CN" || 
          v.lang === "zh" || 
          v.lang.startsWith("zh-") ||
          v.name.toLowerCase().includes("chinese") ||
          v.name.toLowerCase().includes("mandarin")
        )
        
        if (chineseVoice) {
          utterance.voice = chineseVoice
          utterance.lang = chineseVoice.lang
          
          // Additional settings for better pronunciation
          utterance.rate = 0.6 // Slower for better pronunciation
          utterance.pitch = 1.0
          utterance.volume = 1.0
          
          speechSynthesis.speak(utterance)
        } else {
          // No Chinese voice found - show alert to recommend help
          setShowTTSAlert(true)
          // Auto-dismiss after 5 seconds
          setTimeout(() => setShowTTSAlert(false), 5000)
        }
      }
      
      // If voices are already loaded, use them immediately
      if (speechSynthesis.getVoices().length > 0) {
        setVoiceAndSpeak()
      } else {
        // Wait for voices to load (especially important on mobile)
        speechSynthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true })
        // Fallback timeout in case voiceschanged doesn't fire
        setTimeout(setVoiceAndSpeak, 100)
      }
    } else {
      // Speech synthesis not available
      setShowTTSAlert(true)
      setTimeout(() => setShowTTSAlert(false), 5000)
    }
  }

  return (
    <div
      className={`mb-6 backdrop-blur-lg ${themeStyles.glassBackgroundStrong} rounded-3xl ${themeStyles.glassBorderStrong} w-full max-w-4xl mx-auto`}
      style={{ 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))'
      }}
    >
      <div className="p-8 relative">
        {/* TTS Alert */}
        {showTTSAlert && (
          <Alert className="mb-4 border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              중국어 음성을 찾을 수 없습니다. 갤럭시 폰의 경우 설정에서 중국어를 추가해야 할 수 있습니다. 
              <Button
                variant="link"
                className="p-0 h-auto text-orange-800 dark:text-orange-300 underline ml-1"
                onClick={() => window.open('/help#galaxy-tts-guide', '_blank')}
              >
                도움말 보기
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Memorized Checkbox - Only show for authenticated users */}
        {!isLoading && vocabularyDataLength > 0 && isAuthenticated && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="memorized"
                checked={memorizedWords.has(currentWord.id)}
                onCheckedChange={() => toggleMemorized(currentWord.id)}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <Label
                htmlFor="memorized"
                className={`text-sm font-medium ${themeStyles.secondaryText} cursor-pointer`}
              >
                Memorized
              </Label>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center space-y-6 min-h-[300px] flex flex-col items-center justify-center">
            <div className={`text-2xl font-bold ${themeStyles.mainText} mb-4`}>Loading vocabulary data...</div>
            <div className={`${themeStyles.progressFill} h-2 w-24 rounded-full animate-pulse`}></div>
          </div>
        ) : vocabularyDataLength === 0 ? (
          <div className="text-center space-y-6 min-h-[300px] flex flex-col items-center justify-center">
            <div className={`text-2xl font-bold ${themeStyles.mainText} mb-4`}>
              {vocabularyDataLength === 0 ? "Failed to load vocabulary data" : "All words are memorized!"}
            </div>
            <div className={`text-lg ${themeStyles.secondaryText}`}>
              {vocabularyDataLength === 0 
                ? "Please check your connection and try again"
                : "Enable 'Show memorized words' in settings to see all words"
              }
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            {/* Chinese Characters */}
            <div className="relative">
              {showChinese ? (
                <div className="flex flex-col items-center">
                  <div className={`${getFontSizeForChinese(currentWord.chinese)} font-bold ${themeStyles.mainText} mb-2 whitespace-nowrap h-32`}>{currentWord.chinese}</div>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`m-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                    onClick={speakChinese}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 min-h-[120px]">
                  {chineseRevealed ? (
                    <div className="flex flex-col items-center">
                      <div className={`${getFontSizeForChinese(currentWord.chinese)} font-bold ${themeStyles.mainText} mb-2 whitespace-nowrap`}>{currentWord.chinese}</div>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`mt-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                        onClick={speakChinese}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleRevealChinese}
                      className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText} text-lg px-6 py-3`}
                    >
                      <Eye className="h-5 w-5" />
                      Show Chinese Characters
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Pinyin */}
            <div className="space-y-2">
              {showPinyin ? (
                <div className={`text-2xl ${themeStyles.secondaryText} font-medium`}>{currentWord.pinyin}</div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {pinyinRevealed ? (
                    <div className={`text-2xl ${themeStyles.secondaryText} font-medium`}>{currentWord.pinyin}</div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setPinyinRevealed(true)}
                      className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                    >
                      <Eye className="h-4 w-4" />
                      Show Pronunciation
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Korean Meaning */}
            <div className="space-y-2">
              {showKorean ? (
                <div className={`text-xl ${themeStyles.tertiaryText} font-medium`}>{currentWord.korean}</div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {koreanRevealed ? (
                    <div className={`text-xl ${themeStyles.tertiaryText} font-medium`}>{currentWord.korean}</div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setKoreanRevealed(true)}
                      className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                    >
                      <Eye className="h-4 w-4" />
                      Show Korean Meaning
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}