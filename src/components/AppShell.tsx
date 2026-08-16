import { useState, type ReactNode } from "react";
import {
  Bell,
  Heart,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  "My Products",
  "Saved Products",
  "Following Shops",
  "Messages",
  "Subscription",
  "Settings",
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isHome = location.pathname === "/";

  return (
    <div className="st-app-shell">
      <header className="st-header">
        <div className="st-header-inner">
          <button
            className="st-icon-button st-mobile-menu"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="st-brand">
            <span className="st-brand-mark">S</span>
            <span>
              STITCH<span>LINK</span>
            </span>
          </Link>
          <nav className="st-desktop-nav">
            <Link to="/" className={isHome ? "active" : ""}>
              Discover
            </Link>
            <a href="#categories">Categories</a>
            <a href="#shops">Shops</a>
          </nav>
          <div className="st-header-actions">
            <button
              className="st-icon-button"
              aria-label="Search"
              onClick={() =>
                document.querySelector<HTMLInputElement>(".st-search-large input")?.focus()
              }
            >
              <Search size={18} />
            </button>
            <button className="st-icon-button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button
              className="st-profile-button"
              onClick={() => navigate({ to: isAuthenticated ? "/profile" : "/auth" })}
            >
              {user?.email ? (
                <span>{user.email.slice(0, 1).toUpperCase()}</span>
              ) : (
                <UserRound size={17} />
              )}
            </button>
          </div>
        </div>
      </header>
      <div className="st-main-wrap">{children}</div>
      <nav className="st-bottom-nav">
        <Link to="/" className={isHome ? "active" : ""}>
          <ShoppingBag size={19} />
          <span>Home</span>
        </Link>
        <button
          onClick={() =>
            document.querySelector<HTMLInputElement>(".st-search-large input")?.focus()
          }
        >
          <Search size={19} />
          <span>Search</span>
        </button>
        <button
          className="st-sell-button"
          onClick={() => navigate({ to: isAuthenticated ? "/profile" : "/auth" })}
        >
          <Plus size={20} />
          <span>Sell</span>
        </button>
        <Link to="/profile">
          <MessageCircle size={19} />
          <span>Messages</span>
        </Link>
        <Link to={isAuthenticated ? "/profile" : "/auth"}>
          <UserRound size={19} />
          <span>Profile</span>
        </Link>
      </nav>
      {open && (
        <div className="st-drawer-overlay" onClick={() => setOpen(false)}>
          <aside className="st-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="st-drawer-head">
              <Link to="/" className="st-brand" onClick={() => setOpen(false)}>
                <span className="st-brand-mark">S</span>
                <span>
                  STITCH<span>LINK</span>
                </span>
              </Link>
              <button className="st-icon-button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="st-drawer-identity">
              <div className="st-drawer-avatar">
                {user?.email?.slice(0, 1).toUpperCase() ?? "G"}
              </div>
              <div>
                <strong>{user?.email ?? "Welcome to StitchLink"}</strong>
                <p>{isAuthenticated ? "Your marketplace account" : "Browse as a guest"}</p>
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
            <button
              className="st-drawer-sell"
              onClick={() => {
                setOpen(false);
                navigate({ to: isAuthenticated ? "/profile" : "/auth" });
              }}
            >
              <Plus size={17} /> Sell a product
            </button>
            <div className="st-drawer-list">
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setOpen(false);
                    navigate({
                      to:
                        item === "Settings"
                          ? "/settings"
                          : item === "Messages"
                            ? "/profile"
                            : "/profile",
                    });
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="st-drawer-footer">
              Your fashion marketplace
              <br />
              From SYLUTION
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
