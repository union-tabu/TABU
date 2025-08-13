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
                <p className="text-sm text-muted-foreground">Last updated: August 4, 2024</p>
             </CardHeader>
             <CardContent className="space-y-6 text-lg text-gray-700">
                <p>
                Welcome to the Telangana All Building Workers Union (TABU). By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions. Please review them carefully.
                </p>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">1. Membership</h2>
                    <p><strong>Eligibility:</strong> Membership is open to any individual working in the building and construction sector within Telangana.</p>
                    <p><strong>Registration:</strong> To become a member, you must complete the registration process, provide accurate information, and pay the applicable membership fees.</p>
                    <p><strong>Dues:</strong> Members are required to pay subscription fees (monthly or annually) to maintain an active status. Failure to pay dues may result in the suspension or termination of your membership and associated benefits.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">2. Use of Services</h2>
                    <p>You agree to use our services only for lawful purposes. You are responsible for all activities that occur under your account. You agree not to use the service to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Harass, abuse, or harm another person.</li>
                        <li>Provide false or misleading information.</li>
                        <li>Engage in any activity that disrupts or interferes with our services.</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">3. Termination</h2>
                    <p>We reserve the right to suspend or terminate your membership at our discretion if you violate these terms or engage in conduct that is harmful to the union or its members. You may terminate your membership at any time by contacting us.</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">4. Disclaimer of Warranties</h2>
                    <p>Our services are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that the services will be uninterrupted or error-free.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">5. Limitation of Liability</h2>
                    <p>The Telangana All Building Workers Union, its directors, and its representatives will not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our services.</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">6. Changes to Terms</h2>
                    <p>We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this page. Your continued use of the service after any such changes constitutes your acceptance of the new terms.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3">7. Governing Law</h2>
                    <p>These terms shall be governed by and construed in accordance with the laws of Telangana, India, without regard to its conflict of law provisions.</p>
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
