import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Shuffle, Download, Loader2, ExternalLink, Plus, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { vocabularyService } from "@/utils/vocabularyService"

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
  onMigrateData?: (spreadsheetId?: string) => Promise<void>
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
  themeStyles,
  onMigrateData
}: SettingsModalProps) {
  
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [isMigrating, setIsMigrating] = useState(false)
  const [isLoadingSpreadsheetId, setIsLoadingSpreadsheetId] = useState(false)
  const [isCreatingSpreadsheet, setIsCreatingSpreadsheet] = useState(false)
  const [hasTriedAutoCreate, setHasTriedAutoCreate] = useState(false)
  const [createSpreadsheetError, setCreateSpreadsheetError] = useState<string | null>(null)

  const handleResetMemorizedWords = () => {
    resetAllMemorizedWords()
    resetRevealStates()
  }

  const getErrorMessage = (error: string): { title: string; message: string; suggestion: string } => {
    if (error.includes('Drive storage quota has been exceeded')) {
      return {
        title: 'Google Drive Storage Full',
        message: 'Your Google Drive storage is full and cannot create new files.',
        suggestion: 'Please free up space in your Google Drive or upgrade your storage plan, then try again.'
      }
    }
    
    if (error.includes('permission') || error.includes('Permission')) {
      return {
        title: 'Permission Error',
        message: 'Unable to create spreadsheet due to permission restrictions.',
        suggestion: 'Please check your Google account permissions and try again.'
      }
    }
    
    if (error.includes('quota') || error.includes('Quota')) {
      return {
        title: 'API Quota Exceeded',
        message: 'Google Sheets API quota has been exceeded.',
        suggestion: 'Please try again later or contact support if the issue persists.'
      }
    }
    
    if (error.includes('network') || error.includes('Network') || error.includes('Failed to fetch')) {
      return {
        title: 'Network Error',
        message: 'Unable to connect to Google Sheets service.',
        suggestion: 'Please check your internet connection and try again.'
      }
    }
    
    // Default error message
    return {
      title: 'Spreadsheet Creation Failed',
      message: 'An unexpected error occurred while creating your personal Google Sheet.',
      suggestion: 'You can manually enter your Google Sheets ID below or try again later.'
    }
  }

  // Load user's current spreadsheet ID when modal opens, and auto-create if needed
  useEffect(() => {
    const loadSpreadsheetId = async () => {
      if (settingsOpen && !spreadsheetId && !hasTriedAutoCreate) {
        setIsLoadingSpreadsheetId(true)
        try {
          const result = await vocabularyService.getUserSpreadsheetId()
          if (result.success && result.spreadsheetId) {
            setSpreadsheetId(result.spreadsheetId)
            setHasTriedAutoCreate(true)
          } else {
            // No existing spreadsheet - check if user is authenticated
            const token = localStorage.getItem('auth-token')
            if (token && !hasTriedAutoCreate) {
              // User is authenticated but has no spreadsheet - auto-create one
              setIsLoadingSpreadsheetId(false)
              try {
                await handleCreateSpreadsheet()
              } catch (error) {
                console.error('Auto-create spreadsheet failed:', error)
              }
              return
            }
          }
        } catch (error) {
          console.error('Failed to load spreadsheet ID:', error)
        } finally {
          setIsLoadingSpreadsheetId(false)
        }
      }
    }

    loadSpreadsheetId()
  }, [settingsOpen, spreadsheetId, hasTriedAutoCreate])

  const handleMigrateData = async () => {
    if (!onMigrateData) return
    
    setIsMigrating(true)
    try {
      await onMigrateData(spreadsheetId.trim() || undefined)
      setSpreadsheetId('')
    } catch (error) {
      console.error('Migration failed:', error)
    } finally {
      setIsMigrating(false)
    }
  }

  const handleCreateSpreadsheet = async () => {
    setIsCreatingSpreadsheet(true)
    setCreateSpreadsheetError(null) // Clear any previous errors
    
    try {
      const result = await vocabularyService.createUserSpreadsheet()
      
      if (result.success && result.spreadsheetId) {
        setSpreadsheetId(result.spreadsheetId)
        setHasTriedAutoCreate(true)
        setCreateSpreadsheetError(null) // Clear any errors on success
        
        // Show success message if it's a new sheet
        if (result.isNew) {
          console.log('Successfully created your personal Google Sheet!')
        }
      } else {
        // Handle API errors
        const errorMessage = result.error || 'Unknown error occurred'
        setCreateSpreadsheetError(errorMessage)
        setHasTriedAutoCreate(true)
        console.error('Failed to create spreadsheet:', errorMessage)
      }
    } catch (error) {
      // Handle network/unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred'
      setCreateSpreadsheetError(errorMessage)
      setHasTriedAutoCreate(true)
      console.error('Error creating spreadsheet:', error)
    } finally {
      setIsCreatingSpreadsheet(false)
    }
  }

  const handleGoToGoogleSheet = () => {
    const currentSpreadsheetId = spreadsheetId.trim()
    if (currentSpreadsheetId) {
      // Open user's specific Google Sheet
      window.open(`https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}/edit`, '_blank')
    } else {
      // If no spreadsheet ID, show a message or use default anonymous sheet
      // Using the anonymous sheet ID as fallback
      const anonymousSheetId = '1JBGAlJ14-yKHoSNlVnogCT4Xj30SLS_jQNuZe5YLe0I'
      window.open(`https://docs.google.com/spreadsheets/d/${anonymousSheetId}/edit`, '_blank')
    }
  }

  if (!settingsOpen) return null

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-start justify-center bg-black bg-opacity-50 overflow-y-auto min-h-screen w-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 w-full max-w-md mx-4 my-4 md:my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${themeStyles.mainText}`}>Settings</h2>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(false)} aria-label="Close settings">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Error Dialog for Spreadsheet Creation */}
        {createSpreadsheetError && (
          <Alert className="mb-6 border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold">
                  {getErrorMessage(createSpreadsheetError).title}
                </div>
                <div>
                  {getErrorMessage(createSpreadsheetError).message}
                </div>
                <div className="text-sm opacity-90">
                  {getErrorMessage(createSpreadsheetError).suggestion}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateSpreadsheetError(null)}
                  className="mt-2 h-7 text-xs border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

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
                  variant="outline"
                  size="sm"
                  onClick={() => filterByDay(null)}
                  className={`backdrop-blur-md ${themeStyles.buttonGlass} ${selectedDay === null ? 'border-2 border-blue-500 text-black dark:text-white' : themeStyles.glassBorderStrong + ' ' + themeStyles.mainText} ${themeStyles.buttonGlassHover}`}
                >
                  All Days
                </Button>
                {availableDays.map(day => (
                  <Button
                    key={day}
                    variant="outline"
                    size="sm"
                    onClick={() => filterByDay(day)}
                    className={`backdrop-blur-md ${themeStyles.buttonGlass} ${selectedDay === day ? 'border-2 border-blue-500 text-black dark:text-white' : themeStyles.glassBorderStrong + ' ' + themeStyles.mainText} ${themeStyles.buttonGlassHover}`}
                  >
                    Day {day}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Migration Section */}
        {onMigrateData && (
          <>
            <h3 className={`text-lg font-semibold ${themeStyles.mainText} mb-4 mt-6`}>Data Migration</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="spreadsheet-id" className={`text-sm font-medium ${themeStyles.secondaryText} mb-2 block`}>
                  {isCreatingSpreadsheet ? "Creating your personal Google Sheet..." : "Google Sheets ID (optional - uses default if empty)"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="spreadsheet-id"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder={
                      isCreatingSpreadsheet ? "Creating your personal sheet..." : 
                      isLoadingSpreadsheetId ? "Loading..." : 
                      "Enter Google Sheets ID"
                    }
                    disabled={isMigrating || isLoadingSpreadsheetId || isCreatingSpreadsheet}
                    className={`flex-1 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.mainText}`}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleGoToGoogleSheet}
                    disabled={isMigrating || isLoadingSpreadsheetId || isCreatingSpreadsheet}
                    className={`backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                    aria-label="Open Google Sheet"
                    title="Open Google Sheet in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Show create button if authenticated user has no spreadsheet and auto-create failed/not tried */}
              {!spreadsheetId && hasTriedAutoCreate && !isCreatingSpreadsheet && localStorage.getItem('auth-token') && (
                <Button
                  onClick={handleCreateSpreadsheet}
                  disabled={isCreatingSpreadsheet}
                  className={`w-full gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                >
                  <Plus className="h-4 w-4" />
                  Create Personal Google Sheet
                </Button>
              )}
              <Button
                onClick={handleMigrateData}
                disabled={isMigrating}
                className={`w-full gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Migrating data...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Load data from Google Sheets
                  </>
                )}
              </Button>
            </div>
          </>
        )}

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