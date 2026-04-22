import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 flex flex-col items-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <img src="/logo.png" alt="TaskGH" className="h-12 w-auto" />
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
