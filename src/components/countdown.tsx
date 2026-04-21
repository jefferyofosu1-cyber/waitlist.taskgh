"use client";

import { useEffect, useState } from "react";

function getDaysToLaunch(launchDate: string) {
  return Math.max(1, Math.ceil((new Date(launchDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function Countdown({ launchDate }: { launchDate: string }) {
  const [daysToLaunch, setDaysToLaunch] = useState(() => getDaysToLaunch(launchDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setDaysToLaunch(getDaysToLaunch(launchDate));
    }, 60_000);
    return () => clearInterval(timer);
  }, [launchDate]);

  return <span className="rounded-xl bg-white px-4 py-2 text-slate-700 ring-1 ring-slate-200">Launch countdown: {daysToLaunch} days</span>;
}
