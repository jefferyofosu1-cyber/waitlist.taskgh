import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { WaitlistForm } from "@/components/waitlist-form";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ utm_source?: string; ref?: string }>;
}) {
  const params = await searchParams;
  const source = params.utm_source ?? "direct";
  const referralCode = params.ref ?? "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 flex items-center justify-between">
          <img src="/logo.png" alt="TaskGH" className="h-8 w-auto" />
          <Link href="#join" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Join Waitlist
          </Link>
        </header>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <section>
            <p className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Trusted Artisans, On Demand
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Need a trusted plumber, electrician, AC guy or handyman?
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Join the TaskGH early access list and be first to book trusted artisans in Ghana.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <Link href="#join" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500">
                Join Waitlist
              </Link>
              <Countdown launchDate="2026-07-01" />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Feature label="Verified artisans" />
              <Feature label="Fast bookings" />
              <Feature label="Ghana-first service" />
            </div>
          </section>
          <section id="join">
            <WaitlistForm source={source} referralCode={referralCode} />
          </section>
        </div>

        <footer className="mt-16 border-t border-slate-200 py-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="TaskGH" className="h-6 w-auto opacity-80" />
            <span>TaskGH - Trusted Artisans, On Demand</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Feature({ label }: { label: string }) {
  return <div className="rounded-xl bg-white px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-slate-100">{label}</div>;
}
