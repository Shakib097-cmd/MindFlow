import {
  Sparkles,
  BookOpen,
  UserCheck,
  PlusCircle,
  Brain,
  Bot,
  Wrench,
  Palette,
  LayoutTemplate,
  FolderKanban,
  Star,
  Share2,
  Download,
  Save,
  Search,
  Bell,
  Settings,
  Keyboard,
  HelpCircle,
  AlertTriangle,
  FileText,
  MousePointer,
  Maximize2,
  ZoomIn,
  Move,
  Type,
  StickyNote,
  Image,
  Smile,
  Undo2,
  Redo2,
  GitBranch,
  Shield,
  Layers,
  Zap,
} from 'lucide-react';

export interface ManualCategory {
  id: string;
  title: string;
  shortDesc: string;
  icon: any;
  badge?: string;
  articles: ManualArticle[];
}

export interface ManualArticle {
  id: string;
  title: string;
  description: string;
  steps?: string[];
  tips?: string[];
  details?: string;
  codeOrPrompts?: string[];
  tableData?: { headers: string[]; rows: string[][] };
  faqs?: { question: string; answer: string }[];
  troubleshooting?: { problem: string; solutions: string[] }[];
}

export const USER_MANUAL_CATEGORIES: ManualCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    shortDesc: 'Introduction to MindFlow AI, account setup, workspace basics, and first map creation.',
    icon: BookOpen,
    badge: 'Core Basics',
    articles: [
      {
        id: 'what-is-mindflow',
        title: 'What is MindFlow AI?',
        description:
          'MindFlow AI is an intelligent visual thought workspace that turns ideas, voice memos, documents, and messy notes into structured, interactive mind maps and actionable execution plans.',
        steps: [
          'Visual canvas powered by automated force-directed and tree layout algorithms.',
          'Multi-modal AI engine powered by Google Gemini 3.1 for instant node expansion, summarization, and task extraction.',
          'Bi-directional sync between visual mind maps, Kanban task boards, OKR goals, and flashcard study decks.',
          'Real-time Firestore persistence with end-to-end version history and instant multi-format exports.',
        ],
        tips: [
          'You can use MindFlow AI as a guest demo or sign in to save mind maps permanently across all your devices.',
          'Use the keyboard shortcut "?" anywhere on the canvas to open the quick shortcut cheat sheet.',
        ],
      },
      {
        id: 'account-creation-login',
        title: 'Creating an Account & Logging In',
        description: 'How to sign up, sign in with email or Google, and manage your authentication sessions.',
        steps: [
          'Click the "Sign In" or "Get Started" button in the navigation header or landing page.',
          'Choose between Google One-Tap Sign In or enter your email address and password.',
          'New users receive automatic Pro trial credits for AI mind map generations and cloud synchronization.',
          'Stay signed in securely across sessions via encrypted Firebase Authentication tokens.',
        ],
        tips: [
          'Forgot your password? Use the "Forgot Password" link on the login modal to receive a secure reset link.',
        ],
      },
      {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'Tour the main user dashboard, metrics, quick actions, and project hubs.',
        steps: [
          'Workspace Metrics: Monitor active mind maps, open Kanban tasks, completed goals, and AI credit balances in real-time.',
          'Quick Actions: Launch a blank map, trigger the AI prompt generator, import audio/documents, or browse curated templates.',
          'Recent Maps Grid: Jump right back into your recently modified visual canvases with one click.',
          'Execution Hubs: Seamlessly switch between Mind Maps, Tasks Kanban, Goals & OKRs, and Flashcard Study Mode.',
        ],
      },
      {
        id: 'creating-first-map',
        title: 'Creating Your First Mind Map',
        description: 'Step-by-step guide to generating your first visual thought hierarchy from scratch.',
        steps: [
          'Click the "+ Blank Map" button in the left sidebar or on the main dashboard.',
          'Type the title of your Central Topic (e.g., "Product Launch Q4" or "Biology Study Guide").',
          'Press Tab to create your first Child Node branching outward from the center.',
          'Press Enter to add Sibling Nodes on the same hierarchical level.',
          'Drag nodes freely or click "Auto Layout" in the toolbar to organize branches automatically.',
        ],
        tips: [
          'Double-click any node canvas area to edit its text immediately.',
          'Hold the Spacebar and drag with your mouse to pan around the infinite canvas.',
        ],
      },
      {
        id: 'interface-tour',
        title: 'Understanding the Canvas Interface',
        description: 'Comprehensive breakdown of the top toolbar, left sidebar, canvas viewport, and AI drawer.',
        steps: [
          'Top Navigation Bar: Workspace switcher, map title editing, layout algorithm selector, live cloud sync status, AI credits meter, and export controls.',
          'Canvas Viewport: Infinite zoomable 2D workspace with smooth physics, snap-to-grid options, and multi-selection marquee.',
          'Floating Toolbar: Quick access to Add Child, Add Sibling, Change Colors, Attach Notes, Insert Icons, and Auto-Layout.',
          'AI Assistant Drawer: Collapsible right-hand panel for interactive node expansion, brainstorming, summarization, and quiz generation.',
        ],
      },
    ],
  },
  {
    id: 'account-profile',
    title: 'Account & Profile',
    shortDesc: 'Manage your profile details, password security, subscription tier, and preferences.',
    icon: UserCheck,
    articles: [
      {
        id: 'manage-profile',
        title: 'Managing Your Profile & Details',
        description: 'Update your display name, avatar, bio, and contact information in workspace settings.',
        steps: [
          'Click your avatar in the top-right corner and select "Settings" or "Profile".',
          'Navigate to the "Account" tab to update your display name and email address.',
          'Upload a custom avatar image or pick from AI-generated geometric avatars.',
          'Click "Save Profile" to persist updates instantly across your team workspace.',
        ],
      },
      {
        id: 'password-security',
        title: 'Password, Security & Sessions',
        description: 'Change password, manage active browser sessions, and view security logs.',
        steps: [
          'Navigate to User Panel → Settings → Security.',
          'Enter your current password followed by your new secure password (minimum 8 characters with numbers and symbols).',
          'Review active browser sessions and click "Log Out Other Devices" if you suspect unauthorized access.',
        ],
      },
      {
        id: 'account-deletion',
        title: 'Account Deletion & Data Export',
        description: 'How to export your personal data archive (GDPR/CCPA) or permanently delete your account.',
        steps: [
          'Open Settings → Account → Danger Zone.',
          'Click "Export All Data (JSON)" to download an offline backup of all your mind maps, tasks, and notes.',
          'To permanently delete your account, click "Delete Account", enter your confirmation password, and type "DELETE".',
          'All database documents and stored assets are purged within 30 days pursuant to our Privacy Policy.',
        ],
      },
    ],
  },
  {
    id: 'creating-mind-maps',
    title: 'Creating & Editing Mind Maps',
    shortDesc: 'Node hierarchy, branching rules, connections, repositioning, and structure manipulation.',
    icon: PlusCircle,
    badge: 'Editor Mastery',
    articles: [
      {
        id: 'node-creation-hierarchy',
        title: 'Adding Nodes, Children & Siblings',
        description: 'Master the fundamental hotkeys and gestures for expanding your visual tree.',
        steps: [
          'Central Node: Every map starts with a single central node representing the core concept.',
          'Child Nodes (Tab): Select any node and press Tab to spawn a subordinate child branch outward.',
          'Sibling Nodes (Enter): Select any node and press Enter to create a peer node on the same branch level.',
          'Free Nodes: Double-click empty canvas space to create an unattached free node, then drag connection wires to attach it.',
        ],
        tips: [
          'Select multiple nodes by holding Shift and dragging a selection rectangle or clicking individual nodes.',
          'Press Ctrl/Cmd + D to quickly duplicate selected branches.',
        ],
      },
      {
        id: 'reordering-repositioning',
        title: 'Moving, Dragging & Reconnecting Branches',
        description: 'How to reorder nodes, detach branches, and connect cross-concept relationship wires.',
        steps: [
          'Drag to Move: Click and drag any node to reposition it on the canvas. Connected child branches will follow smoothly.',
          'Re-parenting: Drag a node on top of another node until the target highlights to re-parent the entire sub-tree.',
          'Cross-Connections: Click the "Connect" tool in the toolbar, click the source node, and drag the curved wire to the destination node to visualize lateral dependencies.',
          'Arrowhead Customization: Click any connection edge to switch between straight, curved, orthogonal, and bidirectional arrows.',
        ],
      },
      {
        id: 'deleting-renaming',
        title: 'Renaming & Deleting Nodes',
        description: 'Quick editing workflows, batch deletions, and sub-branch pruning.',
        steps: [
          'Renaming: Double-click any node or press F2 to open the inline text editor. Type your new label and press Enter or click outside.',
          'Single Deletion: Select a node and press Delete or Backspace. If the node has children, you will be asked whether to delete children or promote them to siblings.',
          'Undo / Redo: Accidentally deleted something? Press Ctrl/Cmd + Z to undo or Ctrl/Cmd + Shift + Z to redo.',
        ],
      },
    ],
  },
  {
    id: 'ai-generator',
    title: 'AI Mind Map Generator',
    shortDesc: 'Generate comprehensive mind maps from text prompts, documents, or voice inputs using Gemini 3.1.',
    icon: Brain,
    badge: 'AI Powered',
    articles: [
      {
        id: 'how-ai-generator-works',
        title: 'Generating Mind Maps with AI Prompts',
        description: 'How to use natural language prompts to create multi-tiered structured maps in seconds.',
        steps: [
          'Click the "AI Generator" (Sparkles icon) button in the top navbar or sidebar.',
          'Enter your topic or prompt in the text area (e.g., "Comprehensive Go-To-Market Strategy for B2B SaaS").',
          'Select Target Language (English, Spanish, French, German, Japanese, Chinese, etc.).',
          'Choose Depth Level (Concise 2 levels, Standard 3 levels, Deep 4-5 levels).',
          'Set Branch Density (3 to 8 main branches).',
          'Click "Generate Mind Map" and watch Gemini construct the visual tree in real-time.',
          'Review the live preview, then click "Apply to Canvas" to replace or merge into your workspace.',
        ],
        codeOrPrompts: [
          'Create a comprehensive mind map for Digital Marketing Strategy including SEO, Paid Ads, Social, Content, and Analytics.',
          'Create a detailed syllabus and mind map for learning Modern JavaScript from zero to full-stack.',
          'Break down a complete Risk Assessment Matrix for Cloud Migration with technical, compliance, and cost factors.',
          'Generate a high-yield study outline for USMLE Step 1 Renal Pathology with clinical presentations and treatments.',
        ],
        tips: [
          'Be specific in your prompt: Mention target audiences, deadlines, or desired frameworks (e.g., "using the SWOT framework").',
          'If the first output is too broad, click "Regenerate with Deep Focus" to drill into sub-categories.',
        ],
      },
      {
        id: 'expand-existing-branches',
        title: 'AI Branch Expansion & Deep Diving',
        description: 'Use AI to generate sub-branches for existing nodes on your canvas.',
        steps: [
          'Right-click any node on the canvas or select it and click "AI Expand".',
          'Choose an expansion mode: "Brainstorm Ideas", "Sub-Tasks", "Pros & Cons", or "Key Questions".',
          'MindFlow AI will dynamically generate 3–5 intelligent child nodes attached directly to your selected branch.',
        ],
      },
    ],
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant & Copilot',
    shortDesc: 'Interactive chat copilot for brainstorming, summarizing branches, and generating action items.',
    icon: Bot,
    articles: [
      {
        id: 'using-ai-assistant',
        title: 'Using the AI Assistant Drawer',
        description: 'Collaborate with your AI thinking partner right alongside your mind map canvas.',
        steps: [
          'Click the "AI Assistant" icon in the top right to slide open the interactive Copilot drawer.',
          'Ask questions about your current mind map topic (e.g., "What critical risks am I missing here?").',
          'Summarize Branch: Click a node and type "/summarize" to generate a concise 3-sentence executive summary.',
          'Generate Quiz: Type "/quiz" to automatically generate 5 practice questions and flashcards from your map structure.',
          'Click "Apply to Mind Map" on any AI suggestion block to insert the generated points directly into your visual canvas.',
        ],
        tips: [
          'The AI Assistant automatically reads your currently selected node and canvas structure for instant contextual grounding.',
        ],
      },
      {
        id: 'ai-actions-reference',
        title: 'Quick AI Actions & Slash Commands',
        description: 'List of built-in AI copilot commands to accelerate your workflow.',
        tableData: {
          headers: ['Command / Action', 'Description', 'Output Result'],
          rows: [
            ['/expand', 'Deep-dives into the selected node', 'Adds 4-6 detailed child branches'],
            ['/tasks', 'Converts node thoughts into actionable tasks', 'Pushes items into Tasks Kanban'],
            ['/simplify', 'Clarifies complex phrasing', 'Re-labels nodes with crisp wording'],
            ['/examples', 'Generates real-world case studies', 'Appends detailed notes to the node'],
            ['/quiz', 'Creates study flashcards', 'Populates Study Mode practice deck'],
          ],
        },
      },
    ],
  },
  {
    id: 'editor-tools',
    title: 'Mind Map Editor Tools',
    shortDesc: 'Complete reference for selection, notes, attachments, layouts, and canvas navigation.',
    icon: Wrench,
    badge: 'Tool Reference',
    articles: [
      {
        id: 'editor-toolbar-catalog',
        title: 'Toolbar Tools & Function Catalog',
        description: 'Detailed guide to every interactive tool available in the MindFlow AI editor.',
        tableData: {
          headers: ['Tool Name', 'Hotkey', 'Icon', 'Primary Function'],
          rows: [
            ['Select / Pointer', 'V', 'MousePointer', 'Click to select nodes; drag marquee to multi-select.'],
            ['Add Node', 'N', 'PlusCircle', 'Creates a standalone new node at the cursor position.'],
            ['Add Child', 'Tab', 'GitBranch', 'Creates a connected child branch from the selected node.'],
            ['Add Sibling', 'Enter', 'Layers', 'Creates a peer node on the same branch hierarchy.'],
            ['Connect Wire', 'C', 'Zap', 'Draws a custom relationship edge between any two nodes.'],
            ['Text Editor', 'F2', 'Type', 'Edits label text, font size, bold, italic, and alignment.'],
            ['Attach Note', 'Alt + N', 'StickyNote', 'Attaches rich markdown notes and checklists to a node.'],
            ['Insert Icon', 'Alt + I', 'Smile', 'Assigns visual status icons, tags, and emojis to nodes.'],
            ['Auto Layout', 'L', 'LayoutTemplate', 'Re-computes node physics and aligns tree hierarchically.'],
            ['Undo', 'Ctrl/Cmd + Z', 'Undo2', 'Reverts your most recent canvas action.'],
            ['Redo', 'Ctrl/Cmd + Shift + Z', 'Redo2', 'Re-applies previously reverted actions.'],
            ['Zoom In/Out', '+ / -', 'ZoomIn', 'Adjusts canvas zoom scale from 25% to 300%.'],
            ['Fit View', 'F', 'Maximize2', 'Centers and scales the entire mind map to fit the screen.'],
          ],
        },
      },
      {
        id: 'layout-algorithms',
        title: 'Automatic Layout Algorithms',
        description: 'Choose from 6 intelligent structural layouts to visualize ideas in the most effective shape.',
        steps: [
          'Left-to-Right Tree: Classic horizontal tree diagram, ideal for project roadmaps and timeline phases.',
          'Right-to-Left Tree: Compact horizontal layout for Arabic/RTL workflows or left-side dashboards.',
          'Top-to-Bottom (Org Chart): Traditional hierarchical org chart, perfect for team hierarchies and taxonomy classifications.',
          'Radial / Mind Map: Dynamic 360-degree radial explosion surrounding the central node for expansive brainstorming.',
          'Fishbone (Ishikawa): Cause-and-effect problem solving diagram with root cause spines.',
          'Force-Directed Graph: Organic physics-simulated node network that clusters related topics together.',
        ],
      },
    ],
  },
  {
    id: 'customization',
    title: 'Visual Customization & Themes',
    shortDesc: 'Node shapes, color palettes, typography, branch line styles, and dark/light themes.',
    icon: Palette,
    articles: [
      {
        id: 'styling-nodes-branches',
        title: 'Customizing Node Colors, Shapes & Borders',
        description: 'Make your mind maps visually compelling with custom aesthetics and color coding.',
        steps: [
          'Select a node or group of nodes and click the Palette icon in the floating styling bar.',
          'Node Background Color: Pick from curated pastel, vibrant, or dark modern presets or enter custom HEX codes.',
          'Node Shapes: Switch between Rounded Rectangle, Pill / Capsule, Circle, Diamond, and Clean Borderless.',
          'Border Width & Style: Adjust border stroke from 1px to 4px, or switch to Dashed for speculative ideas.',
          'Branch Color Mode: Choose "Inherit Branch Color" to automatically tint entire child sub-trees with matching harmonious colors.',
        ],
      },
      {
        id: 'canvas-themes',
        title: 'Canvas Themes & Backgrounds',
        description: 'Switch between light grid, dark engineering blueprint, minimalist dot matrix, and clean slate.',
        steps: [
          'Click the Settings or Theme icon in the top toolbar.',
          'Select your canvas background pattern: Subtle Dots, Architectural Grid, or Solid Minimalist.',
          'Toggle between Light Mode, Dark Mode, or System Auto-Match in your user preferences.',
        ],
      },
    ],
  },
  {
    id: 'templates',
    title: 'Templates Library',
    shortDesc: 'Browse 16+ curated pro templates across Business, Marketing, Engineering, Education, and Life.',
    icon: LayoutTemplate,
    articles: [
      {
        id: 'using-templates',
        title: 'Browsing, Previewing & Using Templates',
        description: 'Start with battle-tested frameworks rather than staring at a blank canvas.',
        steps: [
          'Click "Templates" in the left sidebar navigation.',
          'Filter by category: Business Strategy, Marketing & Content, Education & Study, Engineering & Architecture, Personal Goals & OKRs, or Meeting Notes.',
          'Search for specific templates using the search bar (e.g., "SWOT", "Sprint Retrospective", "User Journey").',
          'Click on any template card to inspect its full node hierarchy and preview preview data.',
          'Click "Use Template" to instantiate a brand new editable copy in your workspace instantly.',
        ],
      },
      {
        id: 'template-categories',
        title: 'Curated Template Categories Reference',
        description: 'Overview of the 8 core template domains pre-installed in MindFlow AI.',
        tableData: {
          headers: ['Category', 'Featured Templates', 'Best Used For'],
          rows: [
            ['Business & Strategy', 'SWOT Analysis, Business Model Canvas, PESTEL Analysis, Competitive Matrix', 'Executive planning and strategic pitches'],
            ['Marketing & Growth', 'Go-To-Market Plan, Content Strategy, Growth Funnel, Buyer Persona Map', 'Campaign launches and SEO planning'],
            ['Engineering & Tech', 'Microservices Architecture, DevOps Pipeline, System Design, Security Audit', 'Technical system planning and RFCs'],
            ['Brainstorming', 'Six Thinking Hats, SCAMPER Technique, Reverse Brainstorming, Crazy Eights', 'Creative problem solving sessions'],
            ['Project Planning', 'Agile Sprint Kickoff, Project Scope Breakdown, Risk Register, RACI Matrix', 'Delivery tracking and milestone mapping'],
            ['Education & Study', 'USMLE Medical Deck, Computer Science Algorithms, World History Timeline', 'Deep conceptual learning and exams'],
            ['Personal Goals', 'Annual Life Roadmap, Habit Loop Builder, OKR Tracker, Financial Budget', 'Personal growth and monthly reviews'],
            ['Meetings & Workshops', 'Executive 1-on-1 Prep, Sprint Retrospective, Decision Tree Workshop', 'Structured meetings and action items'],
          ],
        },
      },
    ],
  },
  {
    id: 'my-maps',
    title: 'My Mind Maps & Organization',
    shortDesc: 'Organize maps into colored folders, search, filter, sort, star favorites, and manage trash.',
    icon: FolderKanban,
    articles: [
      {
        id: 'managing-maps',
        title: 'Managing, Searching & Filtering Maps',
        description: 'Organize dozens of visual projects cleanly with folders and tags.',
        steps: [
          'Grid & List Views: Toggle between responsive card grid and compact table view in the top right.',
          'Search: Type any keyword to instantly filter across map titles, node contents, and descriptions.',
          'Sorting: Sort by "Last Updated", "Node Count", or "Alphabetical (A-Z)".',
          'Folders: Click "+ New Folder", give it a name and color, and drag maps into folders to categorize by project.',
          'Favorites: Click the Star icon on any map card to pin it to your quick-access Favorites list.',
        ],
      },
      {
        id: 'trash-recovery',
        title: 'Trash, Archiving & Restoring Maps',
        description: 'How to recover accidentally deleted maps or purge them permanently.',
        steps: [
          'Deleting a Map: Click the "..." menu on any map card and select "Move to Trash".',
          'Accessing Trash: Click the "Trash" tab or sidebar link to view all discarded canvases.',
          'Restore: Click "Restore" on any trashed map to return it to your active workspace with full history intact.',
          'Permanent Purge: Trashed items remain recoverable for 30 days before automatic cleanup, or click "Empty Trash Now".',
        ],
      },
    ],
  },
  {
    id: 'sharing-collaboration',
    title: 'Sharing & Collaboration',
    shortDesc: 'Shareable links, viewer vs editor permissions, password protection, and live co-editing.',
    icon: Share2,
    badge: 'Collaboration',
    articles: [
      {
        id: 'share-settings',
        title: 'Generating Share Links & Permissions',
        description: 'Share mind maps with colleagues, clients, or publish interactive read-only presentations.',
        steps: [
          'Open your mind map canvas and click the "Share" button in the top navbar.',
          'Access Control: Choose between "Private (Only You)", "Anyone with Link Can View", or "Anyone with Link Can Edit".',
          'Click "Copy Link" to share the direct URL with team members.',
          'Read-Only Viewer Mode: Viewers can pan, zoom, search, and click nodes to view attached notes, but cannot alter the structure.',
          'Public Embed: Copy the iframe embed code to embed your interactive mind map directly in Notion, Confluence, or custom websites.',
        ],
      },
      {
        id: 'collaboration-etiquette',
        title: 'Real-Time Sync & Version Safety',
        description: 'How MindFlow AI handles real-time synchronization and conflict resolution.',
        steps: [
          'Live Firestore Presence: Real-time optimistic UI updates allow seamless editing even on fluctuating network connections.',
          'Version History: Every major change automatically logs a snapshot. Open "Version History" from the top menu to rollback to previous versions at any time.',
        ],
      },
    ],
  },
  {
    id: 'exporting',
    title: 'Export & Publishing',
    shortDesc: 'Export to PNG, High-Resolution JPG, Vector SVG, PDF Document, or JSON data archive.',
    icon: Download,
    articles: [
      {
        id: 'export-formats',
        title: 'Export Formats & Resolution Options',
        description: 'Download your visual maps for presentations, documentation, or vector editing.',
        tableData: {
          headers: ['Format', 'Extension', 'Best For', 'Features'],
          rows: [
            ['PNG Image', '.png', 'Slide decks, Slack, Notion', 'Crisp raster export with transparent or solid background.'],
            ['JPG Image', '.jpg', 'General web and document sharing', 'Lightweight compressed image format.'],
            ['Vector SVG', '.svg', 'Figma, Illustrator, large prints', 'Lossless infinite resolution vector graphics with editable text.'],
            ['PDF Document', '.pdf', 'Client reports, printing, formal docs', 'Multi-page or single-page PDF with sharp vector rendering.'],
            ['JSON Data', '.json', 'Backup, programmatic migration', 'Complete raw data schema containing all nodes, coordinates, notes, and edges.'],
          ],
        },
        steps: [
          'Click "Export" in the top navbar.',
          'Select your desired format (PNG, JPG, SVG, PDF, or JSON).',
          'Choose Scope: "Export Entire Mind Map" (captures all nodes) or "Export Current Visible Viewport".',
          'Resolution Multiplier: Select 1x (Standard), 2x (Retina), or 4x (Ultra HD for large wall prints).',
          'Click "Download File" to save the file directly to your device.',
        ],
      },
    ],
  },
  {
    id: 'autosave-sync',
    title: 'Autosave & Cloud Synchronization',
    shortDesc: 'How automated saving works, offline caching, and resolving sync errors.',
    icon: Save,
    articles: [
      {
        id: 'autosave-system',
        title: 'Autosave Statuses & Cloud State',
        description: 'Understand the live sync indicator in the top navbar.',
        steps: [
          'Saving... (Yellow Pulse): MindFlow AI detected a node change and is bundling an encrypted payload.',
          'Saved / Synced (Green Check): Your canvas state is permanently secured in your cloud Firestore database.',
          'Offline Mode (Blue Cloud): You are currently offline. All changes are stored in local browser IndexedDB and will auto-sync as soon as your connection resumes.',
          'Sync Failed (Red Alert): Network timeout. Click the "Retry Sync" button in the status popup to re-send changes immediately.',
        ],
        troubleshooting: [
          {
            problem: 'Canvas shows "Sync Failed" or save spinner does not stop',
            solutions: [
              'Check your internet connection by opening another tab.',
              'Click the sync status badge in the navbar and click "Sync Now".',
              'Do not refresh the tab immediately; your local browser state retains your changes safely.',
              'If the issue persists, export a temporary JSON backup via Export → JSON.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts Reference',
    shortDesc: 'Complete table of productivity hotkeys for lightning-fast visual mind mapping.',
    icon: Keyboard,
    badge: 'Productivity',
    articles: [
      {
        id: 'shortcuts-table',
        title: 'Essential Keyboard Shortcuts',
        description: 'Keep your hands on the keyboard and build complex hierarchies at the speed of thought.',
        tableData: {
          headers: ['Shortcut (Mac / Win)', 'Action Name', 'Category', 'Description'],
          rows: [
            ['Tab', 'Add Child Node', 'Structure', 'Spawns a new child branch from currently selected node.'],
            ['Enter', 'Add Sibling Node', 'Structure', 'Creates a peer node on the same branch level.'],
            ['Delete / Backspace', 'Delete Node', 'Structure', 'Deletes selected node(s) and prompts for child handling.'],
            ['Ctrl / Cmd + Z', 'Undo', 'History', 'Reverts the previous canvas or text action.'],
            ['Ctrl / Cmd + Shift + Z', 'Redo', 'History', 'Re-applies previously undone action.'],
            ['Ctrl / Cmd + S', 'Manual Save', 'Sync', 'Forces an immediate cloud sync flush.'],
            ['Ctrl / Cmd + D', 'Duplicate Branch', 'Structure', 'Clones selected node and all its children.'],
            ['Ctrl / Cmd + A', 'Select All', 'Selection', 'Selects all nodes on the canvas.'],
            ['Space + Drag', 'Pan Canvas', 'Navigation', 'Smoothly drags the viewport canvas.'],
            ['Scroll Wheel / Pinch', 'Zoom Canvas', 'Navigation', 'Zooms in and out centered on mouse cursor.'],
            ['F / Home', 'Fit to Screen', 'Navigation', 'Centers and frames all nodes inside the viewport.'],
            ['F2', 'Inline Edit Text', 'Editing', 'Activates inline text input for selected node.'],
            ['Alt + N', 'Open Node Notes', 'Details', 'Opens rich markdown notes drawer for selected node.'],
            ['L', 'Trigger Auto-Layout', 'Layout', 'Re-computes hierarchical tree spacing.'],
            ['?', 'Shortcuts Cheat Sheet', 'Help', 'Opens the interactive shortcut modal overlay.'],
          ],
        },
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting & Diagnostics',
    shortDesc: 'Diagnose and resolve AI generation timeouts, export hiccups, and permission issues.',
    icon: AlertTriangle,
    badge: 'Fix Issues',
    articles: [
      {
        id: 'common-troubleshooting',
        title: 'Frequently Encountered Issues & Fixes',
        description: 'Quick solutions for the most common technical hurdles.',
        troubleshooting: [
          {
            problem: 'AI Generation Failed or Timed Out',
            solutions: [
              'Verify your device has an active internet connection.',
              'Check your monthly AI generation credits in the top navbar or Settings → Usage.',
              'Simplify your prompt: Overly long prompts (over 1,000 words) may hit token timeouts. Try breaking it into a concise topic outline first.',
              'Click "Regenerate" or try a different depth preset (e.g. Standard 3 levels instead of Deep 5 levels).',
            ],
          },
          {
            problem: 'Mind Map is Not Saving or Displays Error Banner',
            solutions: [
              'Check your network connection; if offline, MindFlow AI caches edits locally.',
              'Click the Sync badge in the top navbar and click "Sync Now".',
              'Check if your browser has third-party cookies or storage disabled.',
              'If saving continues to fail, export an offline JSON backup before reloading the page.',
            ],
          },
          {
            problem: 'Share Link Shows "Access Denied" or Blank Page',
            solutions: [
              'Ensure the map owner has set Share permissions to "Anyone with link" rather than "Private".',
              'Verify the URL was copied completely without trailing characters.',
              'If the map was set to private, ensure the recipient is logged into an authorized account.',
            ],
          },
          {
            problem: 'Export Image is Blurry or Missing Outer Nodes',
            solutions: [
              'In the Export dialog, choose "Export Entire Mind Map" instead of "Current Viewport".',
              'Increase the resolution multiplier to 2x or 4x (Ultra HD) for presentation-grade sharpness.',
              'For vector-crisp documents without any pixelation, export in SVG or PDF format.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    shortDesc: 'Answers to the most common questions about pricing, storage, privacy, and features.',
    icon: HelpCircle,
    badge: '11 Questions',
    articles: [
      {
        id: 'faq-list',
        title: 'General FAQ & Answers',
        description: 'Clear answers to everything you need to know about MindFlow AI.',
        faqs: [
          {
            question: 'What is MindFlow AI?',
            answer:
              'MindFlow AI is a modern visual workspace that turns thoughts, voice memos, and documents into clean mind maps, Kanban tasks, and study decks using Google Gemini 3.1 Pro AI.',
          },
          {
            question: 'How do I create a Mind Map from scratch?',
            answer:
              'Click "+ Blank Map" in the left sidebar or top navbar. Enter your central topic name, then press Tab to spawn child branches and Enter to add sibling branches.',
          },
          {
            question: 'How does AI mind map generation work?',
            answer:
              'Our engine analyzes your topic prompt and uses structured JSON schema generation with Google Gemini to build a fully validated tree of connected nodes, notes, and visual color palettes in seconds.',
          },
          {
            question: 'Can I edit AI-generated maps manually?',
            answer:
              'Yes! Every node, branch, color, and note produced by the AI is 100% editable. You can freely drag, rename, style, delete, and add your own thoughts.',
          },
          {
            question: 'How do I share a Mind Map with others?',
            answer:
              'Click the "Share" button in the top navbar, toggle access to "Anyone with link can view" or "edit", and click "Copy Link". You can also generate an interactive HTML embed code.',
          },
          {
            question: 'Can I export my Mind Map to image or PDF?',
            answer:
              'Yes. MindFlow AI supports instant high-resolution exports in PNG, JPG, Vector SVG, PDF Document, and raw JSON data formats at up to 4x resolution.',
          },
          {
            question: 'How does autosave and cloud synchronization work?',
            answer:
              'Every action you take on the canvas is debounced and automatically synchronized with your encrypted Firebase Firestore cloud database. You never have to manually hit save.',
          },
          {
            question: 'Can I restore a deleted Mind Map?',
            answer:
              'Yes. Deleted maps are placed into the "Trash" folder where they can be restored at any time within 30 days. After 30 days, they are permanently purged.',
          },
          {
            question: 'How do I change my password or profile info?',
            answer:
              'Click your profile avatar in the top navbar, select "Settings", and navigate to the "Account" or "Security" tab to change your password or update your profile.',
          },
          {
            question: 'How do I permanently delete my account and data?',
            answer:
              'Go to Settings → Account → Danger Zone, and select "Delete Account". You can also export a full GDPR data archive containing all your mind maps and notes beforehand.',
          },
          {
            question: 'How do I contact customer support?',
            answer:
              'You can reach our dedicated support engineering team 24/7 by clicking "Contact Support" in the User Manual, footer, or by sending an email to support@mindflow.ai.',
          },
        ],
      },
    ],
  },
];
