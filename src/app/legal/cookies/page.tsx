import LegalLayout from "@/components/legal/legal-layout";

const TOC = [
  { id: "what-are-cookies", label: "What Are Cookies" },
  { id: "how-we-use", label: "How We Use Cookies" },
  { id: "types-of-cookies", label: "Types of Cookies" },
  { id: "third-party", label: "Third-Party Cookies" },
  { id: "manage-cookies", label: "Managing Cookies" },
  { id: "impact-of-disabling", label: "Impact of Disabling" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      description="This Cookie Policy explains how NEX CARD uses cookies and similar technologies to recognize and improve your experience."
      toc={TOC}
    >
      <p>
        This Cookie Policy explains how NEX CARD ("we," "our," or "us")
        uses cookies, pixel tags, and similar tracking technologies when you
        visit our website and use our Service.
      </p>

      <h2 id="what-are-cookies">1. What Are Cookies</h2>
      <p>
        Cookies are small text files stored on your device (computer, tablet,
        or mobile) when you visit a website. They are widely used to make
        websites work efficiently and to provide information to website
        owners. Cookies can be "persistent" (remaining on your device until
        deleted) or "session-based" (deleted when you close your browser).
      </p>

      <h2 id="how-we-use">2. How We Use Cookies</h2>
      <p>We use cookies to:</p>
      <ul>
        <li><strong>Keep you signed in</strong> — Maintaining your authentication session across pages.</li>
        <li><strong>Remember your preferences</strong> — Theme selection, language, and display settings.</li>
        <li><strong>Improve security</strong> — Detecting unauthorized access and preventing fraud.</li>
        <li><strong>Analyze usage</strong> — Understanding how visitors interact with our Service to improve it.</li>
        <li><strong>Remember your cookie consent</strong> — Storing your cookie preferences so we do not ask repeatedly.</li>
      </ul>

      <h2 id="types-of-cookies">3. Types of Cookies We Use</h2>

      <h3>Strictly Necessary Cookies</h3>
      <p>
        These cookies are essential for the Service to function. They enable
        core features like authentication, security, and session management.
        You cannot opt out of these cookies as the Service would not work
        without them.
      </p>

      <h3>Functional Cookies</h3>
      <p>
        These cookies remember your choices and settings (such as theme,
        language, and region) to provide a more personalized experience.
        Disabling them may affect some features.
      </p>

      <h3>Analytics Cookies</h3>
      <p>
        These cookies collect anonymized data about how visitors use our
        Service, including which pages are visited most often and if users
        encounter errors. This data helps us improve the Service. We use
        privacy-respecting analytics that do not track individual users.
      </p>

      <h3>Performance Cookies</h3>
      <p>
        These cookies help us understand how the Service performs under
        different conditions, enabling us to optimize loading times and
        responsiveness.
      </p>

      <h2 id="third-party">4. Third-Party Cookies</h2>
      <p>
        Some cookies are placed by third-party services that appear on our
        pages. We use only essential third-party services:
      </p>
      <ul>
        <li>We do not load third-party payment-processor cookies. MMK wallet payments are completed in KBZPay, WavePay, or AYA Pay, then proven with a screenshot you upload to NEX CARD.</li>
        <li><strong>Analytics:</strong> We use privacy-first analytics that do not use cookies that track you across sites. All data is aggregated and anonymized.</li>
      </ul>
      <p>
        We do <strong>not</strong> use advertising cookies, remarketing
        trackers, or social media tracking pixels.
      </p>

      <h2 id="manage-cookies">5. Managing Cookies</h2>
      <p>You can control and manage cookies through your browser settings:</p>
      <ul>
        <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
        <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
        <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
        <li><strong>Edge:</strong> Settings → Privacy, Search, and Services → Cookies</li>
      </ul>
      <p>
        Most browsers allow you to block or delete cookies, set preferences
        for specific websites, or enable "Do Not Track" signals.
      </p>

      <h2 id="impact-of-disabling">6. Impact of Disabling Cookies</h2>
      <p>If you disable cookies:</p>
      <ul>
        <li>You may need to sign in each time you visit the Service.</li>
        <li>Your theme and display preferences may not be remembered.</li>
        <li>Some features may not function correctly.</li>
        <li>Analytics-based improvements may be less effective.</li>
      </ul>
      <p>
        Strictly necessary cookies cannot be disabled as they are required
        for the Service to function.
      </p>

      <h2 id="changes">7. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. Any changes will
        be posted on this page with a revised "Last Updated" date. If
        material changes are made, we will notify you through the Service or
        by email.
      </p>

      <h2 id="contact">8. Contact Us</h2>
      <p>
        If you have questions about our use of cookies, contact us at:
      </p>
      <ul>
        <li>Email: <span style={{ color: "var(--nc-brand-2)" }}>privacy@nexcard.app</span></li>
        <li>Website: <span style={{ color: "var(--nc-brand-2)" }}>nexcard.app</span></li>
      </ul>
    </LegalLayout>
  );
}
