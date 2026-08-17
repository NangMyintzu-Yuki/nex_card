import { MaintenanceLink as Link } from "@/components/ui/maintenance-link";
import LegalLayout from "@/components/legal/legal-layout";

const TOC = [
  { id: "info-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Your Information" },
  { id: "sharing", label: "Information Sharing" },
  { id: "cookies", label: "Cookies & Tracking" },
  { id: "data-security", label: "Data Security" },
  { id: "your-rights", label: "Your Rights" },
  { id: "retention", label: "Data Retention" },
  { id: "children", label: "Children's Privacy" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="Your privacy matters to us. This policy explains what data NEX CARD collects and how we use it."
      toc={TOC}
    >
      <p>
        NEX CARD ("we," "our," or "us") is committed to protecting your
        privacy. This Privacy Policy explains how we collect, use, disclose,
        and safeguard your information when you use our digital name card,
        portfolio, and business page platform (the "Service").
      </p>

      <h2 id="info-we-collect">Information We Collect</h2>
      <h3>Information You Provide</h3>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, password, and profile details when you register.</li>
        <li><strong>Card Content:</strong> Contact information, social links, business details, photos, and portfolio materials you add to your cards.</li>
        <li><strong>Payment Information:</strong> We collect a screenshot of your MMK wallet transfer (KBZPay, WavePay, AYA Pay, or similar) as proof of payment. Screenshots are stored privately and can be viewed only by you and NEX CARD administrators. We do not process credit cards and we do not use Stripe. Proofs are retained while your account and payment record exist, then deleted with your account data.</li>
        <li><strong>Communications:</strong> Messages you send us through support channels or feedback forms.</li>
      </ul>

      <h3>Information Collected Automatically</h3>
      <ul>
        <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and interaction patterns within the Service.</li>
        <li><strong>Device Information:</strong> Browser type, operating system, screen resolution, and device identifiers.</li>
        <li><strong>Log Data:</strong> IP address, access times, referring URLs, and error logs.</li>
        <li><strong>Analytics:</strong> Aggregated and anonymized data collected through privacy-respecting analytics tools.</li>
      </ul>

      <h2 id="how-we-use">How We Use Your Information</h2>
      <ul>
        <li>To provide, maintain, and improve the Service.</li>
        <li>To process transactions and send related information (receipts, confirmations).</li>
        <li>To send administrative notifications (service updates, security alerts).</li>
        <li>To respond to your inquiries and provide customer support.</li>
        <li>To monitor usage patterns and detect fraud or abuse.</li>
        <li>To comply with legal obligations and enforce our terms.</li>
      </ul>

      <h2 id="sharing">Information Sharing</h2>
      <p>
        We do <strong>not</strong> sell your personal information. We share data only in these circumstances:
      </p>
      <ul>
        <li><strong>Service Providers:</strong> Third-party vendors who help us operate the Service (hosting, payment processing, analytics) under strict data processing agreements.</li>
        <li><strong>Legal Requirements:</strong> When required by law, subpoena, or governmental request.</li>
        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with prior notice).</li>
        <li><strong>With Your Consent:</strong> When you explicitly authorize sharing.</li>
      </ul>

      <h2 id="cookies">Cookies & Tracking</h2>
      <p>
        We use cookies and similar technologies for essential functionality,
        preferences, and analytics. You can manage cookie preferences through
        your browser settings. See our{" "}
        <Link href="/legal/cookies" style={{ color: "var(--nc-brand-2)" }}>
          Cookie Policy
        </Link>{" "}
        for full details.
      </p>

      <h2 id="data-security">Data Security</h2>
      <p>
        We implement industry-standard security measures including TLS
        encryption, encrypted database storage, access controls, and regular
        security audits. However, no method of transmission over the Internet
        is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2 id="your-rights">Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the right to:</p>
      <ul>
        <li><strong>Access</strong> the personal data we hold about you.</li>
        <li><strong>Correct</strong> inaccurate or incomplete data.</li>
        <li><strong>Delete</strong> your personal data and account.</li>
        <li><strong>Export</strong> your data in a portable format.</li>
        <li><strong>Object</strong> to certain processing activities.</li>
        <li><strong>Withdraw consent</strong> where processing is based on consent.</li>
      </ul>
      <p>
        To exercise these rights, contact us at{" "}
        <span style={{ color: "var(--nc-brand-2)" }}>
          privacy@nexcard.app
        </span>
        . We will respond within 30 days.
      </p>

      <h2 id="retention">Data Retention</h2>
      <p>
        We retain your personal data for as long as your account is active or
        as needed to provide the Service. After account deletion, we remove
        personal data within 90 days, except where retention is required by
        law or for legitimate business purposes (e.g., fraud prevention).
      </p>

      <h2 id="children">Children's Privacy</h2>
      <p>
        The Service is not directed to individuals under 16. We do not
        knowingly collect personal data from children. If you believe we have
        collected data from a child, contact us immediately and we will delete
        it.
      </p>

      <h2 id="changes">Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify
        you of material changes by posting the updated policy on this page
        with a revised "Last Updated" date. Your continued use of the Service
        after changes constitutes acceptance of the updated policy.
      </p>

      <h2 id="contact">Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, contact us at:
      </p>
      <ul>
        <li>Email: <span style={{ color: "var(--nc-brand-2)" }}>privacy@nexcard.app</span></li>
        <li>Website: <span style={{ color: "var(--nc-brand-2)" }}>nexcard.app</span></li>
      </ul>
    </LegalLayout>
  );
}
