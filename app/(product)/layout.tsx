import { auth } from "@/lib/auth";
import { getCreator } from "@/lib/db";
import { ProductNav } from "@/components/ProductNav";

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const creator = session?.user?.id ? await getCreator(session.user.id) : null;

  return (
    <div className="min-h-screen bg-bg-product flex">
      <ProductNav
        creatorName={creator?.name}
        creatorEmail={creator?.email}
        connectedPlatforms={creator?.connectedPlatforms ?? []}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
