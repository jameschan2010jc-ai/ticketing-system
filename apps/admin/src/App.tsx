import { useMemo, useState } from "react";

type AdminView =
  | "overview"
  | "park"
  | "tickets"
  | "orders"
  | "users"
  | "analytics"
  | "audit";

const views: Array<{ id: AdminView; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "park", label: "Park Config" },
  { id: "tickets", label: "Ticket Catalog" },
  { id: "orders", label: "Orders" },
  { id: "users", label: "Users" },
  { id: "analytics", label: "Analytics" },
  { id: "audit", label: "Audit" }
];

function App() {
  const [view, setView] = useState<AdminView>("overview");
  const [selectedParkId, setSelectedParkId] = useState("demo-park");
  const [isAuthed, setIsAuthed] = useState(false);
  const [loginName, setLoginName] = useState("admin");
  const [password, setPassword] = useState("");

  const viewTitle = useMemo(
    () => views.find((item) => item.id === view)?.label ?? "Overview",
    [view]
  );

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950">
        <section className="mx-auto max-w-sm bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Admin Console
          </p>
          <h1 className="mt-2 text-2xl font-bold">Sign in</h1>
          <label className="mt-6 block text-sm font-semibold">
            Login name
            <input
              className="mt-2 w-full border border-slate-300 px-3 py-3"
              onChange={(event) => setLoginName(event.target.value)}
              value={loginName}
            />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Password
            <input
              className="mt-2 w-full border border-slate-300 px-3 py-3"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          <button
            className="mt-6 w-full bg-slate-950 px-4 py-3 text-sm font-bold text-white"
            onClick={() => setIsAuthed(true)}
            type="button"
          >
            Login
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Demo login stores state locally until admin auth APIs are wired.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Ticketing Admin
          </p>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Park
            <select
              className="mt-2 w-full border border-slate-300 px-3 py-2 text-sm"
              onChange={(event) => setSelectedParkId(event.target.value)}
              value={selectedParkId}
            >
              <option value="demo-park">demo-park</option>
              <option value="north-park">north-park</option>
            </select>
          </label>
          <nav className="mt-6 space-y-1">
            {views.map((item) => (
              <button
                className={`w-full px-3 py-3 text-left text-sm font-semibold ${
                  view === item.id ? "bg-slate-950 text-white" : "text-slate-700"
                }`}
                key={item.id}
                onClick={() => setView(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="p-4 md:p-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                X-Park-Id: {selectedParkId}
              </p>
              <h1 className="mt-1 text-2xl font-bold">{viewTitle}</h1>
            </div>
            <button
              className="border border-slate-300 px-4 py-2 text-sm font-bold"
              onClick={() => setIsAuthed(false)}
              type="button"
            >
              Logout
            </button>
          </header>

          <div className="mt-6">
            {view === "overview" ? <OverviewPanel /> : null}
            {view === "park" ? <ParkPanel /> : null}
            {view === "tickets" ? <TicketPanel /> : null}
            {view === "orders" ? <OperationsPanel kind="orders" /> : null}
            {view === "users" ? <OperationsPanel kind="users" /> : null}
            {view === "analytics" ? <AnalyticsPanel /> : null}
            {view === "audit" ? <AuditPanel /> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function OverviewPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Metric label="GMV" value="TWD 28,600" />
      <Metric label="Paid orders" value="143" />
      <Metric label="Tickets issued" value="143" />
      <Metric label="Verification pass rate" value="92%" />
    </div>
  );
}

function ParkPanel() {
  return (
    <AdminSection
      rows={[
        ["Park name", "Smart Scenic Park"],
        ["Booking window", "14 days"],
        ["Payment methods", "Credit card, LINE Pay"],
        ["Timezone", "Asia/Taipei"]
      ]}
      title="Park configuration"
    />
  );
}

function TicketPanel() {
  return (
    <AdminSection
      rows={[
        ["Adult Ticket", "TWD 180 - active - no verification"],
        ["Discount Ticket", "TWD 120 - active - verification required"],
        ["Daily cap", "300 tickets"],
        ["Period cap", "5,000 tickets"]
      ]}
      title="Ticket catalog and sales limits"
    />
  );
}

function OperationsPanel({ kind }: { kind: "orders" | "users" }) {
  return (
    <AdminSection
      rows={
        kind === "orders"
          ? [
              ["ORD-100231", "Paid - Adult Ticket - 2026-05-01"],
              ["ORD-100232", "Pending - Discount Ticket - verification passed"],
              ["ORD-100233", "Paid - Discount Ticket - 2026-05-02"]
            ]
          : [
              ["user@example.com", "Active - 3 orders"],
              ["0912345678", "Active - 1 order"],
              ["locked@example.com", "Locked - security review"]
            ]
      }
      title={kind === "orders" ? "Order operations" : "User operations"}
    />
  );
}

function AnalyticsPanel() {
  return (
    <AdminSection
      rows={[
        ["Daily sales trend", "Available in analytics API phase"],
        ["Ticket breakdown", "Adult 72%, Discount 28%"],
        ["Payment share", "Credit card 65%, LINE Pay 35%"],
        ["Verification funnel", "Selection 100%, upload 88%, pass 81%, paid 76%"]
      ]}
      title="Analytics"
    />
  );
}

function AuditPanel() {
  return (
    <AdminSection
      rows={[
        ["2026-04-29 10:00", "admin updated ticket sales limit"],
        ["2026-04-29 10:15", "admin enabled LINE Pay"],
        ["2026-04-29 10:30", "admin locked user locked@example.com"]
      ]}
      title="Audit logs"
    />
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function AdminSection({
  rows,
  title
}: {
  rows: Array<[string, string]>;
  title: string;
}) {
  return (
    <div className="bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200 border border-slate-200">
        {rows.map(([label, value]) => (
          <div className="grid gap-2 px-3 py-3 text-sm md:grid-cols-[220px_1fr]" key={label}>
            <p className="font-semibold text-slate-700">{label}</p>
            <p className="text-slate-600">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
