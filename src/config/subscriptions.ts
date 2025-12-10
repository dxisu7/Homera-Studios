export interface SubscriptionPlan {
  id: string;
  name: string;
  resolution: string;
  priceExVat: number;
  qualityKey: 'standard' | '2k' | '4k' | '16k';
  features: string[];
  stripePriceId?: string; // Placeholder for Stripe integration
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "standard",
    name: "Standard (1080p)",
    resolution: "1920×1080",
    priceExVat: 0,
    qualityKey: "standard",
    features: [
      "Standard AI visualisation",
      "Auto-upscaling to 1080p",
      "Web Quality Downloads"
    ]
  },
  {
    id: "premium_2k",
    name: "Premium 2K (1440p)",
    resolution: "2560×1440",
    priceExVat: 24.99,
    qualityKey: "2k",
    features: [
      "High-quality visualisation",
      "Auto-upscaling to 1440p",
      "Commercial License",
      "Priority Rendering"
    ]
  },
  {
    id: "ultra_4k",
    name: "Ultra 4K (2160p)",
    resolution: "3840×2160",
    priceExVat: 34.99,
    qualityKey: "4k",
    features: [
      "Ultra-high quality rendering",
      "Auto-upscaling to 2160p",
      "Dedicated GPU Access",
      "No Watermark"
    ]
  },
  {
    id: "ultra_realistic_16k",
    name: "Ultra-Realistic 16K",
    resolution: "15369×8640",
    priceExVat: 99.00,
    qualityKey: "16k",
    features: [
      "Flagship 16K Resolution",
      "Ultra-realistic engine",
      "Instant Processing",
      "24/7 Priority Support"
    ]
  }
];
