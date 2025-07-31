
export interface UserData {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  email?: string;
  subscription?: {
    plan: 'monthly' | 'yearly';
    status: 'active' | 'inactive' | 'cancelled' | 'not subscribed' | 'lapsed';
    renewalDate: {
      seconds: number;
      nanoseconds: number;
    };
    lastPaymentId?: string;
    updatedAt?: {
      seconds: number;
      nanoseconds: number;
    };
  };
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}
