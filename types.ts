export interface NanoBananaRequest {
  interpretation: string;
  nano_banana_api_payload: {
    image_url: string; // Placeholder string
    task_type: 'RENOVATION' | 'STAGING' | 'DECLUTTER' | 'STYLE_TRANSFER';
    style?: string;
    objects_to_remove?: string[];
    description: string;
    quality: 'DRAFT' | 'STANDARD' | 'HIGH' | 'HIGH_DETAIL' | 'ULTRA_REALISTIC';
    consistency_check: boolean;
  };
}

export interface TransformationLog {
  title: string;
  message: string;
  status: 'loading' | 'success' | 'error';
  data?: any;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  pdfUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  country?: string; // Used for VAT calculation
  tier: 'FREE' | 'PREMIUM_2K' | 'ULTRA_4K';
  avatarUrl?: string;
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  nextBillingDate: string;
  paymentMethod?: {
    type: 'VISA' | 'MASTERCARD' | 'PAYPAL';
    last4?: string;
    email?: string; // For PayPal
  };
}

export interface SavedResult {
  id: string;
  originalImage: string;
  generatedImage: string;
  prompt: string;
  date: string;
  quality: string;
  tierUsed: string;
}