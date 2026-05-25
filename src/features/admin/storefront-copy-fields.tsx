"use client";

import type {
  BrandCopy,
  HomepageCopy,
  HomepageSectionCopy,
  LabelsCopy,
  StorefrontSettings,
} from "@/types/storefront-settings";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-border px-3 text-sm";

function SectionFields({
  sectionKey,
  section,
  onChange,
  extra,
}: {
  sectionKey: string;
  section: HomepageSectionCopy;
  onChange: (value: HomepageSectionCopy) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Eyebrow (small label)">
        <input
          value={section.eyebrow}
          onChange={(e) => onChange({ ...section, eyebrow: e.target.value })}
          className={inputClass}
        />
      </Field>
      <Field label="Heading">
        <input
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          className={inputClass}
        />
      </Field>
      <Field label="Description (optional)">
        <textarea
          value={section.description ?? ""}
          onChange={(e) =>
            onChange({ ...section, description: e.target.value || undefined })
          }
          rows={2}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2"
        />
      </Field>
      <Field label="Link text (optional)">
        <input
          value={section.linkText ?? ""}
          onChange={(e) =>
            onChange({ ...section, linkText: e.target.value || undefined })
          }
          className={inputClass}
        />
      </Field>
      <Field label="Link URL (optional)">
        <input
          value={section.linkHref ?? ""}
          onChange={(e) =>
            onChange({ ...section, linkHref: e.target.value || undefined })
          }
          className={inputClass}
        />
      </Field>
      {extra}
    </div>
  );
}

type CopyAdminProps = {
  settings: StorefrontSettings;
  onPatch: <K extends keyof StorefrontSettings>(
    section: K,
    value: Partial<StorefrontSettings[K]>
  ) => void;
};

export function StorefrontBrandFields({ settings, onPatch }: CopyAdminProps) {
  const brand = settings.brand;
  return (
    <section className="card-premium space-y-4 p-6">
      <h2 className="text-lg font-semibold">Brand & announcement bar</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Store name">
          <input
            value={brand.name}
            onChange={(e) => onPatch("brand", { name: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Tagline">
          <input
            value={brand.tagline}
            onChange={(e) => onPatch("brand", { tagline: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Announcement text" hint="Top bar on every page">
          <input
            value={brand.announcement}
            onChange={(e) => onPatch("brand", { announcement: e.target.value })}
            className={`${inputClass} sm:col-span-2`}
          />
        </Field>
        <Field label="Announcement link text">
          <input
            value={brand.announcementLinkText}
            onChange={(e) =>
              onPatch("brand", { announcementLinkText: e.target.value })
            }
            className={inputClass}
          />
        </Field>
        <Field label="Announcement link URL">
          <input
            value={brand.announcementHref}
            onChange={(e) => onPatch("brand", { announcementHref: e.target.value })}
            className={inputClass}
          />
        </Field>
      </div>
    </section>
  );
}

export function StorefrontHomepageFields({ settings, onPatch }: CopyAdminProps) {
  const hp = settings.homepage;

  function patchHome<K extends keyof HomepageCopy>(
    key: K,
    value: HomepageCopy[K]
  ) {
    onPatch("homepage", { ...hp, [key]: value });
  }

  const sections: {
    key: keyof HomepageCopy;
    title: string;
    extra?: (s: HomepageCopy[keyof HomepageCopy]) => React.ReactNode;
  }[] = [
    { key: "videos", title: "Video carousel" },
    { key: "featuredCategories", title: "Featured categories" },
    { key: "trending", title: "Trending products" },
    { key: "collections", title: "Collections showcase" },
    { key: "shopByCategory", title: "Shop by category grid" },
    { key: "bestSellers", title: "Best sellers" },
    { key: "testimonials", title: "Testimonials" },
    { key: "instagram", title: "Instagram / gallery" },
    { key: "newsletter", title: "Newsletter" },
  ];

  return (
    <section className="card-premium space-y-8 p-6">
      <div>
        <h2 className="text-lg font-semibold">Homepage section headings</h2>
        <p className="mt-1 text-sm text-muted">
          Eyebrow, title, and optional description for each storefront block.
        </p>
      </div>
      {sections.map(({ key, title }) => (
        <div
          key={key}
          className="space-y-3 border-t border-border pt-6 first:border-t-0 first:pt-0"
        >
          <h3 className="text-sm font-semibold">{title}</h3>
          <SectionFields
            sectionKey={key}
            section={hp[key] as HomepageSectionCopy}
            onChange={(value) => patchHome(key, value as HomepageCopy[typeof key])}
            extra={
              key === "videos" ? (
                <Field label="Slide CTA button">
                  <input
                    value={hp.videos.learnMore}
                    onChange={(e) =>
                      patchHome("videos", { ...hp.videos, learnMore: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
              ) : key === "collections" ? (
                <Field label="Collection card link text">
                  <input
                    value={hp.collections.exploreCta}
                    onChange={(e) =>
                      patchHome("collections", {
                        ...hp.collections,
                        exploreCta: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              ) : key === "newsletter" ? (
                <>
                  <Field label="Subscribe button">
                    <input
                      value={hp.newsletter.subscribeButton}
                      onChange={(e) =>
                        patchHome("newsletter", {
                          ...hp.newsletter,
                          subscribeButton: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Success message">
                    <input
                      value={hp.newsletter.successMessage}
                      onChange={(e) =>
                        patchHome("newsletter", {
                          ...hp.newsletter,
                          successMessage: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email placeholder">
                    <input
                      value={hp.newsletter.emailPlaceholder}
                      onChange={(e) =>
                        patchHome("newsletter", {
                          ...hp.newsletter,
                          emailPlaceholder: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : null
            }
          />
        </div>
      ))}
    </section>
  );
}

const LABEL_FIELDS: { key: keyof LabelsCopy; label: string; hint?: string }[] = [
  { key: "addToCart", label: "Add to cart (PDP)" },
  { key: "outOfStock", label: "Out of stock (PDP)" },
  { key: "learnMore", label: "Learn more" },
  { key: "shopNow", label: "Shop now" },
  { key: "viewAll", label: "View all" },
  { key: "shopTrending", label: "Shop trending" },
  { key: "viewAllBestSellers", label: "View all best sellers" },
  { key: "viewAllCategories", label: "View all categories" },
  { key: "exploreCollection", label: "Explore collection (card)" },
  { key: "discover", label: "Discover (lifestyle banners)" },
  { key: "newBadge", label: "“New” product badge" },
  { key: "bestsellerBadge", label: "“Best seller” badge" },
  { key: "subscribe", label: "Newsletter subscribe" },
  {
    key: "productsCount",
    label: "Product count (plural)",
    hint: "Use {{count}} — e.g. “{{count}} products”",
  },
  {
    key: "productCount",
    label: "Product count (singular)",
    hint: "Use {{count}} — e.g. “{{count}} product”",
  },
];

export function StorefrontLabelsFields({ settings, onPatch }: CopyAdminProps) {
  return (
    <section className="card-premium space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold">Buttons & labels</h2>
        <p className="mt-1 text-sm text-muted">
          Shared CTAs and badges across the storefront. Product{" "}
          <strong>names</strong> are edited per item under{" "}
          <a href="/admin/products" className="underline">
            Products
          </a>
          ; category and collection titles under{" "}
          <a href="/admin/categories" className="underline">
            Categories
          </a>{" "}
          and{" "}
          <a href="/admin/collections" className="underline">
            Collections
          </a>
          .
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {LABEL_FIELDS.map(({ key, label, hint }) => (
          <Field key={key} label={label} hint={hint}>
            <input
              value={settings.labels[key]}
              onChange={(e) =>
                onPatch("labels", { [key]: e.target.value } as Partial<LabelsCopy>)
              }
              className={inputClass}
            />
          </Field>
        ))}
      </div>
    </section>
  );
}
