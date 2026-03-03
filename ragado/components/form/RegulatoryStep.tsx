'use client'

import { useForm } from '@/context/FormContext'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

export function RegulatoryStep() {
  const { formData, updateFormData } = useForm()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-6">Regulatory</h1>
      </div>

      <div className="space-y-8">
        <div>
          <Input
            type="text"
            placeholder="FCA Firm Reference Number (FRN) *"
            value={formData.fcaFirmReferenceNumber}
            onChange={(e) =>
              updateFormData({ fcaFirmReferenceNumber: e.target.value })
            }
            className="border-0 border-b border-black shadow-none rounded-none px-2 focus-visible:border-b-[#0F112A] focus-visible:bg-[#F3F4F6] h-auto py-3 transition-all bg-transparent"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-8 mt-18">
            Firm Status *
          </h2>
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Checkbox
                id="directly-authorised"
                checked={formData.firmStatus === 'directly-authorised'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFormData({ firmStatus: 'directly-authorised' })
                  }
                }}
              />
              <label
                htmlFor="directly-authorised"
                className="text-gray-500 text-sm font-medium text-foreground cursor-pointer"
              >
                Directly Authorised
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="appointed-representative"
                checked={formData.firmStatus === 'appointed-representative'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFormData({ firmStatus: 'appointed-representative' })
                  }
                }}
              />
              <label
                htmlFor="appointed-representative"
                className="text-sm text-gray-500 font-medium text-foreground cursor-pointer"
              >
                Appointed Representative
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="introducer-only"
                checked={formData.firmStatus === 'introducer-only'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFormData({ firmStatus: 'introducer-only' })
                  }
                }}
              />
              <label
                htmlFor="introducer-only"
                className="text-sm text-gray-500 font-medium text-foreground cursor-pointer"
              >
                Introducer only
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
