"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WaitlistUser } from "@/lib/supabase";

type AdminResponse = {
  rows: WaitlistUser[];
  nextCursor: string | null;
  stats: { total: number; today: number; filtered: number };
};

type NotificationEvent = {
  id: string;
  channel: "email" | "sms";
  provider: "brevo" | "flashsms";
  status: "queued" | "sent" | "failed" | "delivered";
  error_message: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-amber-100 text-amber-700",
  sent: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<WaitlistUser[]>([]);
  const [stats, setStats] = useState<AdminResponse["stats"] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const encodedQuery = useMemo(() => encodeURIComponent(query), [query]);

  const fetchPage = useCallback(
    async (cursor: string | null, replace: boolean) => {
      const url = `/api/admin/waitlist?q=${encodedQuery}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
      const response = await fetch(url);
      const payload = (await response.json()) as AdminResponse;
      if (replace) {
        setRows(payload.rows ?? []);
      } else {
        setRows((prev) => [...prev, ...(payload.rows ?? [])]);
      }
      setStats(payload.stats);
      setNextCursor(payload.nextCursor);
    },
    [encodedQuery],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchPage(null, true),
      fetch("/api/admin/notifications")
        .then((r) => r.json())
        .then((p: { rows: NotificationEvent[] }) => {
          if (!cancelled) setEvents(p.rows ?? []);
        }),
    ]).then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  async function handleLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    await fetchPage(nextCursor, false);
    setLoadingMore(false);
  }

  async function handleDelete(id: string) {
    await fetch("/api/admin/waitlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setRows((prev) => prev.filter((r) => r.id !== id));
    setStats((prev) => prev ? { ...prev, total: prev.total - 1, filtered: prev.filtered - 1 } : prev);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Total Signups" value={stats?.total ?? 0} />
        <Card label="Today Signups" value={stats?.today ?? 0} />
        <Card label="Filtered Results" value={stats?.filtered ?? 0} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-slate-100 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={query}
            onChange={(e) => {
              setLoading(true);
              setQuery(e.target.value);
            }}
            placeholder="Search by phone/email"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-blue-500 md:max-w-sm"
          />
          <div className="flex gap-2">
            <a href="/api/admin/export" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Export CSV
            </a>
            <a href="/leaderboard" target="_blank" className="rounded-xl border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700">
              Leaderboard
            </a>
            <button onClick={handleLogout} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Logout
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Phone</th>
                <th className="pb-2 font-medium">Source</th>
                <th className="pb-2 font-medium">Referred by</th>
                <th className="pb-2 font-medium">Joined</th>
                <th className="pb-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-8 text-center text-slate-400" colSpan={7}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="py-8 text-center text-slate-400" colSpan={7}>
                    No results found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-900">{row.full_name}</td>
                    <td className="py-3 text-slate-600">{row.email}</td>
                    <td className="py-3 text-slate-600">{row.phone_number}</td>
                    <td className="py-3 text-slate-500">{row.source ?? "direct"}</td>
                    <td className="py-3">
                      {row.referred_by_code ? (
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-mono text-purple-700">
                          {row.referred_by_code}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {nextCursor && !loading && (
          <div className="mt-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-xl border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-slate-100 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Notification Events</h2>
        <p className="mt-1 text-sm text-slate-500">Latest email/SMS delivery lifecycle updates.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Channel</th>
                <th className="pb-2 font-medium">Provider</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Error</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-slate-400" colSpan={5}>
                    No events yet.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="border-t border-slate-100">
                    <td className="py-3 capitalize">{event.channel}</td>
                    <td className="py-3">{event.provider}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[event.status] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{event.error_message ?? "—"}</td>
                    <td className="py-3 text-slate-500">{new Date(event.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow ring-1 ring-slate-100">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
    </div>
  );
}

