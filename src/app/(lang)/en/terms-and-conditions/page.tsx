"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
           <Card className="max-w-4xl mx-auto shadow-lg">
             <CardHeader>
                <h1 className="text-4xl font-bold text-gray-900">Terms and Conditions</h1>
                <p className="text-sm text-muted-foreground">Last updated: August 5, 2024</p>
             </CardHeader>
             <CardContent className="space-y-8 text-lg text-gray-700">
                <p>
                Welcome to the Telangana All Building Workers Union (TABU). By becoming a member, you agree to comply with and be bound by the following terms and conditions. This union has been established to protect the rights of construction workers.
                </p>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">1. Union Objectives</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To negotiate with builders, contractors, and companies for better wages and worker benefits.</li>
                        <li>To intervene and fight for a worker's rights if they are not paid properly or face issues with wages.</li>
                        <li>To provide support in case of accidents, medical needs, or other sudden problems faced by workers and their families.</li>
                        <li>To ensure collective bargaining power, so that no worker is underpaid or exploited.</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">2. Membership and Dues</h2>
                    <p><strong>Eligibility:</strong> Membership is open to any individual working in the building and construction sector within Telangana.</p>
                    <p><strong>Dues:</strong> Every worker must pay their monthly or annual membership fees to maintain an active status and continue receiving benefits. Failure to pay dues may result in the suspension of your membership.</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">3. Member Responsibilities</h2>
                     <p>Workers must not approach contractors or builders individually for wage negotiations. Instead, they should work through the union to ensure fair wages and equal treatment for all members.</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">4. Union Wage Recommendations</h2>
                    <p>The union will continue to fight for fair wages for all building workers. As per union standards, the recommended monthly wages are:</p>
                     <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Mason:</strong> ₹12,000 per month</li>
                        <li><strong>Midiyam (Skilled Worker):</strong> ₹10,000 per month</li>
                        <li><strong>Helper:</strong> ₹8,000 per month</li>
                        <li><strong>New Worker:</strong> ₹7,000 per month</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">5. Termination</h2>
                    <p>We reserve the right to suspend or terminate your membership if you violate these terms or engage in conduct that is harmful to the union's objectives. You may cancel your membership at any time by contacting us.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">6. Changes to Terms</h2>
                    <p>We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this page.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">Contact Us</h2>
                    <p>If you have any questions about these Terms and Conditions, please <a href="/en/contact" className="text-primary hover:underline">contact us</a>.</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
