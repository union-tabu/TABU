export interface Payment {
  id: string;
  userId: string;
  plan: 'monthly' | 'yearly';
  amount: number;
  status: 'success' | 'failed' | 'pending';
  paymentDate: Date;
  razorpay_payment_id: string;
}
