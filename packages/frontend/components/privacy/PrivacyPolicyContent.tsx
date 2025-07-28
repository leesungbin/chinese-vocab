'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { NavigationBar } from '@/components/navigation/NavigationBar'
import { useThemeStyles } from '@/stores/themeStore'
import { useLanguageStore } from '@/stores/languageStore'

export function PrivacyPolicyContent() {
  const themeStyles = useThemeStyles()
  const language = useLanguageStore(state => state.language)
  const [mounted, setMounted] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadMarkdown = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/content/privacy-policy/${language}.md`)
        if (response.ok) {
          const content = await response.text()
          setMarkdownContent(content)
        } else {
          // Fallback to English if language file not found
          const fallbackResponse = await fetch('/content/privacy-policy/en.md')
          if (fallbackResponse.ok) {
            const content = await fallbackResponse.text()
            setMarkdownContent(content)
          }
        }
      } catch (error) {
        console.error('Error loading privacy policy:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMarkdown()
  }, [language])

  return (
    <div className={`min-h-screen ${themeStyles.background} flex flex-col`}>
      {/* Navigation Bar */}
      <NavigationBar showHomeButton={true} />

      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div
            className={`backdrop-blur-lg ${themeStyles.glassBackgroundStrong} border-0 rounded-2xl p-8`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <span className={`ml-3 ${themeStyles.mainText}`}>
                  Loading...
                </span>
              </div>
            ) : (
              <div className="prose prose-gray max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1
                        className={`text-3xl font-bold ${themeStyles.mainText} mb-8`}
                      >
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2
                        className={`text-2xl font-semibold ${themeStyles.mainText} mb-4 mt-8`}
                      >
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3
                        className={`text-xl font-medium ${themeStyles.mainText} mb-3 mt-6`}
                      >
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className={`${themeStyles.secondaryText} mb-4`}>
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul
                        className={`list-disc list-inside ${themeStyles.secondaryText} mb-4 space-y-2`}
                      >
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className={themeStyles.secondaryText}>{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className={themeStyles.mainText}>
                        {children}
                      </strong>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    hr: () => (
                      <hr
                        className={`border-t ${themeStyles.glassBorder} my-8`}
                      />
                    ),
                  }}
                >
                  {markdownContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
