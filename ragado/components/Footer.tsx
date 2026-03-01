"use client"

import { motion } from "framer-motion"

interface SnakeLinkProps {
  href: string
  children: string
  className?: string
}

function SnakeLink({ href, children, className = "" }: SnakeLinkProps) {
  return (
    <a
      href={href}
      className={`group relative overflow-hidden inline-block ${className}`}
    >
      <div className="flex overflow-hidden">
        {children.split('').map((char, i) => (
          <span
            key={i}
            className="snake-char inline-block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
            style={{ transitionDelay: `${i * 20}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
      <div className="flex absolute top-0 left-0">
        {children.split('').map((char, i) => (
          <span
            key={i}
            className="snake-char inline-block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-full group-hover:translate-y-0"
            style={{ transitionDelay: `${i * 20}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </a>
  )
}

export function Footer() {
  return (
    
    <motion.footer
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
  className="bg-[#0F112A] text-white px-6 md:px-12 pt-20 pb-16 rounded-t-[50px] mt-24"
>
      <div className="max-w-7xl mx-auto space-y-14">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Section 1: Links */}
          <div className="flex flex-col gap-3">
            <SnakeLink href="#" className="text-[22px] text-white font-normal">
              Privacy Policy
            </SnakeLink>
            <SnakeLink href="#" className="text-[22px] text-white font-normal">
              Terms of Service
            </SnakeLink>
          </div>

          {/* Section 2: Email Support */}
          <div className="md:text-right">
            <SnakeLink href="mailto:support@ragadobrokers.com" className="text-[22px] text-white font-normal">
              support@ragadobrokers.com
            </SnakeLink>
          </div>
        </div>

        {/* Section 3: Regulatory Info */}
        <div className="space-y-16">
          <p className="text-[16px] text-white font-normal leading-relaxed max-w-4xl">
            Authorised and regulated by the Financial Conduct Authority registration number 1034795
          </p>

          {/* Bottom Bar: Copyright */}
          <div className="pt-8 border-t border-white/5 flex justify-between items-center">
            <p className="text-[18px] text-white/60 font-medium">
              &copy; 2026 Ragado. All rights reserved.
            </p>
          </div>
        </div>
      </div>
   </motion.footer>
  )
}
