import Link from "next/link";
import { Zap } from "lucide-react";
import { AvatarBadge } from "@/components/ui/AvatarBadge";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans relative overflow-hidden">
      {/* Subtle Background Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 w-full px-6 py-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mock Logo matching "Clause" green gradient orb */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d9f99d] to-[#043d2c] flex items-center justify-center p-1.5 shadow-sm">
            <div className="w-full h-full bg-[#fafaf9] rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[#043d2c] rounded-full" />
            </div>
          </div>
          <span className="font-bold text-xl text-[#043d2c]">ClaimFlow</span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[#043d2c]">
           <button className="flex items-center hover:text-green-700 transition">Solutions <span className="ml-1 text-[10px]">▼</span></button>
           <button className="flex items-center hover:text-green-700 transition">Customers <span className="ml-1 text-[10px]">▼</span></button>
           <Link href="#" className="hover:text-green-700 transition">Pricing</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="px-5 py-2.5 rounded-lg font-semibold text-sm text-[#043d2c] bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition">
            Log In
          </Link>
          <Link href="/register" className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-[#043d2c] shadow-md hover:bg-[#07563f] transition">
            Start Now
          </Link>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-24 text-center">
        
        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm mb-8">
          <Zap className="w-4 h-4 fill-green-500 text-green-500" />
          <span className="text-[11px] font-bold text-[#043d2c] tracking-widest uppercase">Create for Fast</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#043d2c] max-w-4xl mx-auto leading-[1.1]">
          One tool to <span className="relative inline-block">
            manage
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#d9f99d]" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
            </svg>
          </span> <br className="hidden md:block" /> reimbursements and your team
        </h1>

        {/* Subtext */}
        <p className="mt-8 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium">
          ClaimFlow helps finance teams work faster, smarter and more efficiently, delivering the visibility and 
          data-driven insights to mitigate risk and ensure compliance.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register" className="px-8 py-4 rounded-xl font-bold text-white bg-[#043d2c] shadow-lg hover:bg-[#07563f] transition hover:-translate-y-0.5">
            Start for Free
          </Link>
          <Link href="/register" className="px-8 py-4 rounded-xl font-bold text-[#043d2c] bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition hover:-translate-y-0.5">
            Get a Demo
          </Link>
        </div>

        {/* Floating Avatars (Positioned Absolute relative to the main container) */}
        <AvatarBadge 
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
          className="top-[5%] md:top-[15%] left-[5%] md:left-[15%]" 
          arrowPosition="bottom-right"
        />
        <AvatarBadge 
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
          className="top-[10%] md:top-[20%] right-[5%] md:right-[15%]" 
          arrowPosition="bottom-left"
        />
        <AvatarBadge 
          src="https://images.unsplash.com/photo-1531123897727-8f129e1bfa8ea?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
          className="bottom-[15%] md:bottom-[25%] left-[10%] md:left-[20%]" 
          arrowPosition="top-right"
        />
        <AvatarBadge 
          src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
          className="bottom-[10%] md:bottom-[20%] right-[5%] md:right-[15%]" 
          arrowPosition="top-left"
        />
      </main>


    </div>
  );
}
