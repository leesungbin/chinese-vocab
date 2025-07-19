"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Eye, Volume2, Sun, Moon, Shuffle, Filter } from "lucide-react"
import {isNumber} from "node:util";

interface VocabItem {
  chinese: string
  pinyin: string
  korean: string
  id: number
  total?: number
  day?: number
}

// Function to fetch vocabulary data from Google Sheets
async function fetchVocabularyData(): Promise<VocabItem[]> {
  try {
    // Convert the Google Sheets URL to a format that allows CSV export
    const spreadsheetId = "1xMB3ileG-9-5ue9CIVvxQKPYSJehcWrV3m_lc4Y5Lkg";
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }

    const csvText = await response.text();

    // Parse CSV data
    const rows = csvText.split('\n');
    const headers = rows[0].split(',');

    // Find the indices of the required columns
    const chineseIndex = headers.findIndex(h => h.toLowerCase().includes('chinese'));
    const pinyinIndex = headers.findIndex(h => h.toLowerCase().includes('pinyin'));
    const koreanIndex = headers.findIndex(h => h.toLowerCase().includes('korean'));
    const totalIndex = headers.findIndex(h => h.toLowerCase().includes('total'));
    const dayIndex = headers.findIndex(h => h.toLowerCase().includes('day'));

    // Parse the data rows
    return rows.slice(1)
      .filter(row => row.trim() !== '')
      .map((row, index) => {
        const columns = row.split(',');
        return {
          id: index + 1,
          chinese: columns[chineseIndex]?.trim() || '',
          pinyin: columns[pinyinIndex]?.trim() || '',
          korean: columns[koreanIndex]?.trim() || '',
          total: totalIndex >= 0 ? parseInt(columns[totalIndex]?.trim() || '0') : 0,
          day: dayIndex >= 0 ? parseInt(columns[dayIndex]?.trim() || '0') : 0
        };
      });
  } catch (error) {
    console.error('Error fetching vocabulary data:', error);
    return [];
  }
}

const fallbackVocabularyData: VocabItem[] = [];

export default function Component() {
  const [vocabularyData, setVocabularyData] = useState<VocabItem[]>(fallbackVocabularyData);
  const [originalData, setOriginalData] = useState<VocabItem[]>(fallbackVocabularyData);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [availableDays, setAvailableDays] = useState<number[]>([]);

  // Fetch vocabulary data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchVocabularyData();
        if (data.length > 0) {
          setOriginalData(data);
          setVocabularyData(data);
          // Extract unique days from the data
          const days = [...new Set(data.map(item => item.day).filter(day => day && day > 0))].filter(e => typeof e === 'number').sort((a, b) => a - b);
          setAvailableDays(days);
        }
      } catch (error) {
        console.error('Failed to load vocabulary data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  const [showPinyin, setShowPinyin] = useState(false)
  const [showKorean, setShowKorean] = useState(false)
  const [pinyinRevealed, setPinyinRevealed] = useState(false)
  const [koreanRevealed, setKoreanRevealed] = useState(false)
  const [showChinese, setShowChinese] = useState(true)
  const [chineseRevealed, setChineseRevealed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [hasShownChinese, setHasShownChinese] = useState(false)

  // Get the current word or use a placeholder if data is still loading
  const currentWord = vocabularyData.length > 0 
    ? vocabularyData[currentIndex] 
    : { id: 0, chinese: "", pinyin: "", korean: "", total: 0, day: 0 };

  const nextWord = () => {
    if (vocabularyData.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % vocabularyData.length)
    setPinyinRevealed(false)
    setKoreanRevealed(false)
    setChineseRevealed(false)
    setHasShownChinese(false)
  }

  const prevWord = () => {
    if (vocabularyData.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + vocabularyData.length) % vocabularyData.length)
    setPinyinRevealed(false)
    setKoreanRevealed(false)
    setChineseRevealed(false)
    setHasShownChinese(false)
  }

  const shuffleWords = () => {
    if (vocabularyData.length === 0) return;
    const shuffled = [...vocabularyData].sort(() => Math.random() - 0.5);
    setVocabularyData(shuffled);
    setCurrentIndex(0);
    setIsShuffled(true);
    setPinyinRevealed(false);
    setKoreanRevealed(false);
    setChineseRevealed(false);
    setHasShownChinese(false);
  }

  const filterByDay = (day: number | null) => {
    setSelectedDay(day);
    setCurrentIndex(0);
    setPinyinRevealed(false);
    setKoreanRevealed(false);
    setChineseRevealed(false);
    setHasShownChinese(false);
    
    if (day === null) {
      // Show all words
      setVocabularyData(isShuffled ? [...originalData].sort(() => Math.random() - 0.5) : originalData);
    } else {
      // Filter by specific day
      const filtered = originalData.filter(item => item.day === day);
      setVocabularyData(isShuffled ? [...filtered].sort(() => Math.random() - 0.5) : filtered);
    }
  }

  const resetToOriginal = () => {
    setVocabularyData(originalData);
    setCurrentIndex(0);
    setIsShuffled(false);
    setSelectedDay(null);
    setPinyinRevealed(false);
    setKoreanRevealed(false);
    setChineseRevealed(false);
    setHasShownChinese(false);
  }

  const speakChinese = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.chinese);
      utterance.lang = "zh-CN";
      // Select an available Chinese-language voice if present
      const voices = speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.startsWith("zh"));
      if (zhVoice) {
        utterance.voice = zhVoice;
      }
      speechSynthesis.speak(utterance);
    }
  }

  const handleChineseShown = async () => {
    if (!hasShownChinese && currentWord.id > 0) {
      setHasShownChinese(true)
      // Update the local data to reflect the new total
      setVocabularyData(prev => prev.map(item => 
        item.id === currentWord.id 
          ? { ...item, total: (item.total || 0) + 1 }
          : item
      ))
    }
  }

  const handleRevealChinese = async () => {
    setChineseRevealed(true)
    await handleChineseShown()
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Handle automatic Chinese display when showChinese is true
  useEffect(() => {
    if (showChinese && !isLoading && vocabularyData.length > 0) {
      handleChineseShown()
    }
  }, [currentIndex, showChinese, isLoading, vocabularyData.length])

  // Theme-based styles
  const themeStyles = {
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

  return (
    <div
      className={`min-h-screen ${themeStyles.background} p-4 relative overflow-hidden transition-colors duration-300`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 ${themeStyles.decorativeBlur} rounded-full blur-3xl`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 ${themeStyles.decorativeBlur} rounded-full blur-3xl`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${themeStyles.decorativeBlurLight} rounded-full blur-3xl`}
        ></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header with theme toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className={`text-3xl font-bold ${themeStyles.mainText} mb-2`}>Chinese Vocabulary Practice</h1>
            <p className={themeStyles.secondaryText}>
              Practice Chinese characters with pronunciation and Korean meanings
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className={`ml-4 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Settings */}
        <div
          className={`mb-6 backdrop-blur-md ${themeStyles.glassBackground} rounded-2xl ${themeStyles.glassBorder} shadow-xl`}
        >
          <div className="p-6">
            <h3 className={`text-lg font-semibold ${themeStyles.mainText} mb-4`}>Display Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-chinese" className={`text-sm font-medium ${themeStyles.secondaryText}`}>
                  Always show Chinese characters
                </Label>
                <Switch id="show-chinese" checked={showChinese} onCheckedChange={setShowChinese} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-pinyin" className={`text-sm font-medium ${themeStyles.secondaryText}`}>
                  Always show pronunciation (Pinyin)
                </Label>
                <Switch id="show-pinyin" checked={showPinyin} onCheckedChange={setShowPinyin} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-korean" className={`text-sm font-medium ${themeStyles.secondaryText}`}>
                  Always show Korean meaning
                </Label>
                <Switch id="show-korean" checked={showKorean} onCheckedChange={setShowKorean} />
              </div>
            </div>
            
            <h3 className={`text-lg font-semibold ${themeStyles.mainText} mb-4 mt-6`}>Word Order & Filtering</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={shuffleWords}
                  disabled={vocabularyData.length === 0}
                  className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                >
                  <Shuffle className="h-4 w-4" />
                  Shuffle Words
                </Button>
                <Button
                  variant="outline"
                  onClick={resetToOriginal}
                  disabled={vocabularyData.length === 0 || (!isShuffled && selectedDay === null)}
                  className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                >
                  Reset Order
                </Button>
              </div>
              
              {availableDays.length > 0 && (
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${themeStyles.secondaryText}`}>
                    Filter by Day Group
                  </Label>
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
          </div>
        </div>

        {/* Main Vocabulary Card */}
        <div
          className={`mb-6 backdrop-blur-lg ${themeStyles.glassBackgroundStrong} rounded-3xl ${themeStyles.glassBorderStrong} shadow-2xl`}
        >
          <div className="p-8">
            {isLoading ? (
              <div className="text-center space-y-6 min-h-[300px] flex flex-col items-center justify-center">
                <div className={`text-2xl font-bold ${themeStyles.mainText} mb-4`}>Loading vocabulary data...</div>
                <div className={`${themeStyles.progressFill} h-2 w-24 rounded-full animate-pulse`}></div>
              </div>
            ) : vocabularyData.length === 0 ? (
              <div className="text-center space-y-6 min-h-[300px] flex flex-col items-center justify-center">
                <div className={`text-2xl font-bold ${themeStyles.mainText} mb-4`}>
                  Failed to load vocabulary data
                </div>
                <div className={`text-lg ${themeStyles.secondaryText}`}>
                  Please check your connection and try again
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                {/* Chinese Characters */}
                <div className="relative">
                  {showChinese ? (
                    <>
                      <div className={`text-8xl font-bold ${themeStyles.mainText} mb-4`}>{currentWord.chinese}</div>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`absolute top-0 right-0 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                        onClick={speakChinese}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 min-h-[120px]">
                      {chineseRevealed ? (
                        <>
                          <div className={`text-8xl font-bold ${themeStyles.mainText} mb-4`}>{currentWord.chinese}</div>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                            onClick={speakChinese}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </>
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

        {/* Navigation */}
        {!isLoading && vocabularyData.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={prevWord}
                className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div
                className={`text-sm ${themeStyles.secondaryText} backdrop-blur-md ${themeStyles.glassBackground} px-4 py-2 rounded-full ${themeStyles.glassBorder}`}
              >
                {currentIndex + 1} of {vocabularyData.length}
              </div>

              <Button
                variant="outline"
                onClick={nextWord}
                className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div
              className={`backdrop-blur-md ${themeStyles.glassBackground} rounded-full h-3 ${themeStyles.glassBorder} overflow-hidden`}
            >
              <div
                className={`${themeStyles.progressFill} h-full rounded-full transition-all duration-300`}
                style={{ width: `${((currentIndex + 1) / vocabularyData.length) * 100}%` }}
              ></div>
            </div>
          </>
        )}

        {/* Loading Progress Bar */}
        {isLoading && (
          <div
            className={`backdrop-blur-md ${themeStyles.glassBackground} rounded-full h-3 ${themeStyles.glassBorder} overflow-hidden`}
          >
            <div
              className={`${themeStyles.progressFill} h-full rounded-full animate-pulse`}
              style={{ width: '30%' }}
            ></div>
          </div>
        )}
      </div>
    </div>
  )
}
