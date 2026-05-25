"use client";

import { Button } from "@/components/ui/button";
import { TRUST_BENEFIT_ICON_OPTIONS } from "@/lib/trust-benefits";
import {
  DEFAULT_TRUST_BENEFIT_ITEMS,
  type StorefrontSettings,
  type TrustBenefitConfig,
  type TrustBenefitIconKey,
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

type Props = {
  delivery: StorefrontSettings["delivery"];
  onPatch: (value: Partial<StorefrontSettings["delivery"]>) => void;
};

export function StorefrontDeliveryFields({ delivery, onPatch }: Props) {
  const { countdown, trustBadges } = delivery;
  const trustItems = trustBadges.items ?? DEFAULT_TRUST_BENEFIT_ITEMS;

  function patchCountdown(value: Partial<typeof countdown>) {
    onPatch({ countdown: { ...countdown, ...value } });
  }

  function patchTrustBadges(value: Partial<typeof trustBadges>) {
    onPatch({ trustBadges: { ...trustBadges, ...value } });
  }

  function updateTrustItem(
    id: string,
    updates: Partial<TrustBenefitConfig>
  ) {
    patchTrustBadges({
      items: trustItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  }

  function removeTrustItem(id: string) {
    if (trustItems.length <= 1) return;
    patchTrustBadges({
      items: trustItems.filter((item) => item.id !== id),
    });
  }

  function addTrustItem() {
    const id = `benefit-${Date.now()}`;
    patchTrustBadges({
      items: [
        ...trustItems,
        {
          id,
          title: "New benefit",
          subtitle: "",
          icon: "truck",
          enabled: true,
        },
      ],
    });
  }

  function resetTrustItems() {
    patchTrustBadges({ items: DEFAULT_TRUST_BENEFIT_ITEMS });
  }

  return (
    <section className="card-premium space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold">Delivery &amp; trust badges</h2>
        <p className="mt-1 text-sm text-muted">
          Countdown timer on product pages and benefit icons on the homepage,
          product page, and checkout.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={delivery.showOnPdp}
          onChange={(e) => onPatch({ showOnPdp: e.target.checked })}
        />
        Show delivery block on product pages
      </label>
      <Field label="Estimate text (shown below countdown)">
        <input
          value={delivery.estimateText}
          onChange={(e) => onPatch({ estimateText: e.target.value })}
          className="h-10 w-full rounded-lg border border-border px-3 text-sm"
        />
      </Field>

      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">Order countdown timer</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={countdown.enabled}
            onChange={(e) => patchCountdown({ enabled: e.target.checked })}
          />
          Show &quot;Order today within…&quot; countdown on product pages
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Order cutoff (hour, 0–23)">
            <input
              type="number"
              min={0}
              max={23}
              value={countdown.cutoffHour}
              onChange={(e) =>
                patchCountdown({
                  cutoffHour: Math.min(
                    23,
                    Math.max(0, Number(e.target.value) || 0)
                  ),
                })
              }
              className="h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </Field>
          <Field label="Order cutoff (minute, 0–59)">
            <input
              type="number"
              min={0}
              max={59}
              value={countdown.cutoffMinute}
              onChange={(e) =>
                patchCountdown({
                  cutoffMinute: Math.min(
                    59,
                    Math.max(0, Number(e.target.value) || 0)
                  ),
                })
              }
              className="h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </Field>
          <Field label="Earliest delivery (days from order day)">
            <input
              type="number"
              min={1}
              max={30}
              value={countdown.minDays}
              onChange={(e) =>
                patchCountdown({
                  minDays: Math.max(1, Number(e.target.value) || 1),
                })
              }
              className="h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </Field>
          <Field label="Latest delivery (days from order day)">
            <input
              type="number"
              min={1}
              max={45}
              value={countdown.maxDays}
              onChange={(e) =>
                patchCountdown({
                  maxDays: Math.max(
                    countdown.minDays,
                    Number(e.target.value) || 1
                  ),
                })
              }
              className="h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </Field>
        </div>
        <p className="text-xs text-muted">
          Example: cutoff 17:00 with 5–7 days → delivery between five and seven
          calendar days after the order day (today before cutoff, tomorrow
          after).
        </p>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Trust benefit icons</h3>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addTrustItem}>
              Add benefit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetTrustItems}
            >
              Reset to defaults
            </Button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={trustBadges.enabled}
            onChange={(e) => patchTrustBadges({ enabled: e.target.checked })}
          />
          Enable trust badges site-wide
        </label>
        <p className="text-xs text-muted">Show on:</p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={!trustBadges.enabled}
              checked={trustBadges.showOnHomepage}
              onChange={(e) =>
                patchTrustBadges({ showOnHomepage: e.target.checked })
              }
            />
            Homepage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={!trustBadges.enabled}
              checked={trustBadges.showOnPdp}
              onChange={(e) =>
                patchTrustBadges({ showOnPdp: e.target.checked })
              }
            />
            Product page
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={!trustBadges.enabled}
              checked={trustBadges.showOnCheckout}
              onChange={(e) =>
                patchTrustBadges({ showOnCheckout: e.target.checked })
              }
            />
            Checkout
          </label>
        </div>

        <ul className="space-y-4">
          {trustItems.map((item, index) => (
            <li
              key={item.id}
              className="space-y-3 rounded-xl border border-border bg-stone-50/80 p-4 dark:bg-stone-900/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted">
                  Benefit {index + 1}
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) =>
                        updateTrustItem(item.id, { enabled: e.target.checked })
                      }
                    />
                    Visible
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={trustItems.length <= 1}
                    onClick={() => removeTrustItem(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title">
                  <input
                    value={item.title}
                    onChange={(e) =>
                      updateTrustItem(item.id, { title: e.target.value })
                    }
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm"
                  />
                </Field>
                <Field label="Subtitle">
                  <input
                    value={item.subtitle}
                    onChange={(e) =>
                      updateTrustItem(item.id, { subtitle: e.target.value })
                    }
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm"
                  />
                </Field>
                <Field label="Icon">
                  <select
                    value={item.icon}
                    onChange={(e) =>
                      updateTrustItem(item.id, {
                        icon: e.target.value as TrustBenefitIconKey,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    {TRUST_BENEFIT_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
