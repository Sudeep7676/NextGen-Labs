export const NAV_LINKS = [
  { label: "Products", href: "#products" },
  { label: "Technology", href: "#technology" },
  { label: "Innovation", href: "#innovation" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const TRUST_BADGES = [
  "MSME Certified Startup",
  "AI Product Company",
  "SaaS Platform Builder",
  "Cloud-Native Architecture",
  "Enterprise Software Solutions",
];

export interface Product {
  id: string;
  index: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  tags: string[];
  stats: { value: string; label: string }[];
  status: string;
  accent: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "talentos",
    index: "01",
    name: "TalentOS",
    tagline: "AI Career Operating System",
    description:
      "A complete operating system for careers — connecting students, recruiters, and institutions on a single intelligent, multi-tenant platform.",
    features: [
      "AI Interview Studio",
      "AI Resume Intelligence",
      "AI Job Matching Engine",
      "Career Roadmaps",
      "Recruiter Workspace",
      "Student Workspace",
      "Admin Platform",
      "Multi-Tenant Architecture",
      "Analytics & Reporting",
      "Enterprise Security",
    ],
    tags: ["Students", "Recruiters", "Institutions", "Enterprises"],
    stats: [
      { value: "6", label: "Workspaces" },
      { value: "Multi-tenant", label: "Architecture" },
      { value: "SSO", label: "Enterprise-ready" },
    ],
    status: "Flagship Platform",
    accent: "from-sky-500 to-blue-600",
  },
  {
    id: "resume-optimizer",
    index: "02",
    name: "Resume Optimizer",
    tagline: "AI Resume Intelligence Platform",
    description:
      "Precision resume intelligence that reads like a recruiter and scores like an ATS — turning raw experience into interview-ready documents.",
    features: [
      "ATS Analysis",
      "Resume Scoring",
      "Resume Enhancement",
      "AI Recommendations",
      "Resume Optimization",
      "Skill Gap Detection",
      "Professional Formatting",
    ],
    tags: ["Job Seekers", "Career Teams", "Universities"],
    stats: [
      { value: "ATS", label: "Scoring engine" },
      { value: "7", label: "AI modules" },
      { value: "Real-time", label: "Feedback" },
    ],
    status: "Live Product",
    accent: "from-blue-500 to-cyan-500",
  },
];

export const WHY_CARDS = [
  {
    title: "AI-First Product Development",
    body: "Every product begins with intelligence at its core — not bolted on after the fact.",
  },
  {
    title: "Enterprise Architecture",
    body: "Systems engineered for scale, compliance, and the demands of serious organizations.",
  },
  {
    title: "Cloud-Native Infrastructure",
    body: "Elastic, resilient platforms built to run globally with zero-downtime deployments.",
  },
  {
    title: "Security-First Engineering",
    body: "Encryption, isolation, and least-privilege access designed in from day one.",
  },
  {
    title: "Scalable Systems",
    body: "From first user to millions — architectures that grow without rewrites.",
  },
  {
    title: "Modern User Experiences",
    body: "Interfaces that feel effortless, considered, and genuinely delightful to use.",
  },
];

export interface TechLayer {
  name: string;
  detail: string;
  description: string;
  tags: string[];
}

export const TECH_LAYERS: TechLayer[] = [
  {
    name: "Frontend",
    detail: "React 19 · TypeScript · Edge-rendered UI",
    description:
      "The experience layer — fast, accessible interfaces rendered at the edge for instant, fluid interaction.",
    tags: ["React 19", "TypeScript", "Tailwind", "Edge SSR"],
  },
  {
    name: "Backend",
    detail: "Distributed services · Event-driven APIs",
    description:
      "Distributed, event-driven services that stay responsive under load and scale horizontally on demand.",
    tags: ["Node", "GraphQL", "Event Bus", "Queues"],
  },
  {
    name: "AI Layer",
    detail: "LLMs · Embeddings · Inference pipelines",
    description:
      "The intelligence core — LLMs, embeddings, and inference pipelines powering every product decision.",
    tags: ["LLMs", "Embeddings", "RAG", "Inference"],
  },
  {
    name: "Cloud Infrastructure",
    detail: "Auto-scaling · Multi-region · IaC",
    description:
      "Elastic, multi-region infrastructure defined as code, with zero-downtime deploys and self-healing.",
    tags: ["Auto-scaling", "Multi-region", "IaC", "Containers"],
  },
  {
    name: "Security Layer",
    detail: "Zero-trust · Encryption · Isolation",
    description:
      "Zero-trust security with end-to-end encryption, tenant isolation, and least-privilege access by default.",
    tags: ["Zero-trust", "Encryption", "SSO", "Isolation"],
  },
  {
    name: "Analytics Layer",
    detail: "Real-time telemetry · Insights engine",
    description:
      "Real-time telemetry and an insights engine that turn raw signals into decisions as they happen.",
    tags: ["Telemetry", "Dashboards", "Events", "Insights"],
  },
];

export interface InnovationCard {
  title: string;
  body: string;
  status: string;
}

export const INNOVATION_CARDS: InnovationCard[] = [
  {
    title: "AI Agents",
    body: "Autonomous agents that reason, plan, and execute complex multi-step workflows.",
    status: "In Development",
  },
  {
    title: "Autonomous Workflows",
    body: "Self-orchestrating pipelines that remove manual friction from operations.",
    status: "Research",
  },
  {
    title: "Career Intelligence",
    body: "Predictive models that map skills to opportunities across entire markets.",
    status: "Live Beta",
  },
  {
    title: "Enterprise AI",
    body: "Private, governed intelligence tailored to the enterprise knowledge graph.",
    status: "In Development",
  },
  {
    title: "Predictive Analytics",
    body: "Forecasting engines that turn signals into decisions before the moment arrives.",
    status: "Research",
  },
  {
    title: "Next Generation SaaS",
    body: "Composable, intelligent products defining the next decade of software.",
    status: "Vision",
  },
];

export const METRICS = [
  { value: 2, suffix: "+", label: "Products Built" },
  { value: 1.2, suffix: "M+", label: "AI Generations", decimals: 1 },
  { value: 8.5, suffix: "M+", label: "Platform Requests", decimals: 1 },
  { value: 50, suffix: "K+", label: "Users Served" },
  { value: 99, suffix: "%", label: "Customer Satisfaction" },
  { value: 99.9, suffix: "%", label: "Platform Availability", decimals: 1 },
];

export const CONTACT_OPTIONS = [
  "Book Demo",
  "Partnership Inquiry",
  "Product Inquiry",
  "Careers",
];

export const CORE_VALUES = [
  {
    title: "Intelligence First",
    body: "AI is the foundation of every decision, feature, and workflow we ship.",
  },
  {
    title: "Built to Last",
    body: "We engineer durable systems, not disposable demos or throwaway MVPs.",
  },
  {
    title: "People at the Center",
    body: "Technology should amplify human potential — never complicate it.",
  },
  {
    title: "Radical Clarity",
    body: "Complex problems, simple experiences. Clarity is a feature.",
  },
];

export const MISSION_POINTS = [
  "Simplify complex workflows with intelligent automation",
  "Empower individuals and institutions with real capability",
  "Ship products that scale from one user to millions",
];

export const VISION_POINTS = [
  "Define the next generation of AI-powered platforms",
  "Earn global recognition through engineering excellence",
  "Build an ecosystem that compounds in value over time",
];
