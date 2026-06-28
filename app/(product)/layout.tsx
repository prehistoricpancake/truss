import { ProductNav } from "@/components/ProductNav";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-product flex">
      <ProductNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
