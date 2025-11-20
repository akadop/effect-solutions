import { getAllDocs } from "./mdx";

export interface OgSpec {
  slug: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  tag?: string;
  label?: string;
  footLeft?: string;
  footRight?: string;
  badge?: string;
  accent?: string;
  background?: string;
}

function buildDocSpecs(): OgSpec[] {
  const docs = getAllDocs();
  return docs.map((doc) => ({
    slug: doc.slug,
    eyebrow: "EFFECT PLAYBOOK",
    tag: "DOCS",
    title: doc.title,
    subtitle:
      doc.description ?? "Best practices for applying Effect in production.",
    footLeft: doc.slug.replace(/-/g, " ").toUpperCase(),
    footRight: "effect.solutions",
    accent: "#8be8ff",
  }));
}

export function getAllOgSpecs(): OgSpec[] {
  return buildDocSpecs();
}

export function getOgSpecBySlug(slug: string): OgSpec | null {
  const specs = getAllOgSpecs();
  return specs.find((spec) => spec.slug === slug) ?? null;
}
