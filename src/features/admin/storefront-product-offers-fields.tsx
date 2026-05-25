"use client";

import { Button } from "@/components/ui/button";
import type {
  ProductPromoOffer,
  StorefrontSettings,
} from "@/types/storefront-settings";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function newOfferId() {
  return `offer-${Date.now().toString(36)}`;
}

type Props = {
  settings: StorefrontSettings;
  onChange: (productOffers: StorefrontSettings["productOffers"]) => void;
};

export function StorefrontProductOffersFields({ settings, onChange }: Props) {
  const productOffers = settings.productOffers;

  function patchOffers(updates: Partial<StorefrontSettings["productOffers"]>) {
    onChange({ ...productOffers, ...updates });
  }

  function updateItem(id: string, updates: Partial<ProductPromoOffer>) {
    patchOffers({
      items: productOffers.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  }

  function removeItem(id: string) {
    patchOffers({
      items: productOffers.items.filter((item) => item.id !== id),
    });
  }

  function addItem() {
    const nextOrder =
      productOffers.items.reduce(
        (max, item) => Math.max(max, item.sortOrder),
        -1
      ) + 1;
    const item: ProductPromoOffer = {
      id: newOfferId(),
      text: "",
      active: true,
      sortOrder: nextOrder,
    };
    patchOffers({ items: [...productOffers.items, item] });
  }

  function moveItem(id: string, direction: -1 | 1) {
    const sorted = [...productOffers.items].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    const index = sorted.findIndex((i) => i.id === id);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;
    const reordered = [...sorted];
    const a = reordered[index];
    const b = reordered[swapIndex];
    reordered[index] = { ...b, sortOrder: a.sortOrder };
    reordered[swapIndex] = { ...a, sortOrder: b.sortOrder };
    patchOffers({ items: reordered });
  }

  const sortedItems = [...productOffers.items].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div>
        <h3 className="text-sm font-semibold">Exciting offers (product pages)</h3>
        <p className="mt-1 text-xs text-muted">
          Promotional lines shown on every product page — free gifts, order
          thresholds, or linked coupon codes.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={productOffers.enabled}
          onChange={(e) => patchOffers({ enabled: e.target.checked })}
        />
        Enable exciting offers block
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          disabled={!productOffers.enabled}
          checked={productOffers.showOnPdp}
          onChange={(e) => patchOffers({ showOnPdp: e.target.checked })}
        />
        Show on product pages
      </label>
      <Field label="Section title">
        <input
          value={productOffers.title}
          disabled={!productOffers.enabled}
          onChange={(e) => patchOffers({ title: e.target.value })}
          placeholder="EXCITING OFFERS"
          className="h-10 w-full rounded-lg border border-border px-3 text-sm"
        />
      </Field>

      <div className="space-y-3">
        {sortedItems.map((item, index) => (
          <div
            key={item.id}
            className="space-y-3 rounded-lg border border-border bg-stone-50/80 p-4 dark:bg-stone-900/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted">
                Offer {index + 1}
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moveItem(item.id, -1)}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index === sortedItems.length - 1}
                  onClick={() => moveItem(item.id, 1)}
                >
                  Down
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.active}
                onChange={(e) =>
                  updateItem(item.id, { active: e.target.checked })
                }
              />
              Active
            </label>
            <Field label="Offer text">
              <input
                value={item.text}
                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                placeholder="Free Duffle Bag on all orders above ₹3999"
                className="h-10 w-full rounded-lg border border-border px-3 text-sm"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Min. order amount (₹, optional)">
                <input
                  type="number"
                  min={0}
                  value={item.minOrderAmount ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    updateItem(item.id, {
                      minOrderAmount:
                        raw === "" ? undefined : Math.max(0, Number(raw) || 0),
                    });
                  }}
                  placeholder="3999"
                  className="h-10 w-full rounded-lg border border-border px-3 text-sm"
                />
              </Field>
              <Field label="Coupon code (optional)">
                <input
                  value={item.couponCode ?? ""}
                  onChange={(e) =>
                    updateItem(item.id, {
                      couponCode: e.target.value.toUpperCase() || undefined,
                    })
                  }
                  placeholder="WELCOME10"
                  className="h-10 w-full rounded-lg border border-border px-3 text-sm uppercase"
                />
              </Field>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addItem}>
          Add offer
        </Button>
      </div>
    </div>
  );
}
