'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Smartphone, Settings, Globe, Volume2, CheckCircle, Eye, Navigation, Users, BookOpen, HelpCircle, Play, Home } from 'lucide-react'
import { useThemeStyles } from '@/stores/themeStore'

export default function HelpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const themeStyles = useThemeStyles()
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
      title: "갤럭시 설정 앱 열기",
      description: "홈 화면에서 설정(⚙️) 앱을 찾아 터치합니다.",
      icon: <Settings className="h-6 w-6" />,
      details: "설정 앱은 보통 앱 드로어나 홈 화면에 있습니다."
    },
    {
      title: "일반 관리 → 언어 및 입력",
      description: "설정에서 '일반 관리'를 찾아 터치한 후, '언어 및 입력'을 선택합니다.",
      icon: <Globe className="h-6 w-6" />,
      details: "기기에 따라 '일반' 또는 '언어 및 지역' 메뉴일 수 있습니다."
    },
    {
      title: "언어 추가하기",
      description: "언어 목록에서 '언어 추가' 또는 '+' 버튼을 터치합니다.",
      icon: <Smartphone className="h-6 w-6" />,
      details: "현재 한국어가 설정되어 있는지 확인하세요."
    },
    {
      title: "중국어(간체) 추가",
      description: "언어 목록에서 '中文(简体)' 또는 '중국어(간체, 중국)'을 찾아 추가합니다.",
      icon: <Volume2 className="h-6 w-6" />,
      details: "추가 후 언어 목록에 한국어와 중국어(간체)가 모두 표시되어야 합니다."
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
            도움말
          </h1>
        </div>

        {/* Table of Contents */}
        <Card className={`backdrop-blur-lg ${themeStyles.glassBackgroundStrong} border-0`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${themeStyles.mainText}`}>
              <BookOpen className="h-5 w-5" />
              목차
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <a 
                href="#getting-started" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:${themeStyles.glassBackground} transition-colors ${themeStyles.mainText}`}
              >
                <Play className="h-4 w-4" />
                시작하기
              </a>
              <a 
                href="#basic-usage" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:${themeStyles.glassBackground} transition-colors ${themeStyles.mainText}`}
              >
                <Eye className="h-4 w-4" />
                기본 사용법
              </a>
              <a 
                href="#navigation" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:${themeStyles.glassBackground} transition-colors ${themeStyles.mainText}`}
              >
                <Navigation className="h-4 w-4" />
                단어 탐색하기
              </a>
              <a 
                href="#authentication" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:${themeStyles.glassBackground} transition-colors ${themeStyles.mainText}`}
              >
                <Users className="h-4 w-4" />
                로그인 및 진도 저장
              </a>
              <a 
                href="#galaxy-tts-guide" 
                className={`flex items-center gap-3 p-3 rounded-lg hover:${themeStyles.glassBackground} transition-colors ${themeStyles.mainText} border-l-4 border-orange-500`}
              >
                <Smartphone className="h-4 w-4" />
                갤럭시 중국어 음성 설정 (필독!)
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
                시작하기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={themeStyles.mainText}>
                중국어 단어 암기장에 오신 것을 환영합니다! 이 앱은 중국어 단어 학습을 도와주는 플래시카드 앱입니다.
              </p>
              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertDescription>
                  로그인 없이도 바로 학습을 시작할 수 있습니다. Google 로그인을 하면 학습 진도를 저장할 수 있어요.
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
                기본 사용법
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>단어 보기</h4>
                  <p className={themeStyles.secondaryText}>
                    "Show Chinese Characters" 버튼을 클릭하여 한자를 확인하세요.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>발음 듣기</h4>
                  <p className={themeStyles.secondaryText}>
                    스피커 버튼(🔊)을 클릭하면 중국어 발음을 들을 수 있습니다.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>암기 표시</h4>
                  <p className={themeStyles.secondaryText}>
                    체크박스를 클릭하여 암기한 단어를 표시할 수 있습니다. (로그인 필요)
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
                단어 탐색하기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>이전/다음 버튼</h4>
                  <p className={themeStyles.secondaryText}>
                    화면 하단의 이전/다음 버튼으로 단어를 탐색할 수 있습니다.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>단어 섞기</h4>
                  <p className={themeStyles.secondaryText}>
                    "Shuffle Words" 버튼으로 단어 순서를 랜덤하게 섞을 수 있습니다.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>일차별 필터</h4>
                  <p className={themeStyles.secondaryText}>
                    특정 일차의 단어만 학습하고 싶다면 Day 필터를 사용하세요.
                  </p>
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
                로그인 및 진도 저장
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  Google 계정으로 로그인하면 학습 진도와 암기한 단어가 자동으로 저장됩니다.
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>Google 로그인</h4>
                  <p className={themeStyles.secondaryText}>
                    화면 우상단의 "Sign in with Google" 버튼을 클릭하세요.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>개인 단어장 생성</h4>
                  <p className={themeStyles.secondaryText}>
                    로그인 후 설정 페이지에 처음 접근하면 개인 Google Sheets가 자동으로 생성됩니다.
                  </p>
                  <div className={`mt-2 p-2 rounded bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800`}>
                    <p className={`text-sm ${themeStyles.mainText}`}>
                      📋 <strong>자동 생성 과정:</strong> 로그인 → 설정 페이지 방문 → Google Sheets 자동 생성 → 단어 데이터 동기화
                    </p>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <h4 className={`font-semibold ${themeStyles.mainText} mb-2`}>권한 요청 안내</h4>
                  <p className={themeStyles.secondaryText}>
                    로그인 시 Google Sheets와 Google Drive 권한을 요청하는 이유:
                  </p>
                  <ul className={`list-disc list-inside mt-2 space-y-1 ${themeStyles.secondaryText} text-sm`}>
                    <li><strong>Google Sheets:</strong> 설정에 지정된 시트에서 단어 데이터를 가져와 앱의 데이터베이스로 옮기기 위해</li>
                    <li><strong>Google Drive:</strong> 지정된 시트 파일에 안전하게 접근하기 위해</li>
                  </ul>
                  <div className={`mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800`}>
                    <p className={`text-sm ${themeStyles.mainText} font-medium`}>
                      🔒 <strong>개인정보 보호:</strong>
                    </p>
                    <ul className={`list-disc list-inside mt-1 space-y-1 text-sm ${themeStyles.secondaryText}`}>
                      <li>설정에서 지정한 Google Sheet ID의 파일에만 접근합니다</li>
                      <li>다른 Google Drive 파일이나 시트에는 접근하지 않습니다</li>
                      <li>모든 데이터는 개인 Google 계정 내에서만 처리됩니다</li>
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
                갤럭시 중국어 음성 설정 가이드
              </CardTitle>
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  갤럭시 폰에서 중국어 발음이 제대로 작동하려면 중국어 언어팩이 설치되어 있어야 합니다.
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
                      단계 {currentStep}: {galaxySteps[currentStep - 1].title}
                    </h3>
                    <p className={`${themeStyles.secondaryText}`}>
                      {galaxySteps[currentStep - 1].description}
                    </p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}>
                  <p className={`text-sm ${themeStyles.mainText}`}>
                    💡 <strong>도움말:</strong> {galaxySteps[currentStep - 1].details}
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
                  이전
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    다음
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
                    완료
                  </Button>
                )}
              </div>

              {/* All steps overview */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className={`font-semibold mb-4 ${themeStyles.mainText}`}>전체 과정 요약:</h4>
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
                  설정 완료 후에는 앱을 다시 시작하면 중국어 발음이 정상적으로 작동합니다.
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
            맨 위로
          </Button>
        </div>
      </div>
    </div>
  )
}