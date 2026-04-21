import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">TaskGH Waitlist Admin</h1>
        <p className="mt-1 text-slate-600">Manage signups, exports, and spam cleanup.</p>
        <div className="mt-6">
          <AdminDashboard />
        </div>
      </div>
    </main>
  );
}
