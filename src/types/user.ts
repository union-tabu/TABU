
export interface UserData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  email?: string;
  dob?: string;
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
