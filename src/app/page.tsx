import { getServerSession } from "@/lib/auth/session";
import LandingContent from "./_components/landing-content";

export default async function LandingPage() {
  const session = await getServerSession();
  const isLoggedIn = !!session;

  return <LandingContent isLoggedIn={isLoggedIn} />;
}
