import {
  BarChart3,
  Compass,
  History,
  LayoutDashboard,
  Mail,
  MessageSquarePlus,
  Rocket,
  Search,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface Lead {
  id: number;
  companyName: string;
  businessType: string;
  website: string;
  email: string;
  phone?: string;
  location: string;
  leadScore: number;
  reason: string;
}

export interface EmailDraft {
  companyName: string;
  subject: string;
  body: string;
  status: "Draft" | "Sent";
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface SuggestionItem {
  title: string;
  prompt: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { label: "New Chat", path: "/", icon: MessageSquarePlus },
  { label: "Search Leads", path: "/", icon: Search },
  { label: "Generate Emails", path: "/", icon: Mail },
  { label: "Campaigns", path: "/campaigns", icon: Rocket },
  { label: "History", path: "/history", icon: History },
  { label: "Settings", path: "/settings", icon: Settings },
];

export const suggestionCards: SuggestionItem[] = [
  {
    title: "Find supermarkets that can buy my biscuits",
    prompt: "Find supermarkets that can buy my biscuits in Lagos and Abuja.",
    icon: "🔍",
  },
  {
    title: "Find distributors in Nigeria",
    prompt: "Find distributors in Nigeria for food and beverage products.",
    icon: "🏪",
  },
  {
    title: "Generate cold emails",
    prompt:
      "Generate cold emails for high-intent prospects in the FMCG market.",
    icon: "📧",
  },
  {
    title: "Launch outreach campaign",
    prompt: "Create a launch outreach campaign for new product distribution.",
    icon: "🚀",
  },
];

export const leads: Lead[] = [
  {
    id: 1,
    companyName: "Apex Supermarket",
    businessType: "Retail Grocery",
    website: "https://apexmarket.com",
    email: "procurement@apexmarket.com",
    phone: "+234 801 234 5678",
    location: "Lagos, Nigeria",
    leadScore: 94,
    reason:
      "High volume of weekly inventory orders and strong fit for premium biscuit products.",
  },
  {
    id: 2,
    companyName: "Northwind Distributors",
    businessType: "Wholesale Distribution",
    website: "https://northwinddist.com",
    email: "sales@northwinddist.com",
    phone: "+234 813 908 1122",
    location: "Abuja, Nigeria",
    leadScore: 91,
    reason:
      "Expanding FMCG portfolio and active procurement for regional retail chains.",
  },
  {
    id: 3,
    companyName: "Prime Foods Ltd.",
    businessType: "Food Manufacturing",
    website: "https://primefoods.ng",
    email: "partnerships@primefoods.ng",
    location: "Port Harcourt, Nigeria",
    leadScore: 88,
    reason:
      "Strong cross-sell opportunity with their own retail and hospitality clients.",
  },
  {
    id: 4,
    companyName: "Bluehaven Retail Group",
    businessType: "Retail Chain",
    website: "https://bluehavenretail.com",
    email: "ops@bluehavenretail.com",
    phone: "+234 809 771 3344",
    location: "Kano, Nigeria",
    leadScore: 87,
    reason:
      "Fast-growing chain with consistent demand for branded impulse products.",
  },
];

export const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Workspace",
    subtitle: "Find prospects, draft emails, and launch outreach.",
  },
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Monitor performance and recent activity.",
  },
  "/history": {
    title: "History",
    subtitle: "Review your search activity, lead lists, and sent emails.",
  },
  "/leads": {
    title: "Leads",
    subtitle: "Review qualified opportunities and pipeline health.",
  },
  "/campaigns": {
    title: "Campaigns",
    subtitle: "Coordinate outreach initiatives and outreach momentum.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Tune your sales automation preferences.",
  },
};

export const placeholderCards = [
  {
    title: "Revenue Pulse",
    description:
      "Projected pipeline growth across your active outreach programs.",
    icon: LayoutDashboard,
  },
  {
    title: "Lead Quality",
    description:
      "High-intent opportunities identified from your latest searches.",
    icon: Sparkles,
  },
  {
    title: "Automation Health",
    description:
      "Campaign delivery, follow-ups, and response tracking remain healthy.",
    icon: BarChart3,
  },
  {
    title: "Customer Focus",
    description:
      "A strong focus on retail, FMCG, and distributor relationships.",
    icon: Compass,
  },
];
