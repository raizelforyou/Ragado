'use client'

import { useForm } from '@/context/FormContext'
import { Checkbox } from '@/components/ui/checkbox'

const CONFIRMATIONS = [
  'Consumer Duty policy is in place',
  'Credit consumer licence held (if applicable)',
  'Professional Indemnity insurance in place with minimum £1.5m limit',
  'Complaints handling procedure is in place',
]

export function ClientMoneyStep() {
  const { formData, updateFormData } = useForm()

  const handleClientMoneyChange = (value: boolean) => {
    updateFormData({ handlesClientMoney: value })
  }

  const handleConfirmationToggle = (confirmation: string) => {
    const current = formData.confirmations
    const updated = current.includes(confirmation)
      ? current.filter((c) => c !== confirmation)
      : [...current, confirmation]
    updateFormData({ confirmations: updated })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-1">
          Client Money
        </h1>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-medium text-foreground mb-4">
            Do you handle client money? *
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="client-money-yes"
                checked={formData.handlesClientMoney === true}
                onCheckedChange={(checked) => {
                  if (checked) handleClientMoneyChange(true)
                }}
              />
              <label
                htmlFor="client-money-yes"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Yes
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="client-money-no"
                checked={formData.handlesClientMoney === false}
                onCheckedChange={(checked) => {
                  if (checked) handleClientMoneyChange(false)
                }}
              />
              <label
                htmlFor="client-money-no"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                No
              </label>
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Confirmations
          </h2>
          <div className="space-y-3">
            {CONFIRMATIONS.map((confirmation) => (
              <div key={confirmation} className="flex items-start gap-3">
                <Checkbox
                  id={confirmation}
                  checked={formData.confirmations.includes(confirmation)}
                  onCheckedChange={() =>
                    handleConfirmationToggle(confirmation)
                  }
                  className="mt-1"
                />
                <label
                  htmlFor={confirmation}
                  className="text-sm font-medium text-foreground cursor-pointer leading-relaxed"
                >
                  {confirmation}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
