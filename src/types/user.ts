
export interface UserData {
  unionId?: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  email?: string;
  subscription?: {
    plan: 'monthly' | 'yearly';
    status: 'active' | 'inactive' | 'cancelled' | 'pending' | 'lapsed';
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
