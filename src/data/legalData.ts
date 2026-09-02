import {
  Shield,
  FileText,
  Cookie,
  AlertTriangle,
  Brain,
  Lock,
  Copyright,
  RotateCcw,
  Users,
  Mail,
  Scale,
  CheckCircle2,
  Info,
} from 'lucide-react';

export type LegalDocId =
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'acceptable-use'
  | 'ai-disclaimer'
  | 'data-protection'
  | 'copyright'
  | 'refund-policy'
  | 'community-guidelines'
  | 'contact';

export interface LegalSection {
  id: string;
  number?: string;
  title: string;
  content: string[];
  subsections?: {
    title: string;
    content: string[];
  }[];
  callout?: {
    type: 'info' | 'warning' | 'important';
    title: string;
    text: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface LegalDocument {
  id: LegalDocId;
  route: string;
  title: string;
  shortDescription: string;
  badge: string;
  lastUpdated: string;
  version: string;
  icon: any;
  sections: LegalSection[];
}

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocument> = {
  privacy: {
    id: 'privacy',
    route: '/privacy',
    title: 'Privacy Policy',
    shortDescription:
      'How MindFlow AI collects, processes, stores, encrypts, and protects your personal data, workspace mind maps, and AI prompts.',
    badge: 'Data Transparency & Privacy',
    lastUpdated: 'September 2, 2026',
    version: 'v2.4 (Enterprise & Consumer)',
    icon: Shield,
    sections: [
      {
        id: 'intro',
        number: '1',
        title: 'Introduction',
        content: [
          'MindFlow AI ("MindFlow," "we," "our," or "us") is dedicated to safeguarding your personal data and upholding your fundamental privacy rights.',
          'This Privacy Policy governs your access to and use of our web platform, visual mind-mapping canvas, AI brainstorming tools, document parsing services, and team collaboration workspaces (collectively, the "Services").',
          'By accessing or using MindFlow AI, you acknowledge that you have read, understood, and agreed to the practices described in this document.',
        ],
        callout: {
          type: 'info',
          title: 'Core Privacy Commitment',
          text: 'We never sell your personal information or workspace content. Your mind maps, notes, and private intellectual property remain strictly yours.',
        },
      },
      {
        id: 'information-we-collect',
        number: '2',
        title: 'Information We Collect',
        content: [
          'We collect information to provide, maintain, optimize, and secure our visual productivity platform. We distinguish four distinct categories of data:',
        ],
        subsections: [
          {
            title: 'A. User-Provided Content',
            content: [
              'Information you deliberately submit when creating an account, editing nodes, typing markdown notes, attaching tasks, setting milestone deadlines, or entering prompts for the AI inference engine.',
            ],
          },
          {
            title: 'B. Automatically Collected Technical Data',
            content: [
              'IP address, browser user-agent string, operating system version, device hardware specifications, session timestamps, screen resolution, and diagnostic telemetry to prevent latency and crashes.',
            ],
          },
          {
            title: 'C. AI-Generated Output & Prompts',
            content: [
              'Prompt inputs, node branch expansion instructions, voice transcripts, PDF document snippets uploaded for analysis, and the generated visual trees returned by the AI pipeline.',
            ],
          },
          {
            title: 'D. Usage & Analytics Telemetry',
            content: [
              'Aggregated feature usage frequency (e.g., number of maps created, export format preferences, flashcard study sessions) used solely to optimize product performance.',
            ],
          },
        ],
      },
      {
        id: 'account-information',
        number: '3',
        title: 'Account Information',
        content: [
          'When you create a MindFlow account (via email or federated OAuth providers such as Google Identity), we receive and store your primary email address, display name, profile avatar URL, authentication token IDs, and subscription tier status.',
          'Password credentials submitted via standard email authentication are hashed using salted cryptographic algorithms (bcrypt/PBKDF2) managed securely via Google Firebase Authentication infrastructure. MindFlow employees never possess access to raw plaintext passwords.',
        ],
      },
      {
        id: 'mind-maps-and-user-content',
        number: '4',
        title: 'Mind Maps and User Content',
        content: [
          'All nodes, branch hierarchy relationships, custom color palettes, emoji tags, task statuses, priority ratings, goal timelines, study flashcards, and quick scratchpad notes you construct in MindFlow constitute your "User Content."',
          'User Content is synchronized over TLS 1.3 encrypted connections and stored securely in Google Cloud Firestore with strict row-level security rules enforcing that only your verified user ID or explicitly authorized workspace collaborators can read or modify your maps.',
        ],
      },
      {
        id: 'ai-generated-content',
        number: '5',
        title: 'AI-Generated Content & Prompt Processing',
        content: [
          'MindFlow AI harnesses enterprise-grade Gemini Foundation Models (including Gemini 3.1 Pro, Gemini 2.5 Pro, and Gemini 2.5 Flash) via server-side Google GenAI SDK proxies.',
          'When you request an AI operation (such as "Generate Mind Map from Topic," "Expand Branch with Ideas," "Deconstruct PDF Document," or "Voice Brainstorming"):',
          '• Your prompt text, voice transcript, or document text is passed ephemerally to Google Cloud GenAI inference endpoints.',
          '• Server API keys remain strictly hidden on our server backend and are never transmitted to the browser.',
          '• Your prompt inputs and private mind map contents are NOT utilized by MindFlow AI or Google to train public machine learning foundation models without your explicit opt-in.',
        ],
      },
      {
        id: 'device-and-usage',
        number: '6',
        title: 'Device and Usage Information',
        content: [
          'We collect diagnostic logs including browser type, viewport dimensions, referral URLs, interaction events, error stack traces, and canvas render framerates. This telemetry enables us to resolve visual rendering anomalies on complex multi-thousand-node diagrams.',
        ],
      },
      {
        id: 'cookies-overview',
        number: '7',
        title: 'Cookies and Local Storage',
        content: [
          'MindFlow utilizes first-party cookies and browser localStorage/indexedDB tokens solely for session authentication persistence, theme preferences, offline workspace caching, and security CSRF verification.',
          'For complete granular details on cookies, please refer to our dedicated Cookie Policy.',
        ],
      },
      {
        id: 'how-we-use-information',
        number: '8',
        title: 'How We Use Information',
        content: [
          'We process your data strictly under valid legal bases (including contract fulfillment, legitimate business interest, and compliance with statutory obligations):',
          '• To render, synchronize, and persist your mind maps across devices in real time.',
          '• To execute AI inference requests and transform complex thoughts into structured diagrams.',
          '• To authenticate your identity and prevent fraudulent multi-account abuse or rate-limit violations.',
          '• To deliver critical billing receipts, security alerts, and system status updates.',
          '• To provide responsive customer support and diagnostic troubleshooting.',
        ],
      },
      {
        id: 'how-we-share-information',
        number: '9',
        title: 'How We Share Information',
        content: [
          'We do not sell, rent, monetize, or trade your personal data. We only share information in the following strictly bounded circumstances:',
          '• Public or Shared Maps: If you explicitly generate a public share link or invite collaborators to a workspace folder, the content within that specific map becomes accessible to recipients holding that authorization.',
          '• Legal Mandates: We may disclose data if required by a valid court subpoena, law enforcement warrant, or enforceable governmental demand, subject to reasonable legal review.',
          '• Business Transfers: In the event of a merger, acquisition, or asset sale, customer accounts will continue to be governed by the protections outlined in this Privacy Policy.',
        ],
      },
      {
        id: 'service-providers',
        number: '10',
        title: 'Authorized Sub-Processors & Service Providers',
        content: [
          'We partner with industry-leading infrastructure sub-processors bound by stringent Data Processing Agreements (DPAs):',
        ],
        table: {
          headers: ['Sub-Processor', 'Purpose', 'Data Location', 'Security Standard'],
          rows: [
            ['Google Cloud Platform & Firebase', 'Database, Authentication & Hosting', 'USA / Multi-Region', 'SOC 1/2/3, ISO 27001, HIPAA'],
            ['Google GenAI & Gemini API', 'Generative Inference & Node Expansion', 'USA / Google Cloud', 'Enterprise Zero-Data Retention SLA'],
            ['Stripe / Payment Gateways', 'Subscription Billing & Invoicing', 'USA / Global', 'PCI-DSS Level 1'],
            ['Postmark / Email Relays', 'Transactional Notifications & Receipts', 'USA', 'TLS Encrypted, SOC 2'],
          ],
        },
      },
      {
        id: 'data-security',
        number: '11',
        title: 'Data Security & Encryption',
        content: [
          'MindFlow AI applies defense-in-depth security controls across all architectural tiers:',
          '• Encryption in Transit: All data transferred between client browsers, application servers, and databases is protected by TLS 1.3 with HSTS headers.',
          '• Encryption at Rest: Firestore databases, cloud backups, and disk volumes are encrypted with 256-bit AES cryptographic keys.',
          '• Role-Based Access Control (RBAC): Strict administrative policies prevent unauthorized employee inspection of user workspace databases.',
        ],
      },
      {
        id: 'data-retention',
        number: '12',
        title: 'Data Retention Policies',
        content: [
          'We retain your workspace content for the duration of your active account lifecycle. If you delete a specific mind map, task, or goal, it is marked for deletion and purged from active Firestore indices immediately.',
          'Automated database snapshots and backup archives are cycled and permanently expunged within 30 days of deletion.',
        ],
      },
      {
        id: 'user-rights',
        number: '13',
        title: 'User Rights (GDPR, CCPA/CPRA, LGPD)',
        content: [
          'Regardless of your geographic location, MindFlow AI extends comprehensive privacy rights to all registered users:',
          '• Right to Access / Portability: Request an export of all your maps, tasks, and profile records in machine-readable JSON/Markdown formats.',
          '• Right to Rectification: Correct inaccurate or outdated profile information via your account settings.',
          '• Right to Erasure ("Right to be Forgotten"): Request irreversible deletion of your account and associated database documents.',
          '• Right to Restrict or Object: Opt out of non-essential analytics processing.',
          'To exercise any of these rights, contact us at privacy@mindflow.ai or use our dedicated Legal Contact Form.',
        ],
      },
      {
        id: 'account-deletion',
        number: '14',
        title: 'Account Deletion & Data Purge Process',
        content: [
          'You may initiate account deletion at any time from Settings > Account > Delete Account, or by submitting an authenticated request to our Data Protection Officer.',
          'Upon deletion confirmation, all your stored mind maps, custom templates, quick notes, and authentication identifiers are irreversibly erased.',
        ],
      },
      {
        id: 'childrens-privacy',
        number: '15',
        title: "Children's Privacy (COPPA & FERPA)",
        content: [
          'MindFlow AI is not directed to children under the age of 13 (or under 16 in the EEA). We do not knowingly harvest personal identifiers from minors without verifiable parental or institutional educational consent.',
          'If you believe a child has provided us with personal data without proper authorization, please notify privacy@mindflow.ai for immediate removal.',
        ],
      },
      {
        id: 'international-data-transfers',
        number: '16',
        title: 'International Data Transfers',
        content: [
          'MindFlow AI operates global server infrastructure in compliance with the EU-U.S. Data Privacy Framework (DPF) and Standard Contractual Clauses (SCCs) to ensure equivalent data protection when transferring records internationally.',
        ],
      },
      {
        id: 'changes-to-policy',
        number: '17',
        title: 'Changes to this Privacy Policy',
        content: [
          'We may update this policy periodically to reflect evolving security practices, regulatory requirements, or feature expansions.',
          'Material revisions will be announced via an in-app notice, banner, or email notification at least 14 days prior to taking effect. The "Last Updated" timestamp at the top of this document indicates the current effective version.',
        ],
      },
      {
        id: 'contact',
        number: '18',
        title: 'Contact Information & Privacy Officer',
        content: [
          'For inquiries, data protection requests, or concerns regarding this Privacy Policy, please contact our dedicated team:',
          'MindFlow AI Inc. — Data Protection Office',
          'Email: privacy@mindflow.ai | legal@mindflow.ai',
          'Direct Contact Portal: /contact/legal',
        ],
      },
    ],
  },

  terms: {
    id: 'terms',
    route: '/terms',
    title: 'Terms of Service',
    shortDescription:
      'The legally binding agreement governing your access to the MindFlow AI visual workspace, subscriptions, AI generation limits, and software licenses.',
    badge: 'Binding Legal Contract',
    lastUpdated: 'September 2, 2026',
    version: 'v3.1 (Global)',
    icon: Scale,
    sections: [
      {
        id: 'acceptance',
        number: '1',
        title: 'Acceptance of Terms',
        content: [
          'These Terms of Service ("Terms") constitute a legally enforceable contract between you ("User," "you," or "your") and MindFlow AI Inc. ("MindFlow," "we," "us," or "our").',
          'By registering an account, clicking "Sign Up," accessing our visual canvas, or interacting with our AI features, you agree to be bound by these Terms and our Privacy Policy.',
        ],
      },
      {
        id: 'eligibility',
        number: '2',
        title: 'Eligibility',
        content: [
          'You must be at least 13 years old (or the applicable age of majority in your jurisdiction) and possess the full legal capacity to enter into binding agreements to use MindFlow AI.',
          'If you use MindFlow on behalf of an enterprise, company, or educational institution, you represent and warrant that you possess explicit authority to bind that entity to these Terms.',
        ],
      },
      {
        id: 'account-registration',
        number: '3',
        title: 'Account Registration & Security',
        content: [
          'You agree to provide accurate, current, and complete information during registration and keep your account profile updated.',
          'You are solely responsible for maintaining the confidentiality of your credentials and for all activities occurring under your account. You must notify MindFlow immediately of any suspected unauthorized access.',
        ],
      },
      {
        id: 'user-responsibilities',
        number: '4',
        title: 'User Responsibilities',
        content: [
          'You are solely responsible for all content, prompts, files, and links you upload, create, or broadcast via MindFlow.',
          'You agree to use MindFlow in compliance with all applicable local, national, and international laws, treaties, and copyright statutes.',
        ],
      },
      {
        id: 'user-content',
        number: '5',
        title: 'User Content & Ownership',
        content: [
          'You retain 100% full intellectual property ownership of all mind maps, notes, tasks, files, and proprietary data you create or upload in MindFlow.',
          'MindFlow claims no ownership rights over your User Content. You grant MindFlow solely a limited, non-exclusive license to host, display, replicate, and transmit your User Content solely to the extent necessary to provide the Services to you and your authorized collaborators.',
        ],
      },
      {
        id: 'intellectual-property',
        number: '6',
        title: 'MindFlow Intellectual Property',
        content: [
          'The MindFlow brand name, visual layout algorithms, user interface code, logos, icons, vector animations, and proprietary software remain the exclusive intellectual property of MindFlow AI Inc.',
          'You may not decompile, reverse-engineer, disassemble, or extract source code from the platform without explicit written authorization.',
        ],
      },
      {
        id: 'ai-features',
        number: '7',
        title: 'AI Features & Generation Parameters',
        content: [
          'MindFlow provides generative AI capabilities powered by large language models (LLMs).',
          'AI output is generated probabilistically. MindFlow does not warrant that AI-generated mind maps or suggestions are error-free, complete, or suitable for any critical or legal purpose.',
          'You retain ownership of the mind maps generated from your prompts, subject to applicable copyright laws governing computer-generated expressions.',
        ],
      },
      {
        id: 'third-party-services',
        number: '8',
        title: 'Third-Party Services & Integrations',
        content: [
          'MindFlow may connect to third-party services (such as Google OAuth, Firebase, Stripe, or external export targets). We do not control and are not liable for the availability or terms of third-party platforms.',
        ],
      },
      {
        id: 'prohibited-activities',
        number: '9',
        title: 'Prohibited Activities',
        content: [
          'You agree NOT to engage in any prohibited activities specified in our Acceptable Use Policy, including generating malware, harassing others, automated scraping, abusing AI quotas, or attempting unauthorized system intrusion.',
        ],
      },
      {
        id: 'subscription-plans',
        number: '10',
        title: 'Subscription Plans & Quotas',
        content: [
          'MindFlow offers Free, Pro, and Business tiers with distinct AI generation quotas, document upload limits, and collaboration capacities.',
          'Tier allocations reset on the first day of each billing cycle. Unused monthly AI credits do not roll over to subsequent months unless explicitly stated in your agreement.',
        ],
      },
      {
        id: 'payments',
        number: '11',
        title: 'Payments & Billing Terms',
        content: [
          'Paid subscriptions are billed in advance on a recurring monthly or annual basis. You authorize MindFlow and our payment processors to charge your designated payment method for all applicable fees and taxes.',
        ],
      },
      {
        id: 'cancellation',
        number: '12',
        title: 'Subscription Cancellation',
        content: [
          'You can cancel your subscription at any time via Settings > Subscriptions. Upon cancellation, you retain full access to your paid tier through the end of the current paid billing period.',
        ],
      },
      {
        id: 'refunds',
        number: '13',
        title: 'Refund Policy & Statutory Rights',
        content: [
          'Refunds are administered in accordance with our Refund & Cancellation Policy. Except where required by applicable consumer protection laws (e.g., EU 14-day statutory right of withdrawal), fees are generally non-refundable.',
        ],
      },
      {
        id: 'service-availability',
        number: '14',
        title: 'Service Availability & SLA',
        content: [
          'We strive for 99.9% platform availability. However, service may be occasionally interrupted for scheduled maintenance, infrastructure upgrades, or force majeure events. Enterprise SLA guarantees apply only to signed enterprise agreements.',
        ],
      },
      {
        id: 'disclaimers',
        number: '15',
        title: 'Disclaimers of Warranties',
        content: [
          'THE SERVICES AND AI FEATURES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR ACCURACY OF AI OUTPUTS.',
        ],
      },
      {
        id: 'limitation-of-liability',
        number: '16',
        title: 'Limitation of Liability',
        content: [
          'TO THE MAXIMUM EXTENT PERMITTED BY LAW, MINDFLOW AI INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS, DATA, OR GOODWILL.',
          'IN NO EVENT SHALL MINDFLOW’S TOTAL AGGREGATE LIABILITY EXCEED THE GREATER OF ONE HUNDRED US DOLLARS ($100) OR THE TOTAL AMOUNT PAID BY YOU TO MINDFLOW IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.',
        ],
      },
      {
        id: 'indemnification',
        number: '17',
        title: 'Indemnification',
        content: [
          'You agree to defend, indemnify, and hold harmless MindFlow AI Inc., its officers, directors, employees, and agents from any claims, damages, liabilities, and expenses arising out of your violation of these Terms or your User Content.',
        ],
      },
      {
        id: 'suspension',
        number: '18',
        title: 'Account Suspension & Enforcement',
        content: [
          'MindFlow reserves the right to suspend or restrict access to accounts that violate these Terms, breach AI quota rate limits, or engage in suspicious or harmful activities.',
        ],
      },
      {
        id: 'termination',
        number: '19',
        title: 'Termination',
        content: [
          'You may terminate your account at any time. MindFlow may terminate these Terms and your account upon written notice if you materially breach any provision of this agreement.',
        ],
      },
      {
        id: 'changes-to-terms',
        number: '20',
        title: 'Modifications to Terms',
        content: [
          'We may revise these Terms from time to time. We will provide reasonable advance notice of material modifications via email or in-app announcements.',
        ],
      },
      {
        id: 'governing-law',
        number: '21',
        title: 'Governing Law & Dispute Resolution',
        content: [
          'These Terms are governed by the laws of the State of California and the United States, without regard to conflict of law principles. Any dispute shall be resolved through binding arbitration or state/federal courts located in Santa Clara County, California.',
        ],
      },
      {
        id: 'contact-terms',
        number: '22',
        title: 'Legal Contact',
        content: [
          'For formal notices or legal questions concerning these Terms:',
          'MindFlow AI Inc. — Legal Affairs',
          'Email: legal@mindflow.ai',
          'Portal: /contact/legal',
        ],
      },
    ],
  },

  cookies: {
    id: 'cookies',
    route: '/cookies',
    title: 'Cookie Policy',
    shortDescription:
      'Details on how MindFlow AI utilizes cookies, web storage, session tokens, and telemetry scripts to manage your session and preserve your canvas layout.',
    badge: 'Cookie & Tracking Disclosure',
    lastUpdated: 'September 2, 2026',
    version: 'v2.1',
    icon: Cookie,
    sections: [
      {
        id: 'what-are-cookies',
        number: '1',
        title: 'What Are Cookies & Browser Storage?',
        content: [
          'Cookies are compact text files stored on your device when you visit web applications. Modern web apps also use LocalStorage, SessionStorage, and IndexedDB to cache data locally.',
          'MindFlow AI uses these technologies to maintain your authenticated login session, preserve your visual canvas zoom and pan positions, memorize your active theme preferences, and protect against Cross-Site Request Forgery (CSRF).',
        ],
      },
      {
        id: 'essential-cookies',
        number: '2',
        title: 'Essential / Strictly Necessary Cookies',
        content: [
          'These cookies and storage items are strictly indispensable for the fundamental operation, security, and rendering of the MindFlow AI workspace.',
          'They cannot be disabled in our systems. You can configure your browser to block them, but essential features (such as map saving and user login) will cease functioning.',
        ],
        table: {
          headers: ['Cookie / Key Name', 'Provider', 'Purpose', 'Expiration'],
          rows: [
            ['__session / auth_token', 'MindFlow AI', 'Maintains secure authenticated session with Firestore', 'Session / 30 Days'],
            ['mindflow_theme_preference', 'MindFlow AI', 'Stores light/dark/system visual interface selection', 'Persistent (1 Year)'],
            ['mindflow_canvas_state', 'MindFlow AI', 'Preserves local pan coordinates, zoom level, and active layout', 'Persistent (1 Year)'],
            ['csrf_verification_token', 'MindFlow AI', 'Protects against Cross-Site Request Forgery attacks', 'Session'],
          ],
        },
      },
      {
        id: 'analytics-cookies',
        number: '3',
        title: 'Analytics & Performance Cookies',
        content: [
          'These cookies collect aggregated, pseudonymous metrics regarding canvas performance, node rendering latency, and feature usage.',
          'This information enables us to detect performance bottlenecks on large mind maps and improve overall application responsiveness.',
        ],
      },
      {
        id: 'preference-cookies',
        number: '4',
        title: 'Functional & Preference Cookies',
        content: [
          'Functional cookies enable enhanced customization, such as remembering your default AI generation model (Gemini 3.1 Pro vs Gemini 2.5 Flash), default mind-map expansion depth, and collapsed sidebar states.',
        ],
      },
      {
        id: 'marketing-cookies',
        number: '5',
        title: 'Marketing & Announcement Cookies',
        content: [
          'MindFlow does not deploy third-party advertising tracking networks. We do not track your browsing across other external websites.',
          'We may use first-party tokens solely to manage in-app announcements for new product features and release notes so you do not see repetitive popups.',
        ],
      },
      {
        id: 'cookie-management',
        number: '6',
        title: 'Managing Your Cookie Preferences',
        content: [
          'You maintain complete control over non-essential cookies on MindFlow AI.',
          'You can modify your preferences at any time by clicking "Manage Cookie Preferences" in the footer or utilizing our in-app Cookie Banner settings modal.',
          'You can also clear cookies directly via your browser settings (Chrome, Safari, Firefox, Edge).',
        ],
      },
      {
        id: 'third-party-cookies',
        number: '7',
        title: 'Third-Party Services Cookies',
        content: [
          'When signing in via Google Identity Services or processing a payment via Stripe, those trusted sub-processors set necessary security cookies subject to their respective privacy standards.',
        ],
      },
      {
        id: 'cookie-retention',
        number: '8',
        title: 'Cookie Retention Schedules',
        content: [
          'Session cookies are purged automatically when you close your browser tab. Persistent cookies remain for periods ranging from 30 days to 12 months, or until manually cleared by the user.',
        ],
      },
      {
        id: 'contact-cookies',
        number: '9',
        title: 'Questions Regarding Cookies',
        content: [
          'For inquiries regarding our use of cookies and tracking technologies:',
          'Email: privacy@mindflow.ai',
          'Legal Center: /contact/legal',
        ],
      },
    ],
  },

  'acceptable-use': {
    id: 'acceptable-use',
    route: '/acceptable-use',
    title: 'Acceptable Use Policy',
    shortDescription:
      'Clear rules, prohibited behaviors, and security standards required to maintain a safe, collaborative, and high-performance environment on MindFlow AI.',
    badge: 'Platform Safety Standards',
    lastUpdated: 'September 2, 2026',
    version: 'v2.2',
    icon: CheckCircle2,
    sections: [
      {
        id: 'purpose',
        number: '1',
        title: 'Purpose & Scope',
        content: [
          'This Acceptable Use Policy ("AUP") defines the mandatory standards of conduct applicable to all registered users, guest sandbox testers, enterprise teams, and API consumers of MindFlow AI.',
          'MindFlow is engineered for constructive brainstorming, educational structuring, visual problem-solving, and creative exploration. Any use that compromises the safety, integrity, or availability of our systems is strictly prohibited.',
        ],
      },
      {
        id: 'prohibited-activities',
        number: '2',
        title: 'Prohibited Activities & Conduct',
        content: [
          'You agree that you will NOT under any circumstances use MindFlow AI to:',
        ],
        subsections: [
          {
            title: 'A. Illegal Activities & Fraud',
            content: [
              '• Facilitate, plan, or engage in any unlawful, fraudulent, or criminal enterprise.',
              '• Evade financial sanctions, distribute contraband, or orchestrate financial fraud.',
            ],
          },
          {
            title: 'B. Abuse, Harassment & Harmful Content',
            content: [
              '• Generate, store, or share content that is defamatory, abusive, threatening, racially or ethnically offensive, or inciting violence.',
              '• Generate or disseminate non-consensual imagery, child sexual abuse material (CSAM), or extreme violence.',
            ],
          },
          {
            title: 'C. Spam, Phishing & Malware',
            content: [
              '• Distribute unsolicited spam, deceptive phishing schemes, or malicious payloads.',
              '• Upload or embed viruses, worms, Trojan horses, spyware, or keyloggers inside notes or attachments.',
            ],
          },
          {
            title: 'D. Intellectual Property Infringement',
            content: [
              '• Upload, diagram, or distribute copyrighted materials, proprietary source code, or trade secrets without verified authorization.',
            ],
          },
          {
            title: 'E. Harmful AI Manipulation & Jailbreaking',
            content: [
              '• Attempt adversarial prompt injection, jailbreaking, or automated manipulation to force the AI engine to generate harmful instructions (e.g., biological weapons, cyber-attack scripts, explosive recipes).',
              '• Utilize automated scripts to circumvent monthly AI generation quotas or flood our inference pipelines.',
            ],
          },
          {
            title: 'F. Infrastructure Attacks & Reverse Engineering',
            content: [
              '• Probe, scan, or test the vulnerability of MindFlow servers, Firestore collections, or APIs without authorized written permission.',
              '• Launch Distributed Denial of Service (DDoS) attacks or scrape our visual canvas architectures.',
            ],
          },
        ],
      },
      {
        id: 'enforcement-actions',
        number: '3',
        title: 'Enforcement Actions & Penalties',
        content: [
          'MindFlow employs automated heuristic filters, rate limiters, and administrative review to enforce this policy. Violations will result in tiered graduated responses:',
        ],
        subsections: [
          {
            title: '1. Official Warning',
            content: [
              'Issued for minor accidental violations with immediate requirement to remediate non-compliant content.',
            ],
          },
          {
            title: '2. Feature Restriction & Quota Throttling',
            content: [
              'Temporary suspension of AI generation capabilities, public share link generation, or document uploads.',
            ],
          },
          {
            title: '3. Account Suspension',
            content: [
              'Immediate lockout of account access pending formal security compliance investigation.',
            ],
          },
          {
            title: '4. Permanent Termination & Legal Referral',
            content: [
              'Irrevocable account closure, data purge, and referral to law enforcement agencies for severe criminal conduct.',
            ],
          },
        ],
      },
      {
        id: 'reporting-violations',
        number: '4',
        title: 'Reporting Policy Violations',
        content: [
          'If you discover a public mind map or user violating this policy, please notify our Trust & Safety team immediately:',
          'Email: abuse@mindflow.ai',
          'Online Portal: /contact/legal',
        ],
      },
    ],
  },

  'ai-disclaimer': {
    id: 'ai-disclaimer',
    route: '/ai-disclaimer',
    title: 'AI Disclaimer & Model Limitations',
    shortDescription:
      'Essential disclosures regarding generative artificial intelligence, probabilistic outputs, non-professional advice warnings, and user verification obligations.',
    badge: 'Important AI Safety Notice',
    lastUpdated: 'September 2, 2026',
    version: 'v2.3',
    icon: Brain,
    sections: [
      {
        id: 'nature-of-ai',
        number: '1',
        title: 'Nature of Generative AI Technology',
        content: [
          'MindFlow AI integrates state-of-the-art Large Language Models (LLMs) to accelerate brainstorming, structural synthesis, and conceptual ideation.',
          'Generative AI models operate probabilistically, predicting linguistic and structural patterns based on extensive training data. They do not possess consciousness, real-world sentience, or authoritative real-time ground truth.',
        ],
        callout: {
          type: 'warning',
          title: 'Mandatory User Verification',
          text: 'AI-generated mind maps, summaries, flashcards, and suggestions may contain factual inaccuracies, hallucinations, outdated information, or incomplete structural logic. You must independently verify all critical information.',
        },
      },
      {
        id: 'no-professional-advice',
        number: '2',
        title: 'Not Professional Advice (Medical, Legal, Financial)',
        content: [
          'The AI features in MindFlow are designed solely for educational, visual brainstorming, and general productivity purposes.',
          '• Medical / Healthcare: MindFlow AI output must NEVER be used for clinical diagnosis, treatment planning, prescription guidance, or mental health therapy.',
          '• Legal Advice: Diagrams outlining legal concepts, contract structures, or statutory procedures do not constitute formal legal counsel and do not establish an attorney-client relationship.',
          '• Financial / Investment: MindFlow AI does not provide financial, securities, tax, accounting, or investment recommendations. Consult certified professionals for financial decisions.',
        ],
      },
      {
        id: 'no-guarantee-of-accuracy',
        number: '3',
        title: 'No Guarantee of Accuracy or Completeness',
        content: [
          'MindFlow AI Inc. does not represent, warrant, or guarantee that AI-generated nodes, branch expansions, or summaries will be accurate, reliable, complete, error-free, or suitable for any specific academic or enterprise application.',
        ],
      },
      {
        id: 'user-responsibility',
        number: '4',
        title: 'User Responsibility & Decision-Making',
        content: [
          'You remain entirely and solely responsible for how you evaluate, edit, incorporate, and rely upon AI-generated content in your projects, businesses, academic coursework, and publications.',
          'You must review all generated nodes and verify calculations, citations, and critical facts before publishing or acting upon them.',
        ],
      },
      {
        id: 'bias-and-content',
        number: '5',
        title: 'Potential Biases & Nuances',
        content: [
          'Like all foundation models, generative outputs may reflect societal nuances, historical biases, or linguistic patterns present in training datasets. MindFlow continually refines system prompts and safety guardrails to mitigate bias and enhance output quality.',
        ],
      },
      {
        id: 'continuous-model-updates',
        number: '6',
        title: 'Continuous Model Evolution',
        content: [
          'MindFlow AI continuously upgrades underlying AI inference architectures (e.g., transitions between Gemini 2.5 and Gemini 3.1 Pro engines). Output characteristics, token lengths, and reasoning styles may evolve over time.',
        ],
      },
    ],
  },

  'data-protection': {
    id: 'data-protection',
    route: '/data-protection',
    title: 'Data Protection & Security Architecture',
    shortDescription:
      'Detailed breakdown of our security posture, database encryption, sub-processors, zero data retention AI agreements, and compliance standards.',
    badge: 'Enterprise Security Architecture',
    lastUpdated: 'September 2, 2026',
    version: 'v2.5',
    icon: Lock,
    sections: [
      {
        id: 'security-overview',
        number: '1',
        title: 'Security Architecture Overview',
        content: [
          'MindFlow AI is architected with enterprise-grade data protection principles from the ground up.',
          'Our platform employs strict network isolation, automated vulnerability scans, role-based backend authorization, and zero-trust access controls to ensure your workspace remains impenetrable.',
        ],
      },
      {
        id: 'data-collection-processing',
        number: '2',
        title: 'Data Collection & Processing Boundaries',
        content: [
          'We adhere to the principle of data minimization: we only collect and process data strictly essential to delivering visual mind-mapping, cloud collaboration, and AI generation features.',
          'All database mutations are tracked with immutable audit timestamps.',
        ],
      },
      {
        id: 'storage-and-encryption',
        number: '3',
        title: 'Storage Infrastructure & Cryptographic Controls',
        content: [
          '• Database Isolation: Primary application records reside in Google Cloud Firestore with granular user-partitioned security rules preventing cross-tenant document queries.',
          '• In-Flight Encryption: Enforced HTTPS/TLS 1.3 with 256-bit elliptic-curve cryptography for all API communications.',
          '• At-Rest Encryption: Full AES-256 block encryption across all databases, cloud backups, and disk volumes.',
        ],
      },
      {
        id: 'ai-data-handling',
        number: '4',
        title: 'AI Processing & Zero-Training Guarantees',
        content: [
          '• Server-Only Key Isolation: All Gemini API keys are maintained exclusively in protected server environments (`process.env.GEMINI_API_KEY`). Client browsers never receive API credentials.',
          '• No Customer Data Training: Prompts and mind maps processed by our enterprise Google GenAI pipeline are NOT stored or used to train foundational AI models.',
        ],
      },
      {
        id: 'user-data-requests',
        number: '5',
        title: 'User Data Requests & Data Portability',
        content: [
          'Under GDPR Article 20 and CCPA, you have the right to obtain a comprehensive export of all your diagrams, tasks, notes, and account data in standard formats (JSON, Markdown, PNG, SVG).',
          'You can generate self-service exports directly from the application workspace or submit an expedited request to data-protection@mindflow.ai.',
        ],
      },
      {
        id: 'data-deletion-protocols',
        number: '6',
        title: 'Data Deletion & Purge Protocols',
        content: [
          'When you delete a mind map, document, or account, cryptographic references are removed immediately, and physical database blocks are overwritten and purged within 30 days across all backup cycles.',
        ],
      },
      {
        id: 'incident-response',
        number: '7',
        title: 'Security Incident Response & Notification',
        content: [
          'MindFlow maintains a 24/7 Security Incident Response Plan. In the unlikely event of a verified data breach impacting personal data, affected users and supervisory regulatory authorities will be notified within 72 hours in compliance with GDPR Article 33.',
        ],
      },
    ],
  },

  copyright: {
    id: 'copyright',
    route: '/copyright',
    title: 'Copyright & DMCA Policy',
    shortDescription:
      'Procedures for copyright ownership, intellectual property protection, reporting copyright infringement under the DMCA, and submitting counter-notices.',
    badge: 'Intellectual Property Protection',
    lastUpdated: 'September 2, 2026',
    version: 'v2.0',
    icon: Copyright,
    sections: [
      {
        id: 'copyright-ownership',
        number: '1',
        title: 'Copyright Ownership & User-Generated Content',
        content: [
          'MindFlow AI respects the intellectual property rights of authors, artists, educators, and creators worldwide, and we expect our users to do the same.',
          'You retain all copyright and proprietary ownership in the original content you create and author on MindFlow.',
        ],
      },
      {
        id: 'dmca-takedown-process',
        number: '2',
        title: 'DMCA Infringement Notification Process',
        content: [
          'In accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512) and international copyright directives, MindFlow will respond expeditiously to notices of alleged copyright infringement.',
          'If you believe that material hosted on MindFlow AI infringes your copyright, you may submit a formal DMCA Notification to our Designated Copyright Agent containing the required elements listed below.',
        ],
      },
      {
        id: 'required-information',
        number: '3',
        title: 'Required Information for Valid DMCA Notices',
        content: [
          'A valid DMCA Takedown Notice MUST include all of the following:',
          '1. Physical or electronic signature of the copyright owner or authorized representative.',
          '2. Identification of the copyrighted work claimed to have been infringed (or representative list).',
          '3. Identification of the infringing material on MindFlow (including specific URL/share link).',
          '4. Contact information of the complaining party (name, address, telephone number, email).',
          '5. A statement of good faith belief that the disputed use is not authorized by the copyright owner, agent, or law.',
          '6. A statement made under penalty of perjury that the information in the notification is accurate and that you are authorized to act on behalf of the owner.',
        ],
      },
      {
        id: 'counter-notice-process',
        number: '4',
        title: 'DMCA Counter-Notification Process',
        content: [
          'If you believe that your content was removed or disabled as a result of mistake or misidentification, you may submit a written Counter-Notification to our Designated Agent containing your physical/electronic signature, identification of removed material, statement under penalty of perjury, and consent to federal jurisdiction.',
        ],
      },
      {
        id: 'repeat-infringer-policy',
        number: '5',
        title: 'Repeat Infringer Policy',
        content: [
          'MindFlow maintains a strict policy of terminating, in appropriate circumstances, user accounts belonging to repeat copyright infringers.',
        ],
      },
      {
        id: 'designated-agent',
        number: '6',
        title: 'Designated Copyright Agent Contact',
        content: [
          'Please direct all DMCA notices and counter-notifications to:',
          'MindFlow AI Inc. — Attn: Copyright Agent',
          'Email: copyright@mindflow.ai | legal@mindflow.ai',
          'Online DMCA Filing: /contact/legal?topic=copyright',
        ],
      },
    ],
  },

  'refund-policy': {
    id: 'refund-policy',
    route: '/refund-policy',
    title: 'Refund & Cancellation Policy',
    shortDescription:
      'Clear, transparent terms regarding paid subscription billing cycles, cancellation procedures, refund eligibility criteria, and consumer rights.',
    badge: 'Billing & Consumer Rights',
    lastUpdated: 'September 2, 2026',
    version: 'v2.2',
    icon: RotateCcw,
    sections: [
      {
        id: 'subscription-billing',
        number: '1',
        title: 'Subscription Billing & Renewals',
        content: [
          'MindFlow AI subscriptions (Pro and Business tiers) are billed on a recurring basis (monthly or annually) according to your chosen plan at the time of purchase.',
          'Subscriptions automatically renew at the end of each billing cycle unless cancelled prior to the renewal date.',
        ],
      },
      {
        id: 'cancellation-process',
        number: '2',
        title: 'How to Cancel Your Subscription',
        content: [
          'You can cancel your paid subscription at any time without fees or penalties:',
          '1. Open MindFlow AI and navigate to Settings > Subscriptions.',
          '2. Click "Manage Billing / Cancel Subscription".',
          '3. Confirm your cancellation.',
          'Your paid features and increased AI limits will remain fully active until the end of your current paid billing period.',
        ],
      },
      {
        id: 'refund-eligibility',
        number: '3',
        title: 'Refund Eligibility & Guidelines',
        content: [
          'MindFlow strives for total user satisfaction. We offer refunds under the following specific circumstances:',
        ],
        subsections: [
          {
            title: 'A. 14-Day Initial Cooling-Off Period (Annual Plans)',
            content: [
              'If you purchase an Annual Pro or Business subscription and determine it does not suit your workflow, you may request a full refund within 14 calendar days of your initial purchase.',
            ],
          },
          {
            title: 'B. Technical Outages & Service Failures',
            content: [
              'If a verified system outage on MindFlow prevents you from accessing your paid workspace for more than 48 consecutive hours, you may request a prorated credit or refund.',
            ],
          },
          {
            title: 'C. Monthly Subscriptions & Consumed AI Credits',
            content: [
              'Monthly subscription renewals are generally non-refundable once the billing period has commenced and AI generation credits have been actively utilized.',
            ],
          },
        ],
      },
      {
        id: 'statutory-rights',
        number: '4',
        title: 'Statutory Consumer Rights (EU/UK/EEA)',
        content: [
          'If you reside in the European Union, United Kingdom, or European Economic Area, you possess statutory rights of withdrawal under consumer protection regulations. We honor all applicable mandatory consumer rights.',
        ],
      },
      {
        id: 'failed-payments',
        number: '5',
        title: 'Failed Payments & Grace Periods',
        content: [
          'If a recurring payment fails, we provide a 5-day grace period during which we will attempt to reprocess your card. If payment cannot be completed, your account will gracefully downgrade to the Free tier without losing your mind maps.',
        ],
      },
      {
        id: 'plan-changes',
        number: '6',
        title: 'Plan Upgrades & Downgrades',
        content: [
          'Upgrading tiers applies immediately with prorated credit applied to your invoice. Downgrading takes effect at the conclusion of your current billing period.',
        ],
      },
      {
        id: 'refund-contact',
        number: '7',
        title: 'Requesting a Refund',
        content: [
          'To request a refund or billing adjustment, contact our billing team:',
          'Email: billing@mindflow.ai | support@mindflow.ai',
          'Inquiry Portal: /contact/legal?topic=billing',
        ],
      },
    ],
  },

  'community-guidelines': {
    id: 'community-guidelines',
    route: '/community-guidelines',
    title: 'Community Guidelines',
    shortDescription:
      'Standards for collaboration, public mind-map sharing, respectful teamwork, and constructive feedback across the MindFlow ecosystem.',
    badge: 'Collaboration & Culture',
    lastUpdated: 'September 2, 2026',
    version: 'v1.8',
    icon: Users,
    sections: [
      {
        id: 'community-values',
        number: '1',
        title: 'MindFlow Community Values',
        content: [
          'MindFlow AI is built to empower curious minds, researchers, students, developers, and visual thinkers. We are committed to fostering an inclusive, welcoming, and intellectually stimulating environment.',
        ],
      },
      {
        id: 'respectful-collaboration',
        number: '2',
        title: 'Respectful Collaboration & Conduct',
        content: [
          '• Treat all collaborators, team members, and community creators with empathy and professional respect.',
          '• Do not engage in trolling, ad hominem attacks, harassment, or personal insults in shared notes, tasks, or comments.',
          '• Respect diverse viewpoints and constructive intellectual disagreement.',
        ],
      },
      {
        id: 'public-map-standards',
        number: '3',
        title: 'Public Sharing & Template Standards',
        content: [
          'When publishing mind maps or study templates to community repositories:',
          '• Ensure accurate topic categorization and descriptive titles.',
          '• Do not share private personal information (PII) or confidential corporate secrets.',
          '• Credit original authors and researchers when citing third-party literature.',
        ],
      },
      {
        id: 'prohibited-community-content',
        number: '4',
        title: 'Prohibited Community Content',
        content: [
          'Content containing hate speech, violent extremism, non-consensual sexual material, deceptive scams, or pyramid schemes is strictly prohibited and subject to immediate removal.',
        ],
      },
      {
        id: 'moderation-enforcement',
        number: '5',
        title: 'Community Moderation & Reporting',
        content: [
          'Our moderation team reviews reported templates and shared workspaces. Users who repeatedly violate community standards may have public sharing privileges revoked or accounts suspended.',
        ],
      },
    ],
  },

  contact: {
    id: 'contact',
    route: '/contact/legal',
    title: 'Legal, Privacy & Compliance Contact',
    shortDescription:
      'Official communication channel for legal inquiries, GDPR/CCPA data requests, DMCA copyright notices, security disclosures, and law enforcement requests.',
    badge: 'Official Legal Registry',
    lastUpdated: 'September 2, 2026',
    version: 'v2.0',
    icon: Mail,
    sections: [
      {
        id: 'legal-contact-directory',
        number: '1',
        title: 'Official Legal Contact Directory',
        content: [
          'MindFlow AI Inc. maintains dedicated specialized channels to expedite inquiries from users, legal counsel, regulatory bodies, and law enforcement:',
        ],
        table: {
          headers: ['Department', 'Email Address', 'Typical Response SLA'],
          rows: [
            ['General Legal Affairs', 'legal@mindflow.ai', '1-2 Business Days'],
            ['Data Protection Officer (DPO)', 'privacy@mindflow.ai', 'Within 24-48 Hours'],
            ['Copyright & DMCA Agent', 'copyright@mindflow.ai', 'Expedited / 24 Hours'],
            ['Trust, Safety & Abuse', 'abuse@mindflow.ai', 'Priority / Immediate'],
            ['Billing & Consumer Rights', 'billing@mindflow.ai', 'Within 24 Hours'],
          ],
        },
      },
      {
        id: 'postal-address',
        number: '2',
        title: 'Corporate Headquarters & Postal Notice',
        content: [
          'Formal legal process, service of subpoenas, or postal notices may be served at:',
          'MindFlow AI Inc.',
          'Attn: Legal Department',
          '500 Howard Street, Suite 400',
          'San Francisco, CA 94105, United States',
        ],
      },
    ],
  },
};

export const ALL_LEGAL_LINKS = [
  { id: 'privacy', route: '/privacy', label: 'Privacy Policy', icon: Shield },
  { id: 'terms', route: '/terms', label: 'Terms of Service', icon: Scale },
  { id: 'cookies', route: '/cookies', label: 'Cookie Policy', icon: Cookie },
  { id: 'acceptable-use', route: '/acceptable-use', label: 'Acceptable Use', icon: CheckCircle2 },
  { id: 'ai-disclaimer', route: '/ai-disclaimer', label: 'AI Disclaimer', icon: Brain },
  { id: 'data-protection', route: '/data-protection', label: 'Data Protection', icon: Lock },
  { id: 'copyright', route: '/copyright', label: 'Copyright & DMCA', icon: Copyright },
  { id: 'refund-policy', route: '/refund-policy', label: 'Refund Policy', icon: RotateCcw },
  { id: 'community-guidelines', route: '/community-guidelines', label: 'Community Guidelines', icon: Users },
  { id: 'contact', route: '/contact/legal', label: 'Legal Contact', icon: Mail },
];
