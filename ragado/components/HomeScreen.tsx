'use client'

import { Button } from '@/components/ui/button'
import { useForm } from '@/context/FormContext'
import { ArrowRight, Check, Home, Landmark, ChevronRight } from 'lucide-react'
import { motion } from "framer-motion"

export function HomeScreen() {
  const { setCurrentStep } = useForm()

  const handleGetStarted = () => {
    setCurrentStep(0)
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        delay,
      },
    }),
  }


  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-9 md:py-16">
      <div className="w-full max-w-5xl space-y-20 md:space-y-30">
        {/* Main Title + CTA grouped tightly */}
          <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col items-center gap-20"
        >
          <div className="text-center w-full">
            <h1 className="text-[43px] md:text-[50px] w-full font-medium text-[#0f172a] leading-[1.1] tracking-[-0.07em] mx-auto whitespace-nowrap">
              Broker Access to Specialist Commercial Insurance
            </h1>
          </div>

          {/* Call to Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGetStarted}
              className="group inline-flex items-center gap-3 bg-[#0f172a] text-white hover:bg-[#1e293b] px-6 py-9 rounded-[17px] text-2xl font-medium transition-all duration-300 shadow-2xl shadow-slate-200"
            >
              <span className="pl-2 font-light">Request Access</span>
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg ml-2 transition-transform group-hover:translate-x-1.5 focus:ring-0">
                <ArrowRight className="w-4 h-4 text-[#0f172a]" />
              </div>
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
         <motion.div
          custom={0.3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-24"
        >
          <div className="text-center space-y-5">
            <Check className="w-9 h-9 text-black mx-auto stroke-[2px]" />
            <p className="text-[18px] md:text-[22px] text-[#0f172a] leading-tight tracking-tight whitespace-nowrap">
              FCA Register Check
            </p>
          </div>

          <div className="hidden md:block opacity-30">
            <span className="text-black text-3xl font-semibold">›</span>
          </div>

          <div className="text-center space-y-5 w-56">
            <Home className="w-9 h-9 text-black mx-auto stroke-[2px]" />
            <p className="text-[18px] md:text-[22px] text-[#0f172a] leading-tight tracking-tight whitespace-nowrap">
              Companies House Check
            </p>
          </div>

          <div className="hidden md:block opacity-30">
            <span className="text-black text-3xl font-semibold">›</span>
          </div>

          <div className="text-center space-y-5 w-56">
            <Landmark className="w-9 h-9 text-black mx-auto stroke-[2px]" />
            <p className="text-[18px] md:text-[22px] text-[#0f172a] leading-tight tracking-tight whitespace-nowrap">
              Business and GWP Review
            </p>
          </div>
        </motion.div>

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
