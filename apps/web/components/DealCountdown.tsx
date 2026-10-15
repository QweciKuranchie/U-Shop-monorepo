"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center bg-white/95 rounded-lg p-2 sm:p-3 shadow-lg border border-white/20 min-w-[50px] sm:min-w-[64px]">
    <span className="text-lg sm:text-2xl md:text-3xl font-extrabold text-red-600">
      {value.toString().padStart(2, "0")}
    </span>
    <span className="text-xs sm:text-xs text-gray-500 font-bold uppercase tracking-wider">
      {label}
    </span>
  </div>
);

const getSecondsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
};

const DealCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(getSecondsUntilMidnight);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getSecondsUntilMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-1.5 sm:gap-2 text-white">
        <Timer className="w-5 h-5 text-yellow-300 animate-pulse" />
        <span className="text-sm sm:text-base font-bold tracking-wide">
          Deal Ends In:
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        <TimeUnit value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
};

export default DealCountdown;
