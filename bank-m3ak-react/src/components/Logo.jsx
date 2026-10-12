import React from "react";
import { Landmark } from "lucide-react";

export default function Logo({ className = "h-5 w-5" }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-[#1E88E5] p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
        <Landmark className={className} />
      </div>
      <div>
        <span className="font-display font-bold text-xl tracking-tight text-[#1E88E5]">
          Bank M3ak
        </span>
        <span className="block text-[8px] text-gray-400 uppercase font-mono tracking-widest leading-none">
          Morocco
        </span>
      </div>
    </div>
  );
}
