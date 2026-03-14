import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const Terms = () => {
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

        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 14, 2026</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Degen Tools ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>Degen Tools provides a platform for creating meme coin websites, generating promotional content, and managing token-related projects. The Service includes website building tools, AI content generation, and related features.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 18 years old to use the Service</li>
              <li>One person or entity may not maintain more than one account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Create or promote fraudulent, misleading, or scam projects</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Distribute malware or engage in phishing</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Content Ownership</h2>
            <p>You retain ownership of content you create using the Service. By using the Service, you grant us a limited license to host, display, and distribute your content as necessary to provide the Service. We do not claim ownership of your generated content.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Payments & Subscriptions</h2>
            <p>Paid plans are billed according to the selected billing period. All payments are processed through third-party payment providers. Refunds are handled on a case-by-case basis. We reserve the right to change pricing with 30 days' notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Disclaimer</h2>
            <p>The Service is provided "as is" without warranties of any kind. We do not provide financial, investment, or legal advice. Cryptocurrency and meme coin projects carry inherent risks. You are solely responsible for your investment decisions. <strong>DYOR (Do Your Own Research).</strong></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Degen Tools shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of profits, data, or cryptocurrency assets.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time for violation of these terms or for any reason at our sole discretion. Upon termination, your right to use the Service ceases immediately.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes to Terms</h2>
            <p>We may modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the modified terms. Material changes will be communicated via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Contact</h2>
            <p>For questions about these Terms, contact us at <span className="text-primary font-medium">legal@degentools.com</span>.</p>
          </section>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Terms;
