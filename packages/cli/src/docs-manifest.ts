import matter from "gray-matter";

// Import website docs
import DOC__00_INDEX from "../../website/docs/00-index.md" with { type: "text" };
import DOC__01_PROJECT_SETUP from "../../website/docs/01-project-setup.md" with { type: "text" };
import DOC__02_TSCONFIG from "../../website/docs/02-tsconfig.md" with { type: "text" };
import DOC__03_SERVICES_LAYERS from "../../website/docs/03-services-and-layers.md" with { type: "text" };
import DOC__04_EFFECT_STYLE from "../../website/docs/04-effect-style.md" with { type: "text" };
import DOC__05_DATA_TYPES from "../../website/docs/05-data-types.md" with { type: "text" };
import DOC__06_ERROR_HANDLING from "../../website/docs/06-error-handling.md" with { type: "text" };
import DOC__07_CONFIG from "../../website/docs/07-config.md" with { type: "text" };
import DOC__08_PROJECT_STRUCTURE from "../../website/docs/08-project-structure.md" with { type: "text" };
import DOC__09_INCREMENTAL_ADOPTION from "../../website/docs/09-incremental-adoption.md" with { type: "text" };

type DocMeta = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly body: string;
};

type RawDoc = {
  readonly filename: string;
  readonly source: string;
};

const RAW_DOCS: ReadonlyArray<RawDoc> = [
  { filename: "00-index.md", source: DOC__00_INDEX },
  { filename: "01-project-setup.md", source: DOC__01_PROJECT_SETUP },
  { filename: "02-tsconfig.md", source: DOC__02_TSCONFIG },
  { filename: "03-services-and-layers.md", source: DOC__03_SERVICES_LAYERS },
  { filename: "04-effect-style.md", source: DOC__04_EFFECT_STYLE },
  { filename: "05-data-types.md", source: DOC__05_DATA_TYPES },
  { filename: "06-error-handling.md", source: DOC__06_ERROR_HANDLING },
  { filename: "07-config.md", source: DOC__07_CONFIG },
  { filename: "08-project-structure.md", source: DOC__08_PROJECT_STRUCTURE },
  { filename: "09-incremental-adoption.md", source: DOC__09_INCREMENTAL_ADOPTION },
];

const filenameToSlug = (filename: string): string => {
  // Strip .md extension and numeric prefix (e.g., "01-project-setup.md" -> "project-setup")
  return filename.replace(/\.md$/, "").replace(/^\d+-/, "");
};

const stripFirstH1 = (content: string): string => {
  // Strip first H1 to match website behavior
  return content.replace(/^#\s+.*\n?/, "").trimStart();
};

const rewriteInternalLinks = (content: string): string => {
  // Rewrite internal links: /01-project-setup -> project-setup
  return content.replace(/\[([^\]]+)\]\(\/(\d+-)?([^)]+)\)/g, (_match, text, _prefix, slug) => {
    return `[${text}](${slug})`;
  });
};

const parseDocs = (): ReadonlyArray<DocMeta> => {
  const docs = RAW_DOCS.map(({ filename, source }) => {
    const { data, content } = matter(source);
    const slug = filenameToSlug(filename);

    // Skip drafts
    if (data.draft === true) {
      return null;
    }

    const title = data.title as string;
    const description = (data.description as string) || "";
    const order = (data.order as number) ?? 999;

    if (!title) {
      throw new Error(`Doc ${filename} missing title`);
    }

    return {
      slug,
      title,
      description,
      order,
      body: rewriteInternalLinks(stripFirstH1(content)).trimEnd(),
    } as const;
  }).filter((doc): doc is DocMeta => doc !== null);

  // Sort by order field
  return docs.sort((a, b) => a.order - b.order);
};

export const DOCS = parseDocs();

export const DOC_LOOKUP: Record<string, DocMeta> = DOCS.reduce(
  (acc, doc) => {
    acc[doc.slug] = doc;
    return acc;
  },
  {} as Record<string, DocMeta>,
);
