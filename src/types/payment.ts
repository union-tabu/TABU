export interface Payment {
  id: string;
  userId: string;
  plan: 'monthly' | 'yearly';
  amount: number;
  status: 'success' | 'failed' | 'pending';
  paymentDate: Date;
  cf_payment_id: string;
  cf_order_id: string;
}
