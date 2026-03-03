'use client'

import { useState } from 'react'
import { useForm } from '@/context/FormContext'
import { Button } from '@/components/ui/button'
import { FirmDetailsStep } from './FirmDetailsStep'
import { RegulatoryStep } from './RegulatoryStep'
import { ClassesOfBusinessStep } from './ClassesOfBusinessStep'
import { ClientMoneyStep } from './ClientMoneyStep'
import { ConsentsStep } from './ConsentsStep'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { submitApplication } from '@/lib/api'
import { toast } from 'sonner'

const STEPS = [
  { title: 'Firm Details', component: FirmDetailsStep },
  { title: 'Regulatory', component: RegulatoryStep },
  { title: 'Classes of Business', component: ClassesOfBusinessStep },
  { title: 'Client Money', component: ClientMoneyStep },
  { title: 'Consents', component: ConsentsStep },
]

const LeftArrowSquare = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" fillRule="evenodd" d="M3 5.4v13.2A2.4 2.4 0 0 0 5.4 21h13.2a2.4 2.4 0 0 0 2.4-2.4V5.4A2.4 2.4 0 0 0 18.6 3H5.4A2.4 2.4 0 0 0 3 5.4m4.293 5.893a1 1 0 0 0 0 1.414l4 4a1 1 0 0 0 1.414-1.414L10.414 13H16a1 1 0 1 0 0-2h-5.586l2.293-2.293a1 1 0 0 0-1.414-1.414z" clipRule="evenodd" />
  </svg>
)

const RightArrowSquare = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" fillRule="evenodd" d="M21 5.4v13.2a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 18.6V5.4A2.4 2.4 0 0 1 5.4 3h13.2A2.4 2.4 0 0 1 21 5.4m-4.293 5.893a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L13.586 13H8a1 1 0 1 1 0-2h5.586l-2.293-2.293a1 1 0 0 1 1.414-1.414z" clipRule="evenodd" />
  </svg>
)

export function FormContainer() {
  const { currentStep, setCurrentStep, formData } = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const CurrentStepComponent = STEPS[currentStep].component

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Firm Details
        if (!formData.legalEntityName?.trim()) {
          toast.error('Legal Entity Name is required')
          return false
        }
        if (!formData.companyNumber?.trim()) {
          toast.error('Company Number is required')
          return false
        }
        if (!formData.complianceFullName?.trim()) {
          toast.error('Full Name is required')
          return false
        }
        if (!formData.complianceEmail?.trim()) {
          toast.error('Email is required')
          return false
        }
        if (!formData.complianceTelephone?.trim()) {
          toast.error('Telephone is required')
          return false
        }
        return true
      case 1: // Regulatory
        if (!formData.fcaFirmReferenceNumber?.trim()) {
          toast.error('FCA Firm Reference Number is required')
          return false
        }
        if (!formData.firmStatus) {
          toast.error('Please select a Firm Status')
          return false
        }
        return true
      case 2: // Classes of Business
        if (!formData.classesOfBusiness?.length) {
          toast.error('Please select at least one class of business')
          return false
        }
        return true
      case 3: // Client Money
        if (formData.handlesClientMoney === undefined || formData.handlesClientMoney === null) {
          toast.error('Please indicate if you handle client money')
          return false
        }
        return true
      case 4: // Consents
        if (!formData.consents?.fcaRegisterCheck) {
          toast.error('Please provide all required consents')
          return false
        }
        if (!formData.consents?.accurateInformation) {
          toast.error('Please confirm the information is accurate')
          return false
        }
        if (!formData.consents?.materialChange) {
          toast.error('Please agree to notify of material changes')
          return false
        }
        if (!formData.consents?.preliminaryAccess) {
          toast.error('Please accept the preliminary access review terms')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitApplication(formData)
      toast.success('Application submitted successfully')
      setCurrentStep(STEPS.length)
      window.scrollTo(0, 0)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while submitting your application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1 && canProceed()) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    } else if (currentStep === STEPS.length - 1 && canProceed()) {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const isLastStep = currentStep === STEPS.length - 1
  const isFirstStep = currentStep === 0

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      {(() => {
        // Build the full list of crumbs: [Firm, ...completed steps, currentStep]
        const allCrumbs: { label: string; stepIndex: number }[] = [
          { label: 'Firm', stepIndex: -1 },
          ...STEPS.slice(0, currentStep).map((s, i) => ({ label: s.title, stepIndex: i })),
          { label: STEPS[currentStep].title, stepIndex: currentStep },
        ]
        const isCurrentCrumb = (i: number) => i === allCrumbs.length - 1

        // On small screens: show last 3, collapse rest to '...'
        const visibleCrumbs = allCrumbs.slice(-3)
        const hasHidden = allCrumbs.length > 3

        return (
          <>
            {/* Mobile breadcrumb (< md) */}
            <div className="flex md:hidden items-center whitespace-nowrap pb-2 text-sm mb-10">
              {hasHidden && (
                <>
                  <span className="text-gray-400">…</span>
                  <span className="text-gray-300 mx-3 font-light text-xl mt-[-2px]">›</span>
                </>
              )}
              {visibleCrumbs.map((crumb, i) => (
                <div key={crumb.stepIndex} className="flex items-center">
                  {isCurrentCrumb(allCrumbs.indexOf(crumb)) ? (
                    <span className="text-[#0f172a] font-semibold">{crumb.label}</span>
                  ) : (
                    <button
                      onClick={() => setCurrentStep(crumb.stepIndex)}
                      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {crumb.label}
                    </button>
                  )}
                  {i < visibleCrumbs.length - 1 && (
                    <span className="text-gray-300 mx-3 font-light text-xl mt-[-2px]">›</span>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop breadcrumb (>= md) — always show all */}
            <div className="hidden md:flex items-center whitespace-nowrap overflow-x-auto scrollbar-hide text-base no-scrollbar">
              {allCrumbs.map((crumb, i) => (
                <div key={crumb.stepIndex} className="flex items-center">
                  {isCurrentCrumb(i) ? (
                    <span className="text-[#0f172a] font-semibold">{crumb.label}</span>
                  ) : (
                    <button
                      onClick={() => setCurrentStep(crumb.stepIndex)}
                      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {crumb.label}
                    </button>
                  )}
                  {i < allCrumbs.length - 1 && (
                    <span className="text-gray-300 mx-3 font-light text-xl mt-[-2px]">›</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )
      })()}

      {/* Step Content */}
      <div className="py-8">
        <CurrentStepComponent />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 mt-6 pt-4">
        <Button
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="group inline-flex items-center gap-3 bg-[#e4e6f3] text-[#0f112a] hover:bg-[#0f112a] px-5 py-6 rounded-xl text-base font-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-none shadow-none"
        >
          <span>Previous</span>
          <div className="flex items-center justify-center w-7 h-7 bg-[#0f172a] rounded-lg ml-1">
            <LeftArrowSquare className="w-20 h-20 text-white" />
          </div>
        </Button>

        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className="group inline-flex items-center gap-3 bg-white border border-[#e2e8f0] text-[#1e293b] hover:bg-gray-50 px-6 py-6 rounded-xl text-base font-medium transition-all duration-200 border-none shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="pl-1">
            {isSubmitting ? 'Submitting...' : isLastStep ? 'Submit' : 'Next'}
          </span>
          <div className="flex items-center justify-center w-7 h-7 bg-[#0f172a] rounded-lg ml-2">
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <RightArrowSquare className="w-20 h-20 text-white" />
            )}
          </div>
        </Button>
      </div>

    </div>
  )
}
