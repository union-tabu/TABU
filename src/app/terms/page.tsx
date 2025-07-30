
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white p-8 sm:p-12 rounded-lg shadow-md max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose max-w-none text-gray-700">
            <p>Welcome to the Telangana All Building Workers Union (TABU). These terms and conditions outline the rules and regulations for the use of our website and services.</p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing this website and using our services, you accept these terms and conditions in full. Do not continue to use TABU's website if you do not accept all of the terms and conditions stated on this page.</p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Membership</h2>
            <p>Membership is open to all building and construction workers in Telangana. Registration requires accurate information, and membership is subject to the payment of dues as outlined on the subscription page. The Union reserves the right to approve or deny membership applications.</p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Use of Website</h2>
            <p>You must not use this website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website; or in any way which is unlawful, illegal, fraudulent, or harmful.</p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Dues and Payments</h2>
            <p>All subscription payments are processed through a secure third-party payment gateway. The Union is not responsible for any issues arising from the payment gateway. Subscription fees are non-refundable. Reactivation fees may apply for lapsed memberships as described on the subscription page.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Limitation of Liability</h2>
            <p>The information on this website is provided "as is" without any representations or warranties, express or implied. While we endeavor to ensure the information is correct, we do not warrant its completeness or accuracy. The Union will not be liable for any direct or indirect loss or damage arising under these terms and conditions or in connection with our website.</p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Changes to Terms</h2>
            <p>The Union reserves the right to revise these terms and conditions at any time. Revised terms and conditions will apply to the use of this website from the date of the publication of the revised terms and conditions on this website.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
