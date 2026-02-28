'use client'

import React, { createContext, useContext, useState } from 'react'

export interface FormData {
  // Firm Details
  legalEntityName: string
  tradingName: string
  companyNumber: string
  registeredAddress: string
  complianceFullName: string
  complianceEmail: string
  complianceTelephone: string

  // Regulatory
  fcaFirmReferenceNumber: string
  firmStatus: 'directly-authorised' | 'appointed-representative' | 'introducer-only'

  // Classes of Business
  classesOfBusiness: string[]
  estimatedGWP: string
  additionalInformation: string

  // Client Money
  handlesClientMoney: boolean
  confirmations: string[]

  // Consents
  consents: {
    fcaRegisterCheck: boolean
    accurateInformation: boolean
    materialChange: boolean
    preliminaryAccess: boolean
  }
}

interface FormContextType {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  resetForm: () => void
}

const defaultFormData: FormData = {
  legalEntityName: '',
  tradingName: '',
  companyNumber: '',
  registeredAddress: '',
  complianceFullName: '',
  complianceEmail: '',
  complianceTelephone: '',
  fcaFirmReferenceNumber: '',
  firmStatus: 'directly-authorised',
  classesOfBusiness: [],
  estimatedGWP: '',
  additionalInformation: '',
  handlesClientMoney: false,
  confirmations: [],
  consents: {
    fcaRegisterCheck: false,
    accurateInformation: false,
    materialChange: false,
    preliminaryAccess: false,
  },
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [currentStep, setCurrentStep] = useState(-1)

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const resetForm = () => {
    setFormData(defaultFormData)
    setCurrentStep(-1)
  }

  return (
    <FormContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        setCurrentStep,
        resetForm,
      }}
    >
      {children}
    </FormContext.Provider>
  )
}

export function useForm() {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error('useForm must be used within FormProvider')
  }
  return context
}
