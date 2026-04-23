import { SuccessView } from "@/components/success-view";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const referralUrl = code ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/?ref=${code}` : "";

  return <SuccessView referralUrl={referralUrl} />;
}
