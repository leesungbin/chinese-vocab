'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NavigationBar } from '@/components/navigation/NavigationBar'
import { useThemeStyles } from '@/stores/themeStore'

export function PrivacyPolicyContent() {
  const themeStyles = useThemeStyles()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={`min-h-screen ${themeStyles.background} flex flex-col`}>
      {/* Navigation Bar */}
      <NavigationBar showHomeButton={true} />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`backdrop-blur-md ${themeStyles.glassBackground} rounded-2xl ${themeStyles.glassBorder} shadow-sm p-8`}
          >
            <h1 className={`text-3xl font-bold ${themeStyles.mainText} mb-8`}>
              Privacy Policy
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className={`text-sm ${themeStyles.secondaryText} mb-6`}>
                <strong>Effective Date:</strong>{' '}
                {mounted ? new Date().toLocaleDateString() : 'July 28, 2025'}
              </p>

              <section className="mb-8">
                <h2
                  className={`text-2xl font-semibold ${themeStyles.mainText} mb-4`}
                >
                  1. Introduction
                </h2>
                <p className={`${themeStyles.secondaryText} mb-4`}>
                  Welcome to the Chinese Vocabulary Learning App ("we," "our,"
                  or "us"). This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you use our web
                  application and services.
                </p>
                <p className={themeStyles.secondaryText}>
                  By using our service, you agree to the collection and use of
                  information in accordance with this policy.
                </p>
              </section>

              <section className="mb-8">
                <h2
                  className={`text-2xl font-semibold ${themeStyles.mainText} mb-4`}
                >
                  2. Information We Collect
                </h2>

                <h3
                  className={`text-xl font-medium ${themeStyles.mainText} mb-3`}
                >
                  2.1 Information You Provide
                </h3>
                <ul
                  className={`list-disc list-inside ${themeStyles.secondaryText} mb-4 space-y-2`}
                >
                  <li>
                    Google account information (name, email address, profile
                    picture) when you sign in
                  </li>
                  <li>Vocabulary learning progress and preferences</li>
                  <li>Settings and configuration choices</li>
                </ul>

                <h3
                  className={`text-xl font-medium ${themeStyles.mainText} mb-3`}
                >
                  2.2 Automatically Collected Information
                </h3>
                <ul
                  className={`list-disc list-inside ${themeStyles.secondaryText} mb-4 space-y-2`}
                >
                  <li>Usage data and application performance metrics</li>
                  <li>Device information and browser type</li>
                  <li>IP address and general location information</li>
                  <li>Session data and authentication tokens</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2
                  className={`text-2xl font-semibold ${themeStyles.mainText} mb-4`}
                >
                  3. How We Use Your Information
                </h2>
                <p className={`${themeStyles.secondaryText} mb-4`}>
                  We use the collected information for the following purposes:
                </p>
                <ul
                  className={`list-disc list-inside ${themeStyles.secondaryText} space-y-2`}
                >
                  <li>Provide and maintain our vocabulary learning service</li>
                  <li>Authenticate users and manage user accounts</li>
                  <li>
                    Create and manage personalized Google Sheets for vocabulary
                    tracking
                  </li>
                  <li>Save and sync your learning progress across sessions</li>
                  <li>
                    Improve our application's functionality and user experience
                  </li>
                  <li>Respond to user support requests and feedback</li>
                  <li>
                    Ensure application security and prevent unauthorized access
                  </li>
                </ul>
              </section>

              {/* Continue with remaining sections... */}
              <div className={`border-t ${themeStyles.glassBorder} pt-6 mt-8`}>
                <p className={`text-sm ${themeStyles.secondaryText}`}>
                  This Privacy Policy was last updated on{' '}
                  {mounted ? new Date().toLocaleDateString() : 'July 28, 2025'}.
                  By using our Chinese Vocabulary Learning App, you acknowledge
                  that you have read and understood this Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
