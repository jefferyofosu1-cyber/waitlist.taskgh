import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase";

type LeaderboardRow = {
  name: string;
  referralCode: string;
  count: number;
};

async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const supabase = getSupabaseAdminClient();

  const { data: referrals } = await supabase
    .from("waitlist_users")
    .select("referred_by_code")
    .not("referred_by_code", "is", null);

  const counts: Record<string, number> = {};
  for (const row of referrals ?? []) {
    if (row.referred_by_code) {
      counts[row.referred_by_code] = (counts[row.referred_by_code] ?? 0) + 1;
    }
  }

  const topCodes = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([code]) => code);

  if (topCodes.length === 0) return [];

  const { data: users } = await supabase
    .from("waitlist_users")
    .select("full_name, referral_code")
    .in("referral_code", topCodes);

  return topCodes
    .map((code) => {
      const user = users?.find((u) => u.referral_code === code);
      if (!user) return null;
      const firstName = user.full_name.split(" ")[0] ?? user.full_name;
      return { name: firstName, referralCode: code, count: counts[code] ?? 0 };
    })
    .filter((r): r is LeaderboardRow => r !== null);
}

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <Link href="/" className="text-xl font-bold text-blue-700">
            TaskGH
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Referral Leaderboard</h1>
          <p className="mt-2 text-slate-600">
            Top community members spreading the word about TaskGH.
          </p>
        </div>

        <div className="rounded-2xl bg-white shadow ring-1 ring-slate-100">
          {rows.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-4xl">🏆</p>
              <p className="mt-3 text-lg font-medium">No referrals yet</p>
              <p className="mt-1 text-sm">Be the first to share your referral link!</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map((row, index) => (
                <li
                  key={row.referralCode}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center text-lg">
                      {MEDALS[index] ?? `#${index + 1}`}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{row.name}</p>
                      <p className="font-mono text-xs text-slate-400">{row.referralCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{row.count}</p>
                    <p className="text-xs text-slate-500">
                      {row.count === 1 ? "referral" : "referrals"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
          >
            Get your referral link →
          </Link>
        </div>
      </div>
    </main>
  );
}
