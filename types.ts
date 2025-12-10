
export interface HomeraAiRequest {
  interpretation: string;
  homera_ai_api_payload: {
    image_url: string;
    task_type: 'RENOVATION' | 'STAGING' | 'DECLUTTER' | 'STYLE_TRANSFER' | 'UPSCALE';
    style?: string;
    objects_to_remove?: string[];
    description: string;
    quality: 'DRAFT' | 'STANDARD' | 'HIGH' | 'HIGH_DETAIL' | 'ULTRA_REALISTIC';
    target_resolution: string;
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
  vatAmount: number;
  total: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  pdfUrl: string;
  items: Array<{ desc: string; amount: number }>;
}

export interface User {
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  country: string;
  role: 'user' | 'admin';
  tier: 'standard' | 'premium_2k' | 'ultra_4k' | 'ultra_realistic_16k';
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  nextBillingDate: string;
  createdAt: string;
  stripeCustomerId?: string;
  paymentMethod?: {
    type: 'VISA' | 'MASTERCARD' | 'PAYPAL';
    last4?: string;
    email?: string;
  };
}

export interface SavedResult {
  id: string;
  userId: string;
  originalImage: string;
  generatedImage: string;
  prompt: string;
  date: string;
  quality: string;
  resolution: string;
  tierUsed: string;
}