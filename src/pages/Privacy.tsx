import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const Privacy = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader
        isLoggedIn={!!user}
        email={user?.email}
        onSignIn={() => navigate('/auth')}
        onSignOut={signOut}
      />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 14, 2026</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, including your email address, account credentials, and any content you create using our platform. We also automatically collect usage data such as IP addresses, browser type, device information, and interaction patterns with our services.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide, maintain, and improve our services</li>
              <li>To process transactions and manage subscriptions</li>
              <li>To send service-related communications</li>
              <li>To detect, prevent, and address technical or security issues</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored securely using industry-standard encryption. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Third-Party Services</h2>
            <p>We may use third-party services for payment processing, analytics, and content delivery. These services have their own privacy policies, and we encourage you to review them. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Cookies</h2>
            <p>We use essential cookies to maintain your session and preferences. No third-party tracking cookies are used without your explicit consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may also request data portability or object to processing. To exercise these rights, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide services. Upon account deletion, we will remove your personal data within 30 days, except where retention is required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of material changes by posting the updated policy on this page with a revised date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Contact</h2>
            <p>If you have questions about this Privacy Policy, please contact us at <span className="text-primary font-medium">privacy@degentools.com</span>.</p>
          </section>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Privacy;
