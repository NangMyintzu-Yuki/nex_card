import { getServerSession } from "@/lib/auth/session";
import LandingContent from "./_components/landing-content";
import { getSettings } from "@/lib/settings";

export default async function LandingPage() {
  const session = await getServerSession();
  const isLoggedIn = !!session;
  const { preorder_mode: preorderMode } = await getSettings();

  return <LandingContent isLoggedIn={isLoggedIn} preorderMode={preorderMode} />;
}
