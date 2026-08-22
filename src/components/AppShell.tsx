import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Menu,
  X,
  Plus,
  Search,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  MessageSquare,
  Camera,
  Sprout,
  Droplets,
  FlaskConical,
  Bug,
  CloudSun,
  FileText,
  Sparkles,
  Crown,
  Settings,
  LifeBuoy,
  Shield,
  ScrollText,
  Info,
  LogOut,
  UserRound,
  LogIn,
} from "lucide-react";
import { FarmAiLogo } from "@/components/FarmAiLogo";
import {
  createThread,
  deleteThread,
  listThreads,
  renameThread,
  togglePin,
  clearLocalThreads,
  syncThreadsWithCloud,
  type ThreadMeta,
} from "@/lib/chat-store";
import { useAuth } from "@/hooks/use-auth";

type ToolItem =
  | { label: string; icon: typeof Menu; kind: "route"; to: string }
  | { label: string; icon: typeof Menu; kind: "prompt"; prompt: string };

const TOOLS: ToolItem[] = [
  { label: "Plant Scanner", icon: Camera, kind: "route", to: "/scan" },
  {
    label: "Crop Planner",
    icon: Sprout,
    kind: "prompt",
    prompt:
      "Act as my Crop Planner. Ask me country, state, farm size, crop, budget, soil type and water source, then produce a complete plan (land prep, seeds, spacing, water schedule, fertilizer schedule, harvest schedule, estimated cost and estimated profit) as clear headings and tables.",
  },
  {
    label: "Irrigation Designer",
    icon: Droplets,
    kind: "prompt",
    prompt:
      "Act as my Drip Irrigation Designer. Ask my crop, land size, water source and soil type, then output pipe size, tank size, pump recommendation, solar option, water requirement, installation guide, material list, estimated cost and a simple ASCII 2D layout.",
  },
  {
    label: "Fertilizer Calculator",
    icon: FlaskConical,
    kind: "prompt",
    prompt:
      "Act as my Fertilizer Calculator. Ask crop, area, soil test and growth stage, then compute NPK, urea, DAP, potash, organic manure and application schedule as a table.",
  },
  { label: "Disease & Pest Detection", icon: Bug, kind: "route", to: "/scan" },
  {
    label: "Weather Intelligence",
    icon: CloudSun,
    kind: "prompt",
    prompt:
      "Give me FarmX Weather Intelligence. Ask my location and crops, then give current weather, 7-day forecast, rain/heat/wind/humidity alerts and daily farming recommendations.",
  },
  {
    label: "Farm Reports",
    icon: FileText,
    kind: "prompt",
    prompt:
      "Generate a professional Farm Report for me. Ask my crop, area, season and inputs, then output a full report with headings, tables and a recommendations section I can export as PDF.",
  },
];

const ACCOUNT: { label: string; icon: typeof Menu; to: string }[] = [
  { label: "Profile", icon: UserRound, to: "/profile" },
  { label: "Plans & Billing", icon: Crown, to: "/plans" },
  { label: "Settings", icon: Settings, to: "/settings" },
  { label: "Help & Support", icon: LifeBuoy, to: "/help" },
  { label: "Privacy Policy", icon: Shield, to: "/privacy" },
  { label: "Terms of Service", icon: ScrollText, to: "/terms" },
  { label: "About FarmX AI", icon: Info, to: "/about" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<ThreadMeta[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as { c?: string } });
  const activeThread = search?.c;

  useEffect(() => {
    if (!isAuthenticated) return;
    void syncThreadsWithCloud().then(() => setThreads(listThreads()));
  }, [isAuthenticated]);

  useEffect(() => {
    if (open) setThreads(listThreads());
  }, [open, pathname, activeThread]);

  const filtered = useMemo(() => {
    if (!query.trim()) return threads;
    const q = query.toLowerCase();
    return threads.filter((t) => t.title.toLowerCase().includes(q));
  }, [threads, query]);

  const close = () => setOpen(false);

  const newChat = () => {
    close();
    const id = createThread();
    navigate({ to: "/", search: { c: id } as never });
  };

  const openThread = (id: string) => {
    close();
    navigate({ to: "/", search: { c: id } as never });
  };

  const goTool = (t: ToolItem) => {
    close();
    if (t.kind === "route") navigate({ to: t.to });
    else {
      const id = createThread();
      navigate({ to: "/", search: { c: id, q: t.prompt } as never });
    }
  };

  const doLogout = async () => {
    if (typeof window === "undefined") return;
    if (!confirm("Log out of FarmX AI?")) return;
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    clearLocalThreads();
    close();
    navigate({ to: "/" });
    setTimeout(() => window.location.reload(), 20);
  };

  return (
    <div className="relative min-h-[100dvh] bg-background">
      <header
        className="fixed inset-x-0 top-0 z-40"
        style={{
          background: "color-mix(in oklab, var(--background) 88%, transparent)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 pt-3 pb-3">
          <button
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "var(--surface-2)" }}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2" aria-label="FarmX AI home">
            <FarmAiLogo size={26} />
            <span className="text-sm font-semibold tracking-tight">FarmX AI</span>
          </Link>
          <button
            onClick={newChat}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "var(--surface-2)" }}
            aria-label="New chat"
            title="New chat"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="pt-14">{children}</div>

      {open && (
        <div className="fixed inset-0 z-50" onClick={close}>
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-y-auto border-r border-border"
            style={{ background: "var(--background)" }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <FarmAiLogo size={32} />
                <div>
                  <p className="text-sm font-semibold leading-none">FarmX AI</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">by SYLUTION LTD</p>
                </div>
              </div>
              <button
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: "var(--surface-2)" }}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pt-1 pb-3">
              <button
                onClick={newChat}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium"
                style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}
              >
                <Plus size={16} /> New Chat
              </button>
            </div>

            {/* Chat History */}
            <div className="px-4">
              <div
                className="mb-1 flex items-center gap-2 rounded-xl px-2"
                style={{ background: "var(--surface-2)" }}
              >
                <Search size={14} className="text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search chats"
                  className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <p className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                Chat History
              </p>
              <ul className="space-y-0.5">
                {filtered.length === 0 && (
                  <li className="px-2 py-3 text-xs text-muted-foreground">No conversations yet.</li>
                )}
                {filtered.map((t) => {
                  const isActive = activeThread === t.id;
                  const isEditing = editing === t.id;
                  return (
                    <li key={t.id}>
                      <div
                        className={`group flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm ${isActive ? "bg-[color:var(--surface-2)]" : "hover:bg-[color:var(--surface-2)]"}`}
                      >
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => {
                              renameThread(t.id, editValue);
                              setEditing(null);
                              setThreads(listThreads());
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                              if (e.key === "Escape") setEditing(null);
                            }}
                            className="flex-1 bg-transparent px-1 py-1 text-sm outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => openThread(t.id)}
                            className="flex flex-1 items-center gap-2 truncate text-left"
                          >
                            {t.pinned ? (
                              <Pin size={12} className="shrink-0 text-primary" />
                            ) : (
                              <MessageSquare size={12} className="shrink-0 text-muted-foreground" />
                            )}
                            <span className="truncate">{t.title}</span>
                          </button>
                        )}
                        <div className="flex opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          <button
                            onClick={() => {
                              togglePin(t.id);
                              setThreads(listThreads());
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground"
                            title={t.pinned ? "Unpin" : "Pin"}
                          >
                            {t.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                          </button>
                          <button
                            onClick={() => {
                              setEditing(t.id);
                              setEditValue(t.title);
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground"
                            title="Rename"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${t.title}"?`)) {
                                deleteThread(t.id);
                                setThreads(listThreads());
                                if (isActive) navigate({ to: "/", search: {} as never });
                              }
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <nav className="flex-1 px-3 pt-2 pb-6">
              <p className="px-3 pt-4 pb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                AI Tools
              </p>
              <ul className="space-y-0.5">
                {TOOLS.map((it) => {
                  const Icon = it.icon;
                  return (
                    <li key={it.label}>
                      <button
                        onClick={() => goTool(it)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[color:var(--surface-2)]"
                      >
                        <Icon size={17} className="text-muted-foreground" />
                        <span>{it.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <p className="px-3 pt-4 pb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Account
              </p>
              <ul className="space-y-0.5">
                {ACCOUNT.map((it) => {
                  const Icon = it.icon;
                  return (
                    <li key={it.label}>
                      <button
                        onClick={() => {
                          close();
                          navigate({ to: it.to });
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[color:var(--surface-2)]"
                      >
                        <Icon size={17} className="text-muted-foreground" />
                        <span>{it.label}</span>
                      </button>
                    </li>
                  );
                })}
                <li>
                  {isAuthenticated ? (
                    <button
                      onClick={doLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[color:var(--surface-2)]"
                    >
                      <LogOut size={17} className="text-muted-foreground" />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        close();
                        navigate({ to: "/auth" });
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[color:var(--surface-2)]"
                    >
                      <LogIn size={17} className="text-muted-foreground" />
                      <span>Sign in / Create account</span>
                    </button>
                  )}
                </li>
              </ul>

              <p className="mt-6 px-3 text-center text-[10px] text-muted-foreground">
                {isAuthenticated ? (
                  <span className="block pb-1 truncate text-foreground">
                    Signed in as {user?.email ?? "your FarmX account"}
                  </span>
                ) : (
                  <span className="block pb-1">Not signed in · chats are stored on this device</span>
                )}
                © {new Date().getFullYear()} SYLUTION LTD · v1.0.0
              </p>
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
