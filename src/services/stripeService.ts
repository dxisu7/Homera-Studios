import { subscriptionPlans } from "../config/subscriptions";

// This would typically interact with your backend which interacts with Stripe API
export const createCheckoutSession = async (priceId: string, userId: string) => {
  console.log(`[Stripe] Creating checkout session for ${priceId} (User: ${userId})`);
  
  return new Promise<{ url: string }>((resolve) => {
    setTimeout(() => {
      // In a real app, this returns the Stripe Checkout URL
      // For demo, we simulate a success redirect logic or just resolve
      resolve({ url: `https://checkout.stripe.com/mock/${priceId}?client_reference_id=${userId}` });
    }, 1000);
  });
};

export const getPortalUrl = async (userId: string) => {
  console.log(`[Stripe] Fetching customer portal for ${userId}`);
  return "https://billing.stripe.com/p/session/mock_portal";
};

export const calculateVat = (price: number, country: string): number => {
  const VAT_RATES: Record<string, number> = {
    'Netherlands': 21,
    'Germany': 19,
    'United Kingdom': 20,
    'France': 20,
    'Belgium': 21,
    'Spain': 21,
    'United States': 0,
  };
  const rate = VAT_RATES[country] || 20; // Default 20%
  return price * (rate / 100);
};
