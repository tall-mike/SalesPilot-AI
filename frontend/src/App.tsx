import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  CheckCircle2,
  LoaderCircle,
  SendHorizonal,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { PlaceholderPage } from "./components/PlaceholderPage";
import {
  pageMeta,
  suggestionCards,
  type EmailDraft,
  type Lead,
} from "./data/mockData";
import "./App.css";

const STORAGE_KEY = "salespilot-history";

type HistoryEntry = {
  id: string;
  query: string;
  results: Lead[];
  emails: EmailDraft[];
  createdAt: string;
  lastUpdatedAt: string;
};

function loadHistoryEntries(): HistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<
    Array<{ id: number; role: "user" | "assistant"; content: string }>
  >([
    {
      id: 1,
      role: "assistant",
      content:
        "I can help you identify buyers, draft tailored outreach, and prepare campaigns. Tell me what you want to sell and where you want to sell it.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);
  const [historyEntries, setHistoryEntries] =
    useState<HistoryEntry[]>(loadHistoryEntries);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(historyEntries));
  }, [historyEntries]);

  useEffect(() => {
    document.title = "SalesPilot | AI Sales Outreach";
  }, []);

  const currentMeta = useMemo(
    () => pageMeta[location.pathname] ?? pageMeta["/"],
    [location.pathname],
  );

  const resetConversation = () => {
    setMessages([
      {
        id: 1,
        role: "assistant",
        content:
          "I can help you identify buyers, draft tailored outreach, and prepare campaigns. Tell me what you want to sell and where you want to sell it.",
      },
    ]);
    setDraft("");
    setSearchResults([]);
    setEmailDrafts([]);
    setActiveHistoryId(null);
    navigate("/");
  };

  const handleSubmit = async (messageOverride?: string) => {
    const value = (messageOverride ?? draft).trim();
    if (!value) return;

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "user", content: value },
    ]);
    setDraft("");
    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: value, max_results: 6 }),
      });

      const data = await response.json();
      const nextResults = (data.results ?? []).map(
        (lead: any, index: number) => ({
          id: index + 1,
          companyName: lead.companyName,
          businessType: lead.businessType,
          website: lead.website,
          email: lead.email,
          phone: lead.phone,
          location: lead.location,
          leadScore: lead.leadScore,
          reason: lead.reason,
        }),
      );

      setSearchResults(nextResults);
      const entry: HistoryEntry = {
        id: `${Date.now()}`,
        query: value,
        results: nextResults,
        emails: [],
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };
      setHistoryEntries((prev) => [entry, ...prev].slice(0, 12));
      setActiveHistoryId(entry.id);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content:
            nextResults.length > 0
              ? `I found ${nextResults.length} prospects from the web that fit your search. I’ve prepared a live shortlist with website, contact, and fit details.`
              : "I didn’t find any qualifying leads from the web for that request yet. Try a different market or location.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content:
            "The live search service is currently unavailable. Please make sure the backend is running on port 8000.",
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const generateEmail = (lead: Lead) => {
    const draftEmail: EmailDraft = {
      companyName: lead.companyName,
      subject: `Helping ${lead.companyName} grow with better product visibility`,
      body: `Hi ${lead.companyName} team,\n\nI noticed your business is expanding in the retail and distribution space, and I believe our premium biscuit line could fit your current product mix. I’d love to share a short overview and discuss a potential partnership.\n\nBest regards,\nSalesPilot AI`,
      status: "Draft",
    };

    setEmailDrafts((prev) => [draftEmail, ...prev]);
    setHistoryEntries((prev) => {
      const targetId = activeHistoryId ?? prev[0]?.id;
      if (!targetId) return prev;
      return prev.map((entry) =>
        entry.id === targetId
          ? {
              ...entry,
              emails: [
                draftEmail,
                ...entry.emails.filter(
                  (item) => item.companyName !== draftEmail.companyName,
                ),
              ],
              lastUpdatedAt: new Date().toISOString(),
            }
          : entry,
      );
    });
  };

  const sendEmail = (companyName: string) => {
    setEmailDrafts((prev) =>
      prev.map((item) =>
        item.companyName === companyName ? { ...item, status: "Sent" } : item,
      ),
    );
    setHistoryEntries((prev) => {
      const targetId = activeHistoryId ?? prev[0]?.id;
      if (!targetId) return prev;
      return prev.map((entry) =>
        entry.id === targetId
          ? {
              ...entry,
              emails: entry.emails.map((item) =>
                item.companyName === companyName
                  ? { ...item, status: "Sent" }
                  : item,
              ),
              lastUpdatedAt: new Date().toISOString(),
            }
          : entry,
      );
    });
  };

  const renderPage = () => {
    if (location.pathname === "/dashboard")
      return (
        <PlaceholderPage
          title='Dashboard'
          description='Review your workflow, activity, and key pipeline signals.'
          icon={Sparkles}
        />
      );
    if (location.pathname === "/history")
      return (
        <div className='space-y-4'>
          <section className='rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
            <p className='text-2xl font-semibold tracking-tight text-slate-900'>
              Search history
            </p>
            <p className='mt-2 text-sm text-slate-500'>
              Every live search, prospect list, and sent email is saved here for
              review.
            </p>
          </section>

          {historyEntries.length === 0 ? (
            <section className='rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm'>
              <p className='text-lg font-semibold text-slate-900'>
                No history yet
              </p>
              <p className='mt-2 text-sm text-slate-500'>
                Start a search and the results will appear here automatically.
              </p>
            </section>
          ) : (
            historyEntries.map((entry) => (
              <section
                key={entry.id}
                className='rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm'
              >
                <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
                  <div>
                    <p className='text-lg font-semibold text-slate-900'>
                      {entry.query}
                    </p>
                    <p className='mt-1 text-sm text-slate-500'>
                      Saved {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className='rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700'>
                    {entry.results.length} leads
                  </div>
                </div>

                <div className='mt-4 flex flex-wrap gap-2'>
                  {entry.results.slice(0, 4).map((lead) => (
                    <span
                      key={`${entry.id}-${lead.companyName}`}
                      className='rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600'
                    >
                      {lead.companyName}
                    </span>
                  ))}
                </div>

                <div className='mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-sm font-semibold text-slate-900'>
                    Sent emails
                  </p>
                  {entry.emails.filter((email) => email.status === "Sent")
                    .length > 0 ? (
                    <ul className='mt-3 space-y-2 text-sm text-slate-600'>
                      {entry.emails
                        .filter((email) => email.status === "Sent")
                        .map((email) => (
                          <li
                            key={`${entry.id}-${email.companyName}`}
                            className='rounded-2xl bg-white px-3 py-2'
                          >
                            <p className='font-medium text-slate-900'>
                              {email.companyName}
                            </p>
                            <p>{email.subject}</p>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className='mt-2 text-sm text-slate-500'>
                      No sent emails yet for this search.
                    </p>
                  )}
                </div>
              </section>
            ))
          )}
        </div>
      );
    if (location.pathname === "/leads")
      return (
        <PlaceholderPage
          title='Leads'
          description='Track all of your qualified opportunities in one place.'
          icon={Sparkles}
        />
      );
    if (location.pathname === "/campaigns")
      return (
        <PlaceholderPage
          title='Campaigns'
          description='Monitor enabled sequences and outreach momentum.'
          icon={Sparkles}
        />
      );
    if (location.pathname === "/analytics")
      return (
        <PlaceholderPage
          title='Analytics'
          description='See conversion trends and revenue opportunity at a glance.'
          icon={Sparkles}
        />
      );
    if (location.pathname === "/settings")
      return (
        <PlaceholderPage
          title='Settings'
          description='Tune onboarding, automation preferences, and account details.'
          icon={Sparkles}
        />
      );

    return (
      <div className='space-y-6'>
        <section className='rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div>
              <p className='text-3xl font-semibold tracking-tight text-slate-900'>
                Hello, Mr. Okoro 👋
              </p>
              <p className='mt-2 text-lg text-slate-600'>
                How may I assist you today?
              </p>
            </div>
            <div className='rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700'>
              AI prospecting • Outreach generation • Campaign automation
            </div>
          </div>

          <div className='mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {suggestionCards.map((card) => (
              <button
                key={card.title}
                onClick={() => handleSubmit(card.prompt)}
                className='rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white'
              >
                <div className='text-2xl'>{card.icon}</div>
                <p className='mt-3 text-sm font-semibold text-slate-900'>
                  {card.title}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className='rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6'>
          <div className='space-y-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-[24px] px-4 py-3 ${message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-700"}`}
                >
                  <p className='text-sm leading-6'>{message.content}</p>
                </div>
              </div>
            ))}

            {isSearching && (
              <div className='flex justify-start'>
                <div className='rounded-[24px] bg-slate-50 px-4 py-3 text-slate-700'>
                  <div className='flex items-center gap-2 text-sm'>
                    <LoaderCircle className='h-4 w-4 animate-spin text-blue-600' />
                    Searching the web...
                  </div>
                </div>
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className='mt-6 space-y-4'>
              {searchResults.map((lead) => (
                <div
                  key={lead.id}
                  className='rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm'
                >
                  <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <h4 className='text-lg font-semibold text-slate-900'>
                          {lead.companyName}
                        </h4>
                        <span className='rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700'>
                          Score {lead.leadScore}
                        </span>
                      </div>
                      <p className='mt-1 text-sm text-slate-500'>
                        {lead.businessType}
                      </p>
                    </div>
                    <button
                      onClick={() => generateEmail(lead)}
                      className='inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-600'
                    >
                      <Wand2 className='h-4 w-4' /> Generate Email
                    </button>
                  </div>

                  <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
                    <div className='rounded-2xl bg-white p-3 text-sm text-slate-600'>
                      <p className='font-medium text-slate-900'>Website</p>
                      <a
                        className='mt-1 block text-blue-600 hover:underline'
                        href={lead.website}
                        target='_blank'
                        rel='noreferrer'
                      >
                        {lead.website}
                      </a>
                    </div>
                    <div className='rounded-2xl bg-white p-3 text-sm text-slate-600'>
                      <p className='font-medium text-slate-900'>Email</p>
                      <p className='mt-1'>{lead.email}</p>
                    </div>
                    <div className='rounded-2xl bg-white p-3 text-sm text-slate-600'>
                      <p className='font-medium text-slate-900'>Phone</p>
                      <p className='mt-1'>{lead.phone ?? "Not listed"}</p>
                    </div>
                    <div className='rounded-2xl bg-white p-3 text-sm text-slate-600'>
                      <p className='font-medium text-slate-900'>Location</p>
                      <p className='mt-1'>{lead.location}</p>
                    </div>
                  </div>

                  <div className='mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700'>
                    <p className='font-semibold text-slate-900'>
                      Why this is a great fit
                    </p>
                    <p className='mt-2'>{lead.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className='mt-6 space-y-4'>
            {emailDrafts.map((draftMail) => (
              <div
                key={`${draftMail.companyName}-${draftMail.subject}`}
                className='rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm'
              >
                <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
                  <div>
                    <p className='text-sm font-semibold text-slate-900'>
                      {draftMail.companyName}
                    </p>
                    <p className='mt-2 text-sm font-semibold text-slate-900'>
                      Subject
                    </p>
                    <p className='text-sm text-slate-600'>
                      {draftMail.subject}
                    </p>
                  </div>
                  <div className='rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm'>
                    {draftMail.status}
                  </div>
                </div>
                <div className='mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600'>
                  <p className='font-semibold text-slate-900'>Email Body</p>
                  <p className='mt-2 whitespace-pre-line'>{draftMail.body}</p>
                </div>

                {draftMail.status === "Draft" && (
                  <button
                    onClick={() => sendEmail(draftMail.companyName)}
                    className='mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700'
                  >
                    <SendHorizonal className='h-4 w-4' /> Send Email
                  </button>
                )}

                {draftMail.status === "Sent" && (
                  <div className='mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600'>
                    <CheckCircle2 className='h-4 w-4' /> Sent Successfully
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className='mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-4'>
            <div className='flex flex-col gap-3 md:flex-row'>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSubmit();
                }}
                className='flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0'
                placeholder='Ask SalesPilot AI to search leads or draft an outreach sequence'
              />
              <button
                onClick={() => handleSubmit()}
                className='inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700'
              >
                <SendHorizonal className='h-4 w-4' /> Send
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#f3f7ff_100%)] text-slate-700'>
      <div className='mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row'>
        <Sidebar
          currentPath={location.pathname}
          onNewChat={resetConversation}
        />
        <main className='flex-1 p-4 sm:p-6 lg:p-8'>
          <TopBar title={currentMeta.title} subtitle={currentMeta.subtitle} />
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<AppShell />} />
        <Route path='/dashboard' element={<AppShell />} />
        <Route path='/history' element={<AppShell />} />
        <Route path='/leads' element={<AppShell />} />
        <Route path='/campaigns' element={<AppShell />} />
        <Route path='/settings' element={<AppShell />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
