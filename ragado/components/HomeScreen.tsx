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
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 md:py-19 ">
      <div className="w-full max-w-4xl space-y-12 md:space-y-24">
        {/* Main Title + CTA grouped tightly */}
          <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col items-center gap-13"
        >
          <div className="text-center w-full">
            <h1 className="text-[30px] md:text-[40px] w-full font-medium text-[#0F112A] leading-[38px] tracking-[-3px] max-w-[898px] mx-auto break-words whitespace-nowrap">
              Broker Access to Specialist Commercial Insurance
            </h1>
          </div>

          {/* Call to Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGetStarted}
              className="group inline-flex items-center gap-0 font-sans-serif text-[#0F112A] text-white border border-[#0F112A] hover:bg-[#d3d3d4] hover:text-[#0F112A] px-6 py-7 rounded-[17px] text-lg tracking-tight font-medium transition-all duration-500 ease-in-out shadow-2xl shadow-slate-200"
            >
              <span className="pl-2 font-light">Request Access</span>
              <div className="relative overflow-hidden flex items-center justify-center w-8 h-8 bg-white rounded-lg ml-2 transition-transform group-hover:bg-[#0F112A] focus:ring-0">
              {/* First Arrow */}
      <span
        className="
          absolute
          transition-all duration-300
          ease-in-out
          group-hover:translate-x-6
        "
      >
        <ArrowRight className="text-black w-4 h-4" />
      </span>

      {/* Second Arrow */}
      <span
        className="
          absolute
          -translate-x-6
          transition-all duration-300
          ease-in-out
          group-hover:translate-x-0
        "
      >
        <ArrowRight className="text-white w-4 h-4" />
      </span>
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
          className="mt-14 w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-5xl"
        >
          <div className="text-center space-y-5">
            <Check className="w-8 h-8 text-black mx-auto stroke-[2px]" />
            <p className="text-[18px] md:text-[15px] text-[#0f172a] leading-tight tracking-tight whitespace-nowrap">
              FCA Register Check
            </p>
          </div>

          <div className="hidden md:block opacity-30">
            <span className="text-black text-3xl font-semibold">›</span>
          </div>

          <div className="text-center space-y-5">
            <Home className="w-8 h-8 text-black mx-auto stroke-[2px]" />
            <p className="text-[18px] md:text-[15px] text-[#0f172a] leading-tight tracking-tight whitespace-nowrap">
              Companies House Check
            </p>
          </div>

          <div className="hidden md:block opacity-30">
            <span className="text-black text-3xl font-semibold">›</span>
          </div>

          <div className="text-center space-y-5">
            <Landmark className="w-8 h-8 text-black mx-auto stroke-[2px]" />
            <p className="text-[18px] md:text-[15px] text-[#0f172a] leading-tight tracking-tight whitespace-nowrap">
              Business and GWP Review
            </p>
          </div>
        </motion.div>

        {/* Description */}
        <div className="">
          <p className="text-center text-[13px] text-[#0F112A]/20 max-w-[640px] mx-auto leading-[1.8] font-normal tracking-tight">
            Access to products is provided under a controlled distribution model. Broker
            permissions and regulatory status are verified against public registers. Product
            participation and limits are approved in line with FCA oversight requirements.
          </p>
        </div>
      </div>
    </div>
  )
}


