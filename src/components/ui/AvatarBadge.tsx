"use client";

import React from "react";

interface AvatarBadgeProps {
  src: string;
  className?: string;
  arrowPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({ 
  src, 
  className = "", 
  arrowPosition = "bottom-right" 
}) => {
  return (
    <div className={`absolute select-none pointer-events-none rounded-full border-[6px] border-white shadow-xl ${className}`}>
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
        <img src={src} alt="Avatar" className="w-full h-full object-cover" />
      </div>
      
      {/* Dark green pointer arrow */}
      <div 
        className={`absolute w-6 h-6 bg-[#043d2c] border-[3px] border-white rounded-tl-full rounded-br-full rounded-tr-full shadow-sm ${
          arrowPosition === "bottom-right" ? "-bottom-2 -right-2 rotate-45" : 
          arrowPosition === "bottom-left" ? "-bottom-2 -left-2 -rotate-45 rounded-tl-none rounded-bl-full" : 
          arrowPosition === "top-right" ? "-top-2 -right-2 rotate-[135deg]" : 
          "-top-2 -left-2 -rotate-[135deg] rounded-tl-none rounded-bl-full"
        }`} 
      />
    </div>
  );
};
