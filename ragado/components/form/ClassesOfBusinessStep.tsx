'use client'

import { useForm } from '@/context/FormContext'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

const BUSINESS_CLASSES = [
  'Commercial Property / Landlords',
  'Tradesman',
  'Construction / Contractors',
  'Professional Indemnity',
  'Commercial Combined',
  'Courier Van',
  'Fleet',
  'Other',
]

export function ClassesOfBusinessStep() {
  const { formData, updateFormData } = useForm()

  const handleClassToggle = (businessClass: string) => {
    const current = formData.classesOfBusiness
    const updated = current.includes(businessClass)
      ? current.filter((c) => c !== businessClass)
      : [...current, businessClass]
    updateFormData({ classesOfBusiness: updated })
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-1">
          Classes of Business
        </h1>
      </div>

      <div className="space-y-6">
        <div>
        
          <div className="space-y-3">
            {BUSINESS_CLASSES.map((businessClass) => (
              <div key={businessClass} className="flex items-center gap-3">
                <Checkbox
                  id={businessClass}
                  checked={formData.classesOfBusiness.includes(businessClass)}
                  onCheckedChange={() => handleClassToggle(businessClass)}
                />
                <label
                  htmlFor={businessClass}
                  className="text-sm font-medium  text-gray-500 cursor-pointer"
                >
                  {businessClass}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <Input
            type="text"
            placeholder="Estimated GWP (£)"
            value={formData.estimatedGWP}
            onChange={(e) => updateFormData({ estimatedGWP: e.target.value })}
            className="border-0 border-b border-black shadow-none rounded-none px-2 focus-visible:border-b-[#0F112A] focus-visible:bg-[#F3F4F6] h-auto py-3 transition-all bg-transparent"
          />
        </div>

        <div className='pt-6'>
          <Textarea
            placeholder="Additional Information"
            value={formData.additionalInformation}
            onChange={(e) =>
              updateFormData({ additionalInformation: e.target.value })
            }
            className="border-0 border-b border-black shadow-none rounded-none px-2 focus-visible:border-b-[#0F112A] focus-visible:bg-[#F3F4F6] resize-none min-h-10 transition-all bg-transparent py-5"
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
