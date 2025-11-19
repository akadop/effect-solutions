import type { Metadata } from "next";
import { ReferenceList } from "@/components/ReferenceList";
import { getAllReferences } from "@/lib/mdx";
import { SITE_DEPLOYMENT_URL } from "@/constants/urls";

export const metadata: Metadata = {
  title: "References",
  description:
    "Effect Solutions reference guides for building Effect TypeScript applications",
  openGraph: {
    title: "Effect Solutions",
    description:
      "Effect Solutions reference guides for building Effect TypeScript applications",
    url: `${SITE_DEPLOYMENT_URL}/references`,
    siteName: "Effect Solutions",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Effect Solutions",
    description:
      "Effect Solutions reference guides for building Effect TypeScript applications",
  },
};

export default async function ReferencesPage() {
  const references = getAllReferences();

  return (
    <main className="mx-auto max-w-screen-md border-x border-neutral-800 flex-1 flex flex-col w-full min-h-[calc(100vh-8rem)]">
      <ReferenceList references={references} />

      {references.length === 0 && (
        <div className="px-6 py-20 text-center text-foreground/50">
          <p>No references available yet. Please check back soon.</p>
        </div>
      )}
    </main>
  );
}
