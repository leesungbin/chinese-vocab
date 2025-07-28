import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy - Chinese Vocabulary Learning App',
  description:
    'Privacy policy for the Chinese Vocabulary Learning App detailing how we collect, use, and protect your data.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-8">
          {/* Back to Main Link */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Main Page
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 mb-4">
                Welcome to the Chinese Vocabulary Learning App ("we," "our," or
                "us"). This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our web
                application and services.
              </p>
              <p className="text-gray-700">
                By using our service, you agree to the collection and use of
                information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.1 Information You Provide
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>
                  Google account information (name, email address, profile
                  picture) when you sign in
                </li>
                <li>Vocabulary learning progress and preferences</li>
                <li>Settings and configuration choices</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.2 Automatically Collected Information
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Usage data and application performance metrics</li>
                <li>Device information and browser type</li>
                <li>IP address and general location information</li>
                <li>Session data and authentication tokens</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
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

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Google API Services
              </h2>
              <p className="text-gray-700 mb-4">
                Our application integrates with Google API services to provide
                enhanced functionality:
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                4.1 Google OAuth 2.0
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>We use Google OAuth 2.0 for secure user authentication</li>
                <li>
                  We request minimal necessary scopes: profile, email,
                  drive.file, and spreadsheets
                </li>
                <li>
                  Access tokens are used only for authorized API operations
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                4.2 Google Drive and Sheets API
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>
                  We create Google Sheets in your personal Google Drive for
                  vocabulary tracking
                </li>
                <li>
                  We only access files created by our application (using
                  drive.file scope)
                </li>
                <li>
                  You maintain full ownership and control of your Google Sheets
                </li>
                <li>
                  You can revoke access at any time through your Google Account
                  settings
                </li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Important:</strong> Our application's use of
                  information received from Google APIs adheres to the
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    className="underline text-blue-600 hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Storage and Security
              </h2>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                5.1 Data Storage
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>
                  User data is stored securely using AWS DynamoDB and AWS Lambda
                </li>
                <li>
                  Authentication tokens are stored locally in your browser
                </li>
                <li>
                  Vocabulary data is stored both in our database and your
                  personal Google Sheets
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                5.2 Security Measures
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>All data transmission is encrypted using HTTPS/TLS</li>
                <li>JWT tokens are used for secure session management</li>
                <li>
                  OAuth tokens are stored securely and transmitted over
                  encrypted connections
                </li>
                <li>
                  We implement industry-standard security practices for data
                  protection
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Data Sharing and Disclosure
              </h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties, except in the following
                circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or court orders</li>
                <li>
                  To protect our rights, property, and safety, or that of our
                  users
                </li>
                <li>
                  In connection with Google API services as described in this
                  policy
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Your Rights and Choices
              </h2>
              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal
                information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Access:</strong> Request information about the data we
                  have collected about you
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete data
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  data (subject to legal requirements)
                </li>
                <li>
                  <strong>Revoke Access:</strong> Revoke Google API access
                  through your Google Account settings
                </li>
                <li>
                  <strong>Data Portability:</strong> Request a copy of your data
                  in a structured format
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Cookies and Local Storage
              </h2>
              <p className="text-gray-700 mb-4">
                Our application uses browser local storage to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Store authentication tokens and user session data</li>
                <li>Remember user preferences and settings</li>
                <li>Cache vocabulary data for offline functionality</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can clear this data at any time through your browser
                settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Data Retention
              </h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information only as long as necessary
                to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
              </ul>
              <p className="text-gray-700 mt-4">
                When you delete your account, we will delete your personal
                information within 30 days, except where retention is required
                by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Children's Privacy
              </h2>
              <p className="text-gray-700">
                Our service is not intended for children under the age of 13. We
                do not knowingly collect personal information from children
                under 13. If you are a parent or guardian and become aware that
                your child has provided us with personal information, please
                contact us, and we will take steps to remove such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. International Data Transfers
              </h2>
              <p className="text-gray-700">
                Your information may be transferred to and processed in
                countries other than your own. We ensure that such transfers
                comply with applicable data protection laws and that appropriate
                safeguards are in place to protect your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Posting the updated policy on this page</li>
                <li>Updating the "Effective Date" at the top of this policy</li>
                <li>
                  Sending you a notification if you have provided contact
                  information
                </li>
              </ul>
              <p className="text-gray-700 mt-4">
                Your continued use of our service after any changes constitutes
                acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> lee@sungbin.dev
                  <br />
                  <strong>Subject:</strong> Privacy Policy Inquiry
                  <br />
                  <strong>Response Time:</strong> We aim to respond within 48
                  hours
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Legal Compliance
              </h2>
              <p className="text-gray-700 mb-4">
                This Privacy Policy is designed to comply with:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>General Data Protection Regulation (GDPR)</li>
                <li>California Consumer Privacy Act (CCPA)</li>
                <li>Google API Services User Data Policy</li>
                <li>Other applicable data protection and privacy laws</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500">
                This Privacy Policy was last updated on{' '}
                {new Date().toLocaleDateString()}. By using our Chinese
                Vocabulary Learning App, you acknowledge that you have read and
                understood this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
