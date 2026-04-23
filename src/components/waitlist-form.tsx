"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  hpField: string;
};

export function WaitlistForm({ source, referralCode }: { source: string; referralCode: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ referralCode?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phoneNumber: "",
    hpField: "",
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, source, referralCode }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "Could not submit. Please try again.");
      setSubmitting(false);
      return;
    }

    setSuccessData(data);
    setIsSuccess(true);
    setSubmitting(false);
  }

  if (isSuccess) {
    const shareUrl = successData.referralCode 
      ? `${window.location.origin}/?ref=${successData.referralCode}` 
      : window.location.origin;

    const handleShare = () => {
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
      <div className="w-full rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-100">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="mb-3 text-3xl font-bold text-gray-900">You’re In 🎉</h1>

        {/* Message */}
        <p className="mb-6 text-base leading-relaxed text-gray-600">
          Thanks for joining the <span className="font-semibold text-blue-600">TaskGH</span> waitlist.
          <br />
          Check your SMS and email for confirmation.
        </p>

        {/* Share CTA */}
        <button
          onClick={handleShare}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition duration-200 hover:bg-blue-700"
        >
          Share with a Friend
        </button>

        {/* Optional Back Home */}
        <button onClick={() => setIsSuccess(false)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
          Join with another email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100 md:p-8">
      <h2 className="text-xl font-semibold text-slate-900">Join Waitlist</h2>
      <p className="mt-1 text-sm text-slate-600">Be first to access trusted artisans in Ghana.</p>

      <div className="mt-6 space-y-4">
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
          placeholder="Full Name"
          required
          value={form.fullName}
          onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
          placeholder="Email Address"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
          placeholder="Phone Number (e.g. 0241234567)"
          type="tel"
          required
          value={form.phoneNumber}
          onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
        />
        <input
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={form.hpField}
          onChange={(e) => setForm((prev) => ({ ...prev, hpField: e.target.value }))}
        />
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Joining..." : "Join Waitlist"}
      </button>
    </form>
  );
}
