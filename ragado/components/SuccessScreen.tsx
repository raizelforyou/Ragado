'use client'

import { Button } from '@/components/ui/button'
import { useForm } from '@/context/FormContext'
import { CheckCircle2 } from 'lucide-react'

export function SuccessScreen() {
  const { resetForm } = useForm()

  const handleStartOver = () => {
    resetForm()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Application Submitted
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Thank you for your application. It is now in review and we are
            carrying out our due diligence. If we have any further questions,
            we will be in touch
          </p>
        </div>

        {/* Button */}
        <Button
          onClick={handleStartOver}
          variant="outline"
          className="w-full"
        >
          Submit Another Application
        </Button>
      </div>
    </div>
  )
}
