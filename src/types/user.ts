export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  subscription: {
    plan: 'monthly' | 'yearly';
    status: 'active' | 'inactive' | 'cancelled';
    renewalDate: {
      seconds: number;
      nanoseconds: number;
    };
  };
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}
