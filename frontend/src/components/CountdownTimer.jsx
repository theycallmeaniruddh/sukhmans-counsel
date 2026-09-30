import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar } from 'lucide-react';

export default function CountdownTimer({ showBanners = true }) {
  // Target: December 6, 2026, 2:00 PM IST (14:00:00 +05:30) -> 08:30:00 UTC
  const targetDate = new Date('2026-12-06T14:00:00+05:30').getTime();

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return (
    <div className="w-full">
      {/* Countdown Card */}
      <div className="glass-panel glass-panel-glow rounded-2xl p-6 relative overflow-hidden border border-electric-violet/30 shadow-xl bg-gradient-to-r from-navy-900/80 via-navy-950/90 to-[#120e2d]/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-400 border border-gold-500/40 uppercase tracking-wider">
                Target Countdown
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-electric-light" />
                2:00 PM – 4:00 PM IST
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-heading gold-gradient-text tracking-wide">
              CLAT 2027 — Dec 6, 2026
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              National Law School of India University (NLS Bangalore) Dream Target
            </p>
          </div>

          {/* Gold Numeric Blocks */}
          <div className="flex items-center gap-3 sm:gap-4">
            {[
              { label: 'DAYS', value: timeLeft.days },
              { label: 'HOURS', value: String(timeLeft.hours).padStart(2, '0') },
              { label: 'MINUTES', value: String(timeLeft.minutes).padStart(2, '0') },
              { label: 'SECONDS', value: String(timeLeft.seconds).padStart(2, '0') }
            ].map((unit, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-[#09071f]/90 border border-gold-500/30 flex items-center justify-center shadow-lg shadow-gold-500/10 backdrop-blur-md">
                  <span className="text-2xl sm:text-3xl font-bold font-heading text-gold-400 tracking-wider">
                    {unit.value}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mt-1.5 tracking-widest">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Dates Pill Banner */}
        {showBanners && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2.5 text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gold-400" /> Milestone Tracker:
            </span>
            <span className="px-3 py-1 rounded-full bg-violet-900/40 text-violet-200 border border-violet-500/40 font-medium">
              📝 Registration closes Oct 31, 2026
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-900/40 text-amber-200 border border-amber-500/40 font-medium">
              🪪 Admit Cards: Nov 2026
            </span>
            <span className="px-3 py-1 rounded-full bg-pink-900/40 text-pink-200 border border-pink-500/40 font-medium">
              ⚖️ Exam: Dec 6, 2026 (2–4 PM)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
