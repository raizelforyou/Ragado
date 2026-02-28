'use client'

import { Button } from '@/components/ui/button'
import { useForm } from '@/context/FormContext'
import { ArrowRight, Check, Home, Landmark, ChevronRight } from 'lucide-react'

export function HomeScreen() {
  const { setCurrentStep } = useForm()

  const handleGetStarted = () => {
    setCurrentStep(0)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 md:py-36">
      <div className="w-full max-w-5xl space-y-12 md:space-y-16">
        {/* Main Title + CTA grouped tightly */}
        <div className="flex flex-col items-center gap-10">
          <div className="text-center w-full mt-13">
            <h1 className="text-[28px] md:text-[39px] w-full font-medium text-[#0f172a] leading-[1.1] tracking-[-0.03em] mx-auto">
              Broker Access to Specialist
              <br className="hidden md:block" />
              Commercial Insurance
            </h1>
          </div>

          {/* Call to Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGetStarted}
              className="group inline-flex items-center gap-3 bg-[#0f172a] text-white hover:bg-[#1e293b] px-3 py-7 rounded-[12px] text-md font-medium transition-all duration-300 shadow-2xl shadow-slate-200"
            >
              <span className="pl-2 font-light">Request Access</span>
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg ml-2 transition-transform group-hover:translate-x-1.5 focus:ring-0">
                <ArrowRight className="w-4 h-4 text-[#0f172a]" />
              </div>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-24 ">
          <div className="text-center space-y-5">
            <Check className="w-9 h-9 text-black mx-auto stroke-[2px]" />
            <p className="text-[22px] text-[#0f172a] leading-tight tracking-tight">
              FCA Register
              <br />
              Check
            </p>
          </div>

          <div className="hidden md:block opacity-30">
            <span className="text-black text-3xl font-semibold">›</span>
          </div>

          <div className="text-center space-y-5">
            <Home className="w-9 h-9 text-black mx-auto stroke-[2px]" />
            <p className="text-[22px] text-[#0f172a] leading-tight tracking-tight">
              Companies
              <br />
              House Check
            </p>
          </div>

          <div className="hidden md:block opacity-30">
            <span className="text-black text-3xl font-semibold">›</span>
          </div>

          <div className="text-center space-y-5">
            <Landmark className="w-9 h-9 text-black mx-auto stroke-[2px]" />
            <p className="text-[22px] text-[#0f172a] leading-tight tracking-tight w-full">
              Business and
              <br />
              GWP Review
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="pt-6">
          <p className="text-center text-[14px] text-gray-400/80 max-w-[640px] mx-auto leading-[1.8] font-normal tracking-wide">
            Access to products is provided under a controlled distribution model. Broker
            permissions and regulatory status are verified against public registers. Product
            participation and limits are approved in line with FCA oversight requirements.
          </p>
        </div>
      </div>
    </div>
  )
}
