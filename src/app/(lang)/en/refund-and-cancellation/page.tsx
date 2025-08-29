"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function RefundAndCancellationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
           <Card className="max-w-4xl mx-auto shadow-lg">
             <CardHeader>
                <h1 className="text-4xl font-bold text-gray-900">Refund and Cancellation Policy</h1>
                <p className="text-sm text-muted-foreground">Last updated: August 5, 2024</p>
             </CardHeader>
             <CardContent className="space-y-6 text-lg text-gray-700">
                <p>
                Thank you for being a member of the Telangana All Building Workers Union (TABU). This policy outlines the terms regarding the refund and cancellation of your membership subscription.
                </p>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">1. Membership Fees</h2>
                    <p>All membership subscription fees paid to TABU are non-refundable. The fees collected are used to fund the union's activities, support services for members, and cover administrative costs.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">2. Cancellation of Membership</h2>
                    <p>You may choose to cancel your membership at any time. To cancel, please contact our support team through the information provided on our <a href="/en/contact" className="text-primary hover:underline">Contact Us</a> page. Please note that cancelling your membership will not result in a refund for any fees already paid, including for the current subscription period (monthly or yearly).</p>
                    <p>Upon cancellation, your membership will remain active until the end of your current paid subscription period. After that, you will no longer have access to member-only benefits.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">3. No Prorated Refunds</h2>
                    <p>We do not offer prorated refunds for any unused portion of your subscription term, whether you have a monthly or yearly plan. Once a payment is made, it is final.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">4. Changes to this Policy</h2>
                    <p>
                    We reserve the right to modify this Refund and Cancellation Policy at any time. Any changes will be posted on this page. Your continued use of our services after any such changes constitutes your acceptance of the new policy.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">Contact Us</h2>
                    <p>
                    If you have any questions about this policy, please <a href="/en/contact" className="text-primary hover:underline">contact us</a>.
                    </p>
                </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
