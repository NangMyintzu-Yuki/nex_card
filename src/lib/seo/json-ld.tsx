// src/lib/seo/json-ld.tsx
// Structured data for public profile pages — improves rich results in search engines

import { APP_URL } from "@/lib/env";
import type { CategorySlug } from "@/lib/validators/template-schemas";

interface JsonLdProfileInput {
  slug: string;
  categorySlug: CategorySlug;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  jobTitle?: string | null;
  businessName?: string | null;
  weddingDate?: string | null;
  partner1?: string | null;
  partner2?: string | null;
}

function buildSchema(input: JsonLdProfileInput): Record<string, unknown> {
  const pageUrl = `${APP_URL}/${input.slug}`;
  const description =
    input.description ?? `${input.name}'s digital profile on NEX CARD.`;

  const base = {
    "@context": "https://schema.org",
    url: pageUrl,
    name: input.name,
    description,
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
  };

  switch (input.categorySlug) {
    case "digital-name-card":
      return {
        ...base,
        "@type": "ProfilePage",
        mainEntity: {
          "@type": "Person",
          name: input.name,
          ...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
          url: pageUrl,
          ...(input.imageUrl ? { image: input.imageUrl } : {}),
        },
      };
    case "portfolio":
      return {
        ...base,
        "@type": "ProfilePage",
        mainEntity: {
          "@type": "Person",
          name: input.name,
          description,
          url: pageUrl,
        },
      };
    case "business-ad":
      return {
        ...base,
        "@type": "WebPage",
        mainEntity: {
          "@type": "Organization",
          name: input.businessName ?? input.name,
          description,
          url: pageUrl,
          ...(input.imageUrl ? { logo: input.imageUrl } : {}),
        },
      };
    case "wedding-invitation":
      return {
        ...base,
        "@type": "WebPage",
        mainEntity: {
          "@type": "Event",
          name:
            input.partner1 && input.partner2
              ? `${input.partner1} & ${input.partner2}`
              : input.name,
          description,
          ...(input.weddingDate ? { startDate: input.weddingDate } : {}),
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          organizer: {
            "@type": "Person",
            name: input.name,
          },
        },
      };
    default:
      return { ...base, "@type": "WebPage" };
  }
}

export function ProfileJsonLd({ profile }: { profile: JsonLdProfileInput }) {
  const schema = buildSchema(profile);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
