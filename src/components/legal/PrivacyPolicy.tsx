/**
 * Privacy Policy
 * 
 * Data privacy and protection policy for Wasel platform.
 */

import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Shield } from 'lucide-react';
import { LegalLayout } from './LegalLayout';

export function PrivacyPolicy() {
  return (
    <LegalLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <Button variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Last Updated: January 2, 2026
        </p>

        <Card>
        <CardContent className="pt-6 prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p>
              Wasel ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our ride-sharing and delivery platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email, phone number, profile photo</li>
              <li><strong>Payment Information:</strong> Credit card details (encrypted through Stripe), billing address</li>
              <li><strong>Identity Verification:</strong> Government ID, driver's license, vehicle documents (for drivers)</li>
              <li><strong>Profile Data:</strong> Preferences, favorite locations, emergency contacts</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">2.2 Information We Collect Automatically</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Location Data:</strong> GPS coordinates during trips, pickup/dropoff locations</li>
              <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers</li>
              <li><strong>Usage Data:</strong> App interactions, trip history, search queries</li>
              <li><strong>Communications:</strong> In-app messages, support tickets, ratings and reviews</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">2.3 Information from Third Parties</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Verification:</strong> Background checks, document verification (via Jumio)</li>
              <li><strong>Payment Processing:</strong> Transaction data (via Stripe)</li>
              <li><strong>Social Login:</strong> Public profile information (if using social sign-in)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Delivery:</strong> Connect passengers with drivers, process payments, provide navigation</li>
              <li><strong>Safety & Security:</strong> Verify identities, prevent fraud, monitor suspicious activity</li>
              <li><strong>Customer Support:</strong> Respond to inquiries, resolve disputes, improve service quality</li>
              <li><strong>Communications:</strong> Send trip updates, receipts, promotional offers (with consent)</li>
              <li><strong>Analytics & Improvement:</strong> Analyze usage patterns, optimize routing, enhance AI features</li>
              <li><strong>Legal Compliance:</strong> Comply with laws, respond to legal requests, enforce terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Sharing Your Information</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">4.1 With Other Users</h3>
            <p>
              When you book a trip, we share necessary information with your driver (name, phone, pickup location) and vice versa. Profile photos and ratings are visible to match participants.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">4.2 With Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Payment Processing:</strong> Stripe (card processing)</li>
              <li><strong>Maps & Navigation:</strong> Google Maps (routing, geocoding)</li>
              <li><strong>Communications:</strong> Twilio (SMS/calls), SendGrid (emails)</li>
              <li><strong>Identity Verification:</strong> Jumio (document verification)</li>
              <li><strong>Analytics:</strong> Mixpanel (usage analytics)</li>
              <li><strong>Error Tracking:</strong> Sentry (crash reporting)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">4.3 For Legal Reasons</h3>
            <p>
              We may disclose information if required by law, court order, or to protect rights, safety, and property of Wasel and our users.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">4.4 Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, or sale, your information may be transferred to the new owner.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Location Data</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Collection</h3>
            <p>
              We collect precise location data when you use our services. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Continuous location during active trips (drivers)</li>
              <li>Periodic location for pickup/dropoff (passengers)</li>
              <li>Background location (only when trip is active)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Usage</h3>
            <p>
              Location data is used for routing, ETA calculation, driver matching, safety features, and analytics.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">5.3 Control</h3>
            <p>
              You can disable location services in device settings, but this will prevent you from using Wasel services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption:</strong> SSL/TLS for data in transit, AES-256 for data at rest</li>
              <li><strong>Access Control:</strong> Role-based access, multi-factor authentication</li>
              <li><strong>Payment Security:</strong> PCI DSS compliant processing through Stripe</li>
              <li><strong>Regular Audits:</strong> Security assessments and penetration testing</li>
              <li><strong>Monitoring:</strong> Real-time threat detection and incident response</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to provide services and comply with legal obligations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Data:</strong> Retained while account is active plus 7 years</li>
              <li><strong>Trip History:</strong> Retained for 7 years for legal/tax compliance</li>
              <li><strong>Payment Data:</strong> Card details tokenized and retained per PCI requirements</li>
              <li><strong>Location Data:</strong> Trip locations retained; real-time data deleted after 24 hours</li>
              <li><strong>Communications:</strong> Support tickets retained for 3 years</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Your Rights</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">8.1 Access & Portability</h3>
            <p>
              You can access and download your personal data through account settings or by contacting us.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">8.2 Correction</h3>
            <p>
              Update your information anytime through the app or by contacting support.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">8.3 Deletion</h3>
            <p>
              Request account deletion through settings. Some data may be retained for legal compliance.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">8.4 Marketing Opt-Out</h3>
            <p>
              Unsubscribe from promotional emails or disable notifications in app settings.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">8.5 Do Not Sell</h3>
            <p>
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
            <p>
              Wasel is not intended for users under 18. We do not knowingly collect information from children. If we become aware of such collection, we will delete it immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. International Transfers</h2>
            <p>
              Your data may be transferred and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Cookies & Tracking</h2>
            <p>
              We use cookies and similar technologies for authentication, preferences, and analytics. You can control cookies through browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Changes to Privacy Policy</h2>
            <p>
              We may update this policy periodically. Significant changes will be communicated via email or in-app notification. Continued use constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights:
            </p>
            <ul className="list-none pl-6 space-y-2 mt-4">
              <li>Email: privacy@wasel.jo</li>
              <li>Data Protection Officer: dpo@wasel.jo</li>
              <li>Phone: +962 79 000 0000</li>
              <li>Address: Amman, Hashemite Kingdom of Jordan</li>
            </ul>
          </section>

          <section className="p-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg">
            <h3 className="font-bold mb-2">GDPR & Regional Compliance</h3>
            <p className="text-sm">
              For users in the EU/EEA, we comply with GDPR. For California residents, we comply with CCPA. Additional regional privacy rights may apply based on your location.
            </p>
          </section>
        </CardContent>
      </Card>
      </div>
    </LegalLayout>
  );
}
