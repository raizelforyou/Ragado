'use client'

import { useForm } from '@/context/FormContext'
import { Checkbox } from '@/components/ui/checkbox'

export function ConsentsStep() {
  const { formData, updateFormData } = useForm()

  const handleConsentChange = (
    key: keyof typeof formData.consents,
    value: boolean
  ) => {
    updateFormData({
      consents: {
        ...formData.consents,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-1">Consents</h1>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="fca-register-check"
            checked={formData.consents.fcaRegisterCheck}
            onCheckedChange={(checked) =>
              handleConsentChange('fcaRegisterCheck', checked as boolean)
            }
            className="mt-1"
          />
          <label
            htmlFor="fca-register-check"
            className="text-sm font-medium text-foreground cursor-pointer leading-relaxed"
          >
            I consent to Ragado checking the FCA Register and Companies House
            in connection with this application
          </label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="accurate-information"
            checked={formData.consents.accurateInformation}
            onCheckedChange={(checked) =>
              handleConsentChange('accurateInformation', checked as boolean)
            }
            className="mt-1"
          />
          <label
            htmlFor="accurate-information"
            className="text-sm font-medium text-foreground cursor-pointer leading-relaxed"
          >
            I declare that all information provided in this application is
            accurate and complete to the best of my knowledge
          </label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="material-change"
            checked={formData.consents.materialChange}
            onCheckedChange={(checked) =>
              handleConsentChange('materialChange', checked as boolean)
            }
            className="mt-1"
          />
          <label
            htmlFor="material-change"
            className="text-sm font-medium text-foreground cursor-pointer leading-relaxed"
          >
            I agree to notify Ragado immediately of any material change to the
            firm's regulatory status
          </label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="preliminary-access"
            checked={formData.consents.preliminaryAccess}
            onCheckedChange={(checked) =>
              handleConsentChange('preliminaryAccess', checked as boolean)
            }
            className="mt-1"
          />
          <label
            htmlFor="preliminary-access"
            className="text-sm font-medium text-foreground cursor-pointer leading-relaxed"
          >
            I accept the preliminary access review terms
          </label>
        </div>
      </div>
    </div>
  )
}
