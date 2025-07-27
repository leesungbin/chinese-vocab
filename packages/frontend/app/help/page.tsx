'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Smartphone, Settings, Globe, Volume2, CheckCircle, Eye, Navigation, Users, BookOpen, HelpCircle, Play, Home } from 'lucide-react'
import { useThemeStyles } from '@/stores/themeStore'
import { useTranslation } from '@/hooks/useTranslation'

function HelpPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const themeStyles = useThemeStyles()
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // Scroll to anchor on page load
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const element = document.getElementById(hash.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  const galaxySteps = [
    {
      title: t('help.galaxyGuide.step1.title'),
      description: t('help.galaxyGuide.step1.description'),
      icon: <Settings className="h-6 w-6" />,
      details: t('help.galaxyGuide.step1.details'),
    },
    {
      title: t('help.galaxyGuide.step2.title'),
      description: t('help.galaxyGuide.step2.description'),
      icon: <Globe className="h-6 w-6" />,
      details: t('help.galaxyGuide.step2.details'),
    },
    {
      title: t('help.galaxyGuide.step3.title'),
      description: t('help.galaxyGuide.step3.description'),
      icon: <Smartphone className="h-6 w-6" />,
      details: t('help.galaxyGuide.step3.details'),
    },
    {
      title: t('help.galaxyGuide.step4.title'),
      description: t('help.galaxyGuide.step4.description'),
      icon: <Volume2 className="h-6 w-6" />,
      details: t('help.galaxyGuide.step4.details'),
    }
  ]

  return (
    <div className={`min-h-screen ${themeStyles.background} p-4`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/')}
            className={`backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className={`text-3xl font-bold ${themeStyles.mainText}`}>
            {t('help.title')}
          </h1>
        </div>

        {/* Table of Contents */}
        <Card className={`backdrop-blur-lg ${themeStyles.glassBackgroundStrong} border-0`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${themeStyles.mainText}`}>
              <BookOpen className="h-5 w-5" />
              {t('navigation.tableOfContents')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <a 
                href="#getting-started" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:${themeStyles.glassBackground} transition-colors ${themeStyles.mainText}`}
              >
                <Play className="h-4 w-4" />
                {t('help.gettingStarted')}
              </a>
              <a 
                href="#basic-usage" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:${themeStyles.glassBackground} transition-colors ${themeStyles.mainText}`}
              >
                <Eye className="h-4 w-4" />
                {t('help.basicUsage')}
              </a>
              <a 
                href="#navigation" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:${themeStyles.glassBackground} transition-colors ${themeStyles.mainText}`}
              >
                <Navigation className="h-4 w-4" />
                {t('help.navigation')}
              </a>
              <a 
                href="#authentication" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:${themeStyles.glassBackground} transition-colors ${themeStyles.mainText}`}
              >
                <Users className="h-4 w-4" />
                {t('help.authentication')}
              </a>
              <a 
                href="#galaxy-tts-guide" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:${themeStyles.glassBackground} transition-colors ${themeStyles.mainText} border-l-4 border-orange-500`}
              >
                <Smartphone className="h-4 w-4" />
                {t('help.galaxyTtsGuide')}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <section id="getting-started">
          <Card className={`backdrop-blur-lg ${themeStyles.glassBackgroundStrong} border-0`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${themeStyles.mainText}`}>
                <Play className="h-5 w-5" />
                {t('help.gettingStarted')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={themeStyles.mainText}>
                {t('help.welcomeMessage')}
              </p>
              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('help.noLoginRequired')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>

        {/* Basic Usage */}
        <section id="basic-usage">
          <Card className={`backdrop-blur-lg ${themeStyles.glassBackgroundStrong} border-0`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${themeStyles.mainText}`}>
                <Eye className="h-5 w-5" />
                {t('help.basicUsage')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>{t('help.viewWords')}</h4>
                  <p className={themeStyles.secondaryText}>
                    {t('help.viewWordsDesc')}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>{t('help.listenPronunciation')}</h4>
                  <p className={themeStyles.secondaryText}>
                    {t('help.listenPronunciationDesc')}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>{t('help.markMemorized')}</h4>
                  <p className={themeStyles.secondaryText}>
                    {t('help.markMemorizedDesc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Navigation */}
        <section id="navigation">
          <Card className={`backdrop-blur-lg ${themeStyles.glassBackgroundStrong} border-0`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${themeStyles.mainText}`}>
                <Navigation className="h-5 w-5" />
                {t('help.navigation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>{t('help.navigationButtons')}</h4>
                  <p className={themeStyles.secondaryText}>
                    {t('help.navigationButtonsDesc')}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>{t('help.shuffleWords')}</h4>
                  <p className={themeStyles.secondaryText}>{t('help.shuffleWordsDesc')}</p>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>{t('help.dayFilter')}</h4>
                  <p className={themeStyles.secondaryText}>{t('help.dayFilterDesc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Authentication */}
        <section id="authentication">
          <Card className={`backdrop-blur-lg ${themeStyles.glassBackgroundStrong} border-0`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${themeStyles.mainText}`}>
                <Users className="h-5 w-5" />
                {t('help.authentication')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  {t('help.saveProgress')}
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>{t('help.googleLogin')}</h4>
                  <p className={themeStyles.secondaryText}>{t('help.googleLoginDesc')}</p>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>{t('help.personalSheet')}</h4>
                  <p className={themeStyles.secondaryText}>
                    {t('help.personalSheetDesc')}
                  </p>
                  <div className={`mt-2 p-2 rounded bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800`}>
                    <p className={`text-sm ${themeStyles.mainText}`}>
                      📋 <strong>{t('help.autoCreationProcessTitle')}:</strong> {t('help.autoCreationProcess')}
                    </p>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>{t('help.permissionRequest')}</h4>
                  <p className={themeStyles.secondaryText}>
                    {t('help.permissionRequestDesc')}
                  </p>
                  <ul className={`list-disc list-inside mt-2 space-y-1 ${themeStyles.secondaryText} text-sm`}>
                    <li><strong>Google Sheets:</strong> {t('help.sheetsPermission')}</li>
                    <li><strong>Google Drive:</strong> {t('help.drivePermission')}</li>
                  </ul>
                  <div className={`mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800`}>
                    <p className={`text-sm ${themeStyles.mainText}`}>
                      <span role="img" aria-label="lock">🔒</span> <strong>{t('help.privacyProtection')}</strong>
                    </p>
                    <ul className={`list-disc list-inside mt-1 space-y-1 text-sm ${themeStyles.secondaryText}`}>
                      <li>{t('help.privacyPoints.0')}</li>
                      <li>{t('help.privacyPoints.1')}</li>
                      <li>{t('help.privacyPoints.2')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Galaxy TTS Guide */}
        <section id="galaxy-tts-guide">
          <Card className={`backdrop-blur-lg ${themeStyles.glassBackgroundStrong} border-0 border-l-4 border-orange-500`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${themeStyles.mainText}`}>
                <Smartphone className="h-5 w-5" />
                {t('help.galaxyTtsGuide')}
              </CardTitle>
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  {t('help.galaxyTts.requirement')}
                </AlertDescription>
              </Alert>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Progress indicator */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i + 1 <= currentStep 
                        ? 'bg-blue-500' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Current step */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                    {galaxySteps[currentStep - 1].icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-lg ${themeStyles.mainText}`}>
                      {t('help.galaxyGuide.step')} {currentStep}: {galaxySteps[currentStep - 1].title}
                    </h3>
                    <p className={`${themeStyles.secondaryText}`}>
                      {galaxySteps[currentStep - 1].description}
                    </p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <p className={`text-sm ${themeStyles.mainText}`}>
                    💡 <strong>{t('help.title')}:</strong> {galaxySteps[currentStep - 1].details}
                  </p>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className={`backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                >
                  {t('common.previous')}
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {t('common.next')}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      const element = document.getElementById('getting-started')
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' })
                      }
                    }} 
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('help.finish')}
                  </Button>
                )}
              </div>

              {/* All steps overview */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className={`font-semibold mb-4 ${themeStyles.mainText}`}>{t('help.overview')}</h4>
                <div className="space-y-3">
                  {galaxySteps.map((step, index) => (
                    <div 
                      key={index}
                      className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        index + 1 === currentStep 
                          ? `${themeStyles.glassBackground} ${themeStyles.glassBorder}` 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setCurrentStep(index + 1)}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                        index + 1 <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className={`font-medium ${themeStyles.mainText}`}>{step.title}</p>
                        <p className={`text-sm ${themeStyles.secondaryText}`}>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('help.galaxyGuide.completionNote')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>

        {/* Back to top */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
          >
            <Home className="h-4 w-4 mr-2" />
            {t('common.topOfPage')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function HelpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HelpPageContent />
    </Suspense>
  )
}