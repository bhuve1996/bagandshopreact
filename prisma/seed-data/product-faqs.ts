/** Sample product FAQs — keyed by catalog product slug. */
export type ProductFaqSeed = { question: string; answer: string };

export const seedProductFaqsBySlug: Record<string, ProductFaqSeed[]> = {
  "multifold-led-makeup-mirror": [
    {
      question: "Can I travel with this mirror?",
      answer:
        "Yes — its foldable design and compact size make it travel-friendly for suitcases and carry-ons.",
    },
    {
      question: "What magnification levels are available?",
      answer: "You get 1×, 2×, and 3× magnification options in one mirror kit.",
    },
    {
      question: "Does it come with built-in lighting?",
      answer:
        "Yes — LED lighting with touch control for three colour temperature modes.",
    },
    {
      question: "Is it suitable for professional salon use?",
      answer:
        "Yes — large viewing panels, quality lighting, and a foldable format work well in salons.",
    },
    {
      question: "How do I power the lights?",
      answer:
        "Depending on your variant, power may be via USB or batteries — check your order details.",
    },
  ],
  "portable-camping-gas-stove": [
    {
      question: "Is the gas canister included?",
      answer: "No — butane canisters are sold separately at most outdoor retailers.",
    },
    {
      question: "What type of gas canister does it use?",
      answer: "Standard butane canisters commonly available in stores across India.",
    },
    {
      question: "Can it be used indoors?",
      answer:
        "Outdoor use is recommended for ventilation and safety. Do not use in enclosed spaces.",
    },
    {
      question: "How do I ignite the stove?",
      answer:
        "Connect the canister, open the valve, and press the built-in piezo ignition button.",
    },
    {
      question: "Is it suitable for large cookware?",
      answer:
        "The wide support frame fits medium to large pots and pans securely.",
    },
  ],
  "wall-mount-mop-grippers": [
    {
      question: "How many tools can each gripper hold?",
      answer:
        "Each gripper holds 1–2 tools depending on handle thickness.",
    },
    {
      question: "What is the weight capacity?",
      answer: "Each gripper supports up to 5 kg when mounted correctly.",
    },
    {
      question: "How is it installed?",
      answer:
        "Mount with included screws or heavy-duty adhesive strips on a clean, dry surface.",
    },
    {
      question: "Is it suitable for outdoor use?",
      answer:
        "Yes — durable materials suit garages, balconies, and covered outdoor areas.",
    },
  ],
  "multifunctional-electric-food-heating-glass-tray": [
    {
      question: "Can I place metal or glass dishes on the tray?",
      answer:
        "Yes — heat-safe stainless steel, ceramic, and glass dishes are supported.",
    },
    {
      question: "How long can food stay warm?",
      answer:
        "Food stays warm for hours at a safe serving temperature without overcooking.",
    },
    {
      question: "Is it safe for daily home use?",
      answer:
        "Yes — designed for family meals, parties, and buffet-style serving at home.",
    },
  ],
  "mini-washing-machine": [
    {
      question: "What can I wash in the mini washer?",
      answer:
        "Ideal for innerwear, socks, masks, baby clothes, and other small delicate loads.",
    },
    {
      question: "Does it need plumbing?",
      answer:
        "No installation or fixed plumbing — add water and detergent, run a cycle, then rinse.",
    },
    {
      question: "Is it safe for delicate fabrics?",
      answer:
        "High-frequency turbine washing is gentle on delicate items compared to hand scrubbing.",
    },
  ],
  "wireless-portable-magnetic-speaker": [
    {
      question: "How do I connect my phone?",
      answer: "Pair via Bluetooth from your device settings — no app required.",
    },
    {
      question: "Does it have a built-in microphone?",
      answer:
        "Yes — use it for speakerphone calls when connected over Bluetooth.",
    },
    {
      question: "How long does the battery last?",
      answer:
        "Typical playback is several hours per charge depending on volume and lighting modes.",
    },
  ],
};
