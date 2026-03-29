/**
 * Terms of Service
 * 
 * Legal terms and conditions for using Wasel platform.
 */

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { FileText } from 'lucide-react';
import { LegalLayout } from './LegalLayout';

export function TermsOfService() {
  const handleDownload = () => {
    // In production, generate PDF
    alert('PDF download functionality - integrate with PDF generation service');
  };

  return (
    <LegalLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <Button variant="outline" onClick={handleDownload}>
            <FileText className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Last Updated: January 2, 2026
        </p>

        <Card>
        <CardContent className="pt-6 prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Wasel ("the Platform", "we", "us", or "our"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, you should not use this platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p>
              Wasel provides a technology platform that connects passengers with independent transportation providers (drivers) and delivery services. We do not provide transportation or delivery services directly, and we are not a transportation carrier.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">2.1 Services Offered</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ride-sharing and taxi services</li>
              <li>Package and food delivery</li>
              <li>Scheduled trip booking</li>
              <li>Corporate account management</li>
              <li>In-app payment processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Account Creation</h3>
            <p>
              To use our services, you must create an account by providing accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Account Requirements</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Must be at least 18 years of age</li>
              <li>Provide valid email address and phone number</li>
              <li>Agree to identity verification when required</li>
              <li>Maintain accurate account information</li>
            </ul>
            <h3 className="text-xl font-semibold mt-4 mb-2">3.3 Account Suspension</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose safety risks to other users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Payment Terms</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Pricing</h3>
            <p>
              Trip fares are calculated based on distance, time, demand, and service type. Estimated fares are provided before booking, but final fares may vary based on actual trip conditions.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Payment Methods</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Credit/Debit cards (processed through Stripe)</li>
              <li>Wasel Wallet (prepaid balance)</li>
              <li>Corporate account billing</li>
            </ul>
            <h3 className="text-xl font-semibold mt-4 mb-2">4.3 Service Fees</h3>
            <p>
              Wasel charges a service fee (typically 20%) on each transaction to maintain and improve the platform. This fee is included in the quoted fare.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Cancellation Policy</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Passenger Cancellations</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free cancellation before driver assignment</li>
              <li>10% fee if driver assigned but not en route</li>
              <li>50% fee if driver is on the way to pickup</li>
              <li>No refund once trip has started</li>
            </ul>
            <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Driver Cancellations</h3>
            <p>
              Drivers may cancel trips, but excessive cancellations may result in account penalties. Passengers are not charged for driver-initiated cancellations.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">5.3 Scheduled Trips</h3>
            <p>
              Scheduled trips can be cancelled free of charge if done 60+ minutes before pickup time. Cancellations within 60 minutes follow standard cancellation fees.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. User Conduct</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">6.1 Prohibited Activities</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harassment, discrimination, or abusive behavior</li>
              <li>Fraudulent activities or payment disputes</li>
              <li>Violation of local laws or regulations</li>
              <li>Damage to driver vehicles or property</li>
              <li>Creating multiple accounts to abuse promotions</li>
              <li>GPS spoofing or location manipulation</li>
            </ul>
            <h3 className="text-xl font-semibold mt-4 mb-2">6.2 Safety Requirements</h3>
            <p>
              All users must comply with safety guidelines, including wearing seatbelts, following local traffic laws, and reporting unsafe conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Driver Requirements</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">7.1 Eligibility</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Valid driver's license</li>
              <li>Vehicle registration and insurance</li>
              <li>Background check clearance</li>
              <li>Identity verification</li>
              <li>Minimum age of 21 years</li>
            </ul>
            <h3 className="text-xl font-semibold mt-4 mb-2">7.2 Earnings</h3>
            <p>
              Drivers earn 80% of the trip fare (after service fee). Tips are paid 100% to drivers. Payouts are processed weekly via bank transfer or Wasel Wallet.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Liability and Insurance</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">8.1 Platform Liability</h3>
            <p>
              Wasel acts as a technology platform connecting users with independent service providers. We are not liable for the actions, conduct, or services provided by drivers or passengers.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">8.2 Insurance Coverage</h3>
            <p>
              All drivers must maintain valid auto insurance. Wasel provides supplemental insurance coverage during active trips as required by local regulations.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">8.3 Lost Items</h3>
            <p>
              While we facilitate lost item recovery, Wasel is not responsible for personal belongings left in vehicles. Users should use the in-app lost item report feature.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Dispute Resolution</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">9.1 Filing Disputes</h3>
            <p>
              Users can file disputes through the Dispute Center within 48 hours of trip completion. Our team reviews all disputes within 24-48 hours.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">9.2 Resolution Process</h3>
            <p>
              Disputes are reviewed by our support team. Resolutions may include partial or full refunds, account adjustments, or other remedies as deemed appropriate.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">9.3 Arbitration</h3>
            <p>
              For disputes that cannot be resolved through our dispute center, parties agree to binding arbitration under the laws of the Hashemite Kingdom of Jordan.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Privacy and Data</h2>
            <p>
              Your use of Wasel is also governed by our Privacy Policy. We collect and use data as described in our Privacy Policy to provide and improve our services.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">10.1 Location Data</h3>
            <p>
              We collect location data during trips for routing, safety, and service quality purposes. Location tracking can be disabled when not using the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Intellectual Property</h2>
            <p>
              All content, trademarks, and intellectual property on the Wasel platform are owned by Wasel or licensed to us. Users may not copy, modify, or distribute our content without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or in-app notification. Continued use of the platform constitutes acceptance of modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">13. Termination</h2>
            <p>
              Either party may terminate this agreement at any time. Wasel reserves the right to immediately suspend or terminate accounts for violations of these terms or applicable laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">14. Governing Law</h2>
            <p>
              These terms are governed by the laws of the Hashemite Kingdom of Jordan. Any disputes shall be resolved in the courts of Amman, Jordan.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">15. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <ul className="list-none pl-6 space-y-2 mt-4">
              <li>Email: legal@wasel.jo</li>
              <li>Phone: +962 79 000 0000</li>
              <li>Address: Amman, Hashemite Kingdom of Jordan</li>
            </ul>
          </section>

          <section className="mb-8 p-6 bg-muted rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Acknowledgment</h2>
            <p>
              BY USING WASEL, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
            </p>
          </section>
        </CardContent>
      </Card>
      </div>
    </LegalLayout>
  );
}
