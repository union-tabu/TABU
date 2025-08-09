
"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: August 4, 2024</p>

            <p>
              Telangana All Building Workers Union ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>

            <h2>Information We Collect</h2>
            <p>We may collect personal information from you in a variety of ways, including:</p>
            <ul>
              <li><strong>Personal Identification Information:</strong> Name, phone number, address, city, state, PIN code, profession, and profile picture that you provide when you register for an account.</li>
              <li><strong>Financial Information:</strong> Payment information for subscription services, which is processed through our third-party payment gateway, Razorpay. We do not store your full card details.</li>
              <li><strong>Referral Information:</strong> If you are referred by another member, we collect the referrer's phone number.</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Provide you with our services, including issuing a Union ID.</li>
              <li>Process your subscription payments and renewals.</li>
              <li>Communicate with you about your account or our services.</li>
              <li>Offer support and resolve disputes.</li>
              <li>Comply with legal obligations.</li>
            </ul>

            <h2>Sharing Your Information</h2>
            <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except in the following situations:</p>
            <ul>
              <li><strong>With Service Providers:</strong> We share information with third-party vendors, like Razorpay, who perform services for us or on our behalf, such as payment processing.</li>
              <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
            </ul>
             <p>The list of members on our website only displays your name, city, and a masked phone number to protect your privacy from the public.</p>


            <h2>Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>

            <h2>Your Rights</h2>
            <p>
              You have the right to access and update your personal information at any time through your profile page on our website. You may also request deletion of your account by contacting us, subject to our legal and contractual obligations.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please <a href="/contact">contact us</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
