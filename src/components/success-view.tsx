"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SuccessView({ referralUrl }: { referralUrl: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleShare = () => {
    const shareUrl = referralUrl || "https://taskgh.com";
    if (navigator.share) {
      navigator.share({
        title: "TaskGH Waitlist",
        text: "Join the TaskGH waitlist for trusted artisans in Ghana.",
        url: shareUrl,
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Join TaskGH waitlist ${shareUrl}`)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">You’re In 🎉</h1>

        {/* Message */}
        <p className="text-gray-600 text-base leading-relaxed mb-6">
          Thanks for joining the <span className="font-semibold text-blue-600">TaskGH</span> waitlist.
          <br />
          Check your SMS and email for confirmation.
        </p>

        {/* Share CTA */}
        <button
          onClick={handleShare}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200"
        >
          Share with a Friend
        </button>

        {/* Optional Back Home */}
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-gray-500 hover:text-gray-700"
        >
          Back to Home
        </Link>
        
        <div className="mt-4">
           <Link href="/leaderboard" className="text-xs text-blue-600 hover:underline">
             View Leaderboard
           </Link>
        </div>
      </div>
    </div>
  );
}
