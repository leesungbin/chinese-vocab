import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PrivacyPolicyContent } from '@/components/privacy/PrivacyPolicyContent'

export const metadata: Metadata = {
  title: 'Privacy Policy - Chinese Vocabulary Learning App',
  description:
    'Privacy policy for the Chinese Vocabulary Learning App detailing how we collect, use, and protect your data.',
}

export default function PrivacyPolicy() {
  return <PrivacyPolicyContent />
}
