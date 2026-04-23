import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminAuth();

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <img src="/logo.png" alt="TaskGH" className="h-8 w-auto" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">TaskGH Waitlist Admin</h1>
        <p className="mt-1 text-slate-600">Manage signups, exports, and spam cleanup.</p>
        <div className="mt-6">
          <AdminDashboard />
        </div>
      </div>
    </main>
  );
}
