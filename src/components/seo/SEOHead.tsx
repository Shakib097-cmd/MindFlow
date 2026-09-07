import React, { useEffect, useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface RouteSEOConfig {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogType?: string;
}

export const SEO_ROUTE_CONFIGS: Record<string, RouteSEOConfig> = {
  landing: {
    title: 'MindWorkflow – AI Workflow Automation & AI Workspace',
    description: 'MindWorkflow is an AI-powered workspace for creating workflows, automating tasks, and turning ideas into action. Build smarter workflows with AI.',
    canonical: 'https://mindworkflow.in/',
    robots: 'index, follow',
    ogType: 'website',
  },
  features: {
    title: 'MindWorkflow Features – AI Workflows, Automation & AI Agents',
    description: 'Explore MindWorkflow features: AI workflow automation, Action Tasks Kanban, voice transcription, document ingestion, and intelligent study flashcards.',
    canonical: 'https://mindworkflow.in/features',
    robots: 'index, follow',
    ogType: 'website',
  },
  pricing: {
    title: 'MindWorkflow Pricing – Free AI Workflow Automation & AI Workspace',
    description: 'MindWorkflow pricing and lifetime free access. Build unlimited AI workflows, visual mind maps, and Kanban execution boards without subscription friction.',
    canonical: 'https://mindworkflow.in/pricing',
    robots: 'index, follow',
    ogType: 'website',
  },
  templates: {
    title: 'MindWorkflow Templates – Ready-to-Use AI Workflow Blueprints',
    description: 'Accelerate execution with curated AI workflow blueprints for startup product strategy, systems engineering, sprint roadmaps, and revision decks.',
    canonical: 'https://mindworkflow.in/templates',
    robots: 'index, follow',
    ogType: 'website',
  },
  manual: {
    title: 'MindWorkflow Documentation & User Manual – AI Workflows & Guides',
    description: 'Comprehensive guides and documentation on AI workflow automation, node structures, Kanban boards, and multimodal inputs in MindWorkflow.',
    canonical: 'https://mindworkflow.in/manual',
    robots: 'index, follow',
    ogType: 'article',
  },
  user_manual: {
    title: 'MindWorkflow Documentation & User Manual – AI Workflows & Guides',
    description: 'Comprehensive guides and documentation on AI workflow automation, node structures, Kanban boards, and multimodal inputs in MindWorkflow.',
    canonical: 'https://mindworkflow.in/manual',
    robots: 'index, follow',
    ogType: 'article',
  },
  legal_privacy: {
    title: 'Privacy Policy – MindWorkflow AI Data Protection',
    description: 'Read the official MindWorkflow Privacy Policy, enterprise data retention standards, and GDPR & CCPA privacy compliance details.',
    canonical: 'https://mindworkflow.in/privacy',
    robots: 'index, follow',
    ogType: 'article',
  },
  legal_terms: {
    title: 'Terms of Service – MindWorkflow AI Workspace Agreement',
    description: 'Official Terms of Service and acceptable use conditions for the MindWorkflow AI workflow automation platform.',
    canonical: 'https://mindworkflow.in/terms',
    robots: 'index, follow',
    ogType: 'article',
  },
  legal_cookies: {
    title: 'Cookie Policy – MindWorkflow AI Privacy Preferences',
    description: 'Information about how MindWorkflow uses cookies and local storage to preserve workspace state and secure session tokens.',
    canonical: 'https://mindworkflow.in/cookies',
    robots: 'index, follow',
    ogType: 'article',
  },
  legal_security: {
    title: 'Security & Encryption Standards – MindWorkflow AI',
    description: 'Enterprise data security, TLS 1.3 encryption, AES-256 cloud storage, and zero-retention AI inference protocols at MindWorkflow.',
    canonical: 'https://mindworkflow.in/security',
    robots: 'index, follow',
    ogType: 'article',
  },
  legal_contact: {
    title: 'Contact MindWorkflow – AI Workflow Automation & Support',
    description: 'Contact the MindWorkflow team for support, enterprise inquiries, compliance questions, and product assistance.',
    canonical: 'https://mindworkflow.in/contact',
    robots: 'index, follow',
    ogType: 'website',
  },
  legal_other: {
    title: 'Compliance & Legal Center – MindWorkflow',
    description: 'Official regulatory, copyright, and compliance documentation for MindWorkflow.',
    canonical: 'https://mindworkflow.in/legal',
    robots: 'index, follow',
    ogType: 'article',
  },
  // Private application views - marked as noindex
  dashboard: {
    title: 'Workspace Dashboard – MindWorkflow',
    description: 'Manage your AI workflows, mind maps, tasks, and recent projects.',
    canonical: 'https://mindworkflow.in/dashboard',
    robots: 'noindex, nofollow',
  },
  editor: {
    title: 'Visual Workflow Editor – MindWorkflow',
    description: 'Interactive canvas for mind mapping, AI branch ideation, and node hierarchy design.',
    canonical: 'https://mindworkflow.in/editor',
    robots: 'noindex, nofollow',
  },
  my_maps: {
    title: 'My Maps & Projects – MindWorkflow',
    description: 'Browse, manage, and organize all your visual thought workflows and project blueprints.',
    canonical: 'https://mindworkflow.in/my-maps',
    robots: 'noindex, nofollow',
  },
  tasks: {
    title: 'Action Tasks Kanban – MindWorkflow',
    description: 'Prioritized sprint task execution board converted from mind map concepts.',
    canonical: 'https://mindworkflow.in/tasks',
    robots: 'noindex, nofollow',
  },
  goals: {
    title: 'Strategic Goals & OKRs – MindWorkflow',
    description: 'Track long-term milestones and quarterly objectives.',
    canonical: 'https://mindworkflow.in/goals',
    robots: 'noindex, nofollow',
  },
  study_mode: {
    title: 'AI Study & Flashcards – MindWorkflow',
    description: 'Interactive spaced repetition study deck generated from visual workflows.',
    canonical: 'https://mindworkflow.in/study',
    robots: 'noindex, nofollow',
  },
  presentation: {
    title: 'Slide Deck Presentation – MindWorkflow',
    description: 'Interactive presentation slides generated from mind maps.',
    canonical: 'https://mindworkflow.in/presentation',
    robots: 'noindex, nofollow',
  },
  admin: {
    title: 'Administration Panel – MindWorkflow',
    description: 'Platform management and audit controls.',
    canonical: 'https://mindworkflow.in/admin',
    robots: 'noindex, nofollow',
  },
};

export const SEOHead: React.FC = () => {
  const { currentView, legalDocId } = useWorkspace();
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  // Keep track of pathname changes for accurate SEO updates
  useEffect(() => {
    const updatePath = () => {
      if (typeof window !== 'undefined') {
        setCurrentPath(window.location.pathname);
      }
    };
    window.addEventListener('popstate', updatePath);
    return () => window.removeEventListener('popstate', updatePath);
  }, []);

  useEffect(() => {
    let key = currentView as string;

    // Check pathname overrides first for canonical landing subroutes
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path === '/features') key = 'features';
    else if (path === '/pricing') key = 'pricing';
    else if (path === '/manual' || path.startsWith('/help/user-manual') || path.startsWith('/user-manual')) key = 'manual';
    else if (path === '/templates' || currentView === 'templates') key = 'templates';
    else if (currentView === 'legal') {
      if (legalDocId === 'privacy' || path === '/privacy') key = 'legal_privacy';
      else if (legalDocId === 'terms' || path === '/terms') key = 'legal_terms';
      else if (legalDocId === 'cookies' || path === '/cookies') key = 'legal_cookies';
      else if (legalDocId === 'data-protection' || path === '/security' || path === '/data-protection') key = 'legal_security';
      else if (legalDocId === 'contact' || path === '/contact') key = 'legal_contact';
      else key = 'legal_other';
    } else if (currentView === 'user_manual') {
      key = 'manual';
    }

    const config = SEO_ROUTE_CONFIGS[key] || SEO_ROUTE_CONFIGS.landing;

    // 1. Update Title
    document.title = config.title;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', config.description);

    // 3. Update Meta Robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', config.robots);

    // 4. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', config.canonical);

    // 5. Update Open Graph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', config.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', config.description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', config.canonical);

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType && config.ogType) ogType.setAttribute('content', config.ogType);

    // 6. Update Twitter Card Tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', config.title);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', config.description);

    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute('content', config.canonical);
  }, [currentView, legalDocId, currentPath]);

  return null;
};
