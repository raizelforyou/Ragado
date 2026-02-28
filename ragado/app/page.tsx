'use client'

import { useEffect, useState } from 'react'
import { useForm } from '@/context/FormContext'
import { HomeScreen } from '@/components/HomeScreen'
import { FormContainer } from '@/components/form/FormContainer'
import { SuccessScreen } from '@/components/SuccessScreen'

const STEP_COUNT = 5

export default function Page() {
  const { currentStep } = useForm()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Show home screen when step hasn't started
  if (currentStep < 0) {
    return <HomeScreen />
  }

  // Show form when in steps 0-4
  if (currentStep >= 0 && currentStep < STEP_COUNT) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <FormContainer />
        </div>
      </main>
    )
  }

  // Show success screen after submission (step >= 5)
  return <SuccessScreen />
}
