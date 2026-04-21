import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const referralUrl = code ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/?ref=${code}` : "";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow ring-1 ring-slate-100">
        <p className="text-5xl">🎉</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">You&apos;re In 🎉</h1>
        <p className="mt-4 text-slate-600">Thanks for joining the TaskGH waitlist.</p>
        <p className="mt-1 text-slate-600">Check your SMS and email for confirmation.</p>
        {referralUrl ? (
          <div className="mt-6 rounded-xl bg-blue-50 p-4 text-left text-sm text-blue-900">
            <p className="font-semibold">Your referral link</p>
            <p className="mt-1 break-all">{referralUrl}</p>
          </div>
        ) : null}
        <Link href="/" className="mt-7 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500">
          Share with a friend
        </Link>
      </div>
    </main>
  );
}
