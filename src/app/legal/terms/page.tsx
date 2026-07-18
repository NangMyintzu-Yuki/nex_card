import LegalLayout from "@/components/legal/legal-layout";

const TOC = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "eligibility", label: "Eligibility" },
  { id: "accounts", label: "Your Account" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "content", label: "Your Content" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "paid-services", label: "Paid Services" },
  { id: "termination", label: "Termination" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "governing-law", label: "Governing Law" },
  { id: "changes", label: "Changes to Terms" },
  { id: "contact", label: "Contact Us" },
];

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="Please read these terms carefully before using NEX CARD. By using our Service, you agree to these terms."
      toc={TOC}
    >
      <p>
        Welcome to NEX CARD. These Terms of Service ("Terms") govern your
        access to and use of the NEX CARD platform, including our website,
        applications, and related services (the "Service"). By accessing or
        using the Service, you agree to be bound by these Terms.
      </p>

      <h2 id="acceptance">1. Acceptance of Terms</h2>
      <p>
        By creating an account or using the Service, you confirm that you
        have read, understood, and agree to these Terms. If you do not agree,
        you may not use the Service.
      </p>

      <h2 id="eligibility">2. Eligibility</h2>
      <p>
        You must be at least 16 years old to use the Service. By using the
        Service, you represent and warrant that you meet this age requirement
        and have the legal capacity to enter into these Terms.
      </p>

      <h2 id="accounts">3. Your Account</h2>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You are responsible for all activity that occurs under your account.</li>
        <li>You must provide accurate and complete information when creating your account.</li>
        <li>You must notify us immediately of any unauthorized use of your account.</li>
        <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
      </ul>

      <h2 id="acceptable-use">4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or in violation of any applicable law.</li>
        <li>Upload content that is defamatory, obscene, invasive, threatening, or otherwise objectionable.</li>
        <li>Infringe the intellectual property rights of any third party.</li>
        <li>Distribute spam, malware, phishing content, or other harmful materials.</li>
        <li>Attempt to gain unauthorized access to any part of the Service or its systems.</li>
        <li>Interfere with or disrupt the Service, servers, or networks.</li>
        <li>Scrape, crawl, or use automated tools to access the Service without written permission.</li>
        <li>Resell, sublicense, or redistribute the Service without authorization.</li>
      </ul>

      <h2 id="content">5. Your Content</h2>
      <ul>
        <li>You retain ownership of all content you create and upload to the Service ("Your Content").</li>
        <li>By uploading content, you grant NEX CARD a limited, worldwide, non-exclusive license to host, display, and distribute your content solely to provide the Service.</li>
        <li>You represent that you have all necessary rights to Your Content and that it does not violate any third-party rights.</li>
        <li>We may remove content that violates these Terms, but we have no obligation to monitor all content.</li>
        <li>Upon account deletion, your content will be removed in accordance with our data retention policy.</li>
      </ul>

      <h2 id="intellectual-property">6. Intellectual Property</h2>
      <p>
        All intellectual property rights in the Service, including software,
        design, branding, templates, and documentation, are owned by or
        licensed to NEX CARD. You may not copy, modify, distribute, or
        reverse-engineer any part of the Service without our express written
        consent.
      </p>
      <p>
        Template designs provided through the Service are licensed for use
        within the Service only. You may not extract, export, or reuse
        template designs outside the NEX CARD platform.
      </p>

      <h2 id="paid-services">7. Paid Services</h2>
      <ul>
        <li>Certain features require a paid subscription or one-time payment.</li>
        <li>All payments are processed through our third-party payment processor (Stripe).</li>
        <li>Prices are displayed in your local currency and include applicable taxes unless stated otherwise.</li>
        <li>Subscriptions automatically renew unless cancelled before the renewal date.</li>
        <li>Refund requests are handled on a case-by-case basis within 14 days of purchase.</li>
        <li>We reserve the right to change pricing with 30 days' notice.</li>
      </ul>

      <h2 id="termination">8. Termination</h2>
      <ul>
        <li>You may delete your account at any time from your account settings.</li>
        <li>We may suspend or terminate your access if you violate these Terms, with or without prior notice.</li>
        <li>Upon termination, your right to use the Service ceases immediately.</li>
        <li>We will make your data available for export for 30 days after termination, after which it will be deleted.</li>
      </ul>

      <h2 id="disclaimers">9. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
        WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT
        NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE
        SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
      </p>

      <h2 id="liability">10. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEX CARD SHALL NOT BE LIABLE
        FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
        DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR
        BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE. OUR
        TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE TWELVE
        (12) MONTHS PRECEDING THE CLAIM.
      </p>

      <h2 id="indemnification">11. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless NEX CARD, its
        officers, directors, employees, and agents from any claims, damages,
        losses, or expenses (including reasonable attorneys' fees) arising
        from your use of the Service or violation of these Terms.
      </p>

      <h2 id="governing-law">12. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the State of California,
        United States, without regard to conflict of law principles. Any
        disputes shall be resolved in the state or federal courts located in
        San Francisco County, California.
      </p>

      <h2 id="changes">13. Changes to Terms</h2>
      <p>
        We may modify these Terms at any time. Material changes will be
        notified via email or prominent notice on the Service at least 30 days
        before taking effect. Continued use after changes take effect
        constitutes acceptance.
      </p>

      <h2 id="contact">14. Contact Us</h2>
      <p>
        If you have questions about these Terms, contact us at:
      </p>
      <ul>
        <li>Email: <span style={{ color: "var(--nc-brand-2)" }}>legal@nexcard.app</span></li>
        <li>Website: <span style={{ color: "var(--nc-brand-2)" }}>nexcard.app</span></li>
      </ul>
    </LegalLayout>
  );
}
