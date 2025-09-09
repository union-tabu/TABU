export interface Payment {
  id: string;
  userId: string;
  plan: 'monthly' | 'yearly';
  amount: number;
  status: 'success' | 'failed' | 'pending';
  createdAt: Date; // When the payment record was created
  paymentDate: Date | null; // When the payment was actually completed
  cf_payment_id: string | null; // Cashfree payment ID (set after successful payment)
  cf_order_id: string; // Cashfree order ID (set when order is created)
  updatedAt?: Date; // When the payment record was last updated
  
  // Additional fields for better tracking
  order_meta?: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
  };
  
  gateway_response?: {
    order_status: string; // PAID, FAILED, CANCELLED, etc.
    payment_method?: string; // CARD, UPI, NETBANKING, etc.
    bank_reference?: string;
    failure_reason?: string; // In case of failure
  };
}

// Response types for API functions
export interface CreateOrderResponse {
  success: boolean;
  payment_link?: string;
  order_id?: string;
  payment_session_id?: string;
  error?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status?: string;
  message?: string;
}

// Cashfree order status types
export type CashfreeOrderStatus = 
  | 'ACTIVE'    // Order is active and payment is pending
  | 'PAID'      // Payment is successful
  | 'EXPIRED'   // Order has expired
  | 'CANCELLED' // Order was cancelled
  | 'FAILED'    // Payment failed
  | 'TERMINATED'; // Order was terminated

// Internal payment status types
export type PaymentStatus = 'pending' | 'success' | 'failed';

// Plan types
export type PlanType = 'monthly' | 'yearly';

// User subscription interface (for reference)
export interface UserSubscription {
  status: 'active' | 'pending' | 'cancelled';
  plan: PlanType;
  renewalDate: Date;
  lastPaymentId?: string;
  lastPaymentDate?: Date;
  updatedAt: Date;
}

// export interface Payment {
//   id: string;
//   userId: string;
//   plan: 'monthly' | 'yearly';
//   amount: number;
//   status: 'success' | 'failed' | 'pending';
//   paymentDate: Date;
//   cf_payment_id: string;
//   cf_order_id: string;
// }
