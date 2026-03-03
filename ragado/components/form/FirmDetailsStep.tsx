'use client'

import { useForm } from '@/context/FormContext'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function FirmDetailsStep() {
  const { formData, updateFormData } = useForm()

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-[18px] font-semibold text-foreground mb-1">Firm Details</h1>
      </div>

      <div className="space-y-9">
        <div>
          <Input
            type="text"
            placeholder="Legal Entity Name *"
            value={formData.legalEntityName}
            onChange={(e) =>
              updateFormData({ legalEntityName: e.target.value })
            }
            className="text-[14px] border-0 border-b border-black shadow-none rounded-none px-2 focus-visible:border-b-[#0F112A] focus-visible:bg-[#F3F4F6] h-auto py-2 transition-all bg-transparent"
          />
        </div>

        <div>
          <Input
            type="text"
            placeholder="Trading Name"
            value={formData.tradingName}
            onChange={(e) => updateFormData({ tradingName: e.target.value })}
            className="border-0 border-b  border-black shadow-none rounded-none px-2 focus-visible:border-b-[#0F112A] focus-visible:bg-[#F3F4F6] h-auto py-3 transition-all bg-transparent"
          />
        </div>

        <div>
          <Input
            type="text"
            placeholder="Company Number *"
            value={formData.companyNumber}
            onChange={(e) => updateFormData({ companyNumber: e.target.value })}
            className="border-0 border-b  border-black shadow-none rounded-none px-2 focus-visible:border-b-[#0F112A] focus-visible:bg-[#F3F4F6] h-auto py-3 transition-all bg-transparent"
          />
          <p className="text-xs text-muted-foreground mt-3">
            Will be validated against Companies House
          </p>
        </div>

        <div>
          <Textarea
            placeholder="Registered Address"
            value={formData.registeredAddress}
            onChange={(e) =>
              updateFormData({ registeredAddress: e.target.value })
            }
            className="border-0 border-b  border-black shadow-none rounded-none px-2 focus-visible:border-b-[#0F112A] focus-visible:bg-[#F3F4F6] resize-none min-h-30 transition-all bg-transparent py-4"
            rows={4}
          />
        </div>

        <div className=" pt-5">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Who is in charge of compliance at your firm
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                type="text"
                placeholder="Full Name *"
                value={formData.complianceFullName}
                onChange={(e) =>
                  updateFormData({ complianceFullName: e.target.value })
                }
                className="border-0 border-b  border-black shadow-none rounded-none px-2 focus-visible:border-b-[#0F112A] focus-visible:bg-[#F3F4F6] h-auto py-3 transition-all bg-transparent"
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email *"
                value={formData.complianceEmail}
                onChange={(e) =>
                  updateFormData({ complianceEmail: e.target.value })
                }
                className="border-0 border-b  border-black shadow-none rounded-none px-2 focus-visible:border-b-[#0F112A] focus-visible:bg-[#F3F4F6] h-auto py-3 transition-all bg-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <Input
              type="tel"
              placeholder="Telephone *"
              value={formData.complianceTelephone}
              onChange={(e) =>
                updateFormData({ complianceTelephone: e.target.value })
              }
              className="border-0 border-b  border-black shadow-none rounded-none px-2 focus-visible:border-b-[#0F112A] focus-visible:bg-[#F3F4F6] h-auto py-3 transition-all bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
