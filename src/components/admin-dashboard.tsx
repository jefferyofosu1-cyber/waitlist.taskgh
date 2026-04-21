"use client";

import { useEffect, useMemo, useState } from "react";
import { WaitlistUser } from "@/lib/supabase";

type AdminResponse = {
  rows: WaitlistUser[];
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

export function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const encodedQuery = useMemo(() => encodeURIComponent(query), [query]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/waitlist?q=${encodedQuery}`)
      .then((response) => response.json())
      .then((payload: AdminResponse) => {
        if (!cancelled) {
          setData(payload);
          setLoading(false);
        }
      });
    fetch("/api/admin/notifications")
      .then((response) => response.json())
      .then((payload: { rows: NotificationEvent[] }) => {
        if (!cancelled) {
          setEvents(payload.rows ?? []);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [encodedQuery]);

  async function handleDelete(id: string) {
    await fetch("/api/admin/waitlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLoading(true);
    const response = await fetch(`/api/admin/waitlist?q=${encodedQuery}`);
    const payload = (await response.json()) as AdminResponse;
    setData(payload);
    setLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Total Signups" value={data?.stats.total ?? 0} />
        <Card label="Today Signups" value={data?.stats.today ?? 0} />
        <Card label="Filtered Results" value={data?.stats.filtered ?? 0} />
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
          <a href="/api/admin/export" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Export CSV
          </a>
          <button onClick={handleLogout} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Logout
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[740px] text-left text-sm">
            <thead className="text-slate-600">
              <tr>
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Phone</th>
                <th className="pb-2">Source</th>
                <th className="pb-2">Joined</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : (
                data?.rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="py-3">{row.full_name}</td>
                    <td className="py-3">{row.email}</td>
                    <td className="py-3">{row.phone_number}</td>
                    <td className="py-3">{row.source ?? "direct"}</td>
                    <td className="py-3">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-red-700"
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
      </div>

      <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-slate-100 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Notification Events</h2>
        <p className="mt-1 text-sm text-slate-600">Latest email/SMS delivery lifecycle updates.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-slate-600">
              <tr>
                <th className="pb-2">Channel</th>
                <th className="pb-2">Provider</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Error</th>
                <th className="pb-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t border-slate-100">
                  <td className="py-3">{event.channel}</td>
                  <td className="py-3">{event.provider}</td>
                  <td className="py-3">{event.status}</td>
                  <td className="py-3">{event.error_message ?? "-"}</td>
                  <td className="py-3">{new Date(event.created_at).toLocaleString()}</td>
                </tr>
              ))}
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
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
