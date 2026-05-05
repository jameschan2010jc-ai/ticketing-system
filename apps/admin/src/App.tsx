import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AdminParkConfig,
  AdminTicketType,
  CreateParkConfigRequest,
  CreateTicketTypeRequest,
  OrderListItem,
  UserListItem
} from "@packages/shared-types";
import {
  createAdminPark,
  createAdminTicketType,
  deleteAdminPark,
  deleteAdminTicketType,
  getAdminOrders,
  getAdminParkConfig,
  getAdminParks,
  getAdminTicketCatalog,
  getAdminUsers,
  updateAdminParkConfig,
  updateAdminParkStatus,
  updateAdminTicketTypeStatus,
  updateAdminTicketType
} from "./services/api";

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
  const [parks, setParks] = useState<
    Array<{ parkId: string; name: string; status: "active" | "inactive" }>
  >([]);
  const [parkConfig, setParkConfig] = useState<AdminParkConfig | null>(null);
  const [tickets, setTickets] = useState<AdminTicketType[]>([]);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const viewTitle = useMemo(
    () => views.find((item) => item.id === view)?.label ?? "Overview",
    [view]
  );

  useEffect(() => {
    if (isAuthed) {
      void loadAdminData(selectedParkId);
    }
  }, [isAuthed, selectedParkId]);

  async function loadAdminData(parkId: string) {
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const [parkList, park, ticketList, orderList, userList] =
        await Promise.all([
          getAdminParks(parkId),
          getAdminParkConfig(parkId),
          getAdminTicketCatalog(parkId),
          getAdminOrders(parkId),
          getAdminUsers(parkId)
        ]);

      setParks(parkList.items);
      setParkConfig(park.data);
      setTickets(ticketList.items);
      setOrders(orderList.items);
      setUsers(userList.items);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Request failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveParkConfig() {
    if (!parkConfig) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await updateAdminParkConfig(selectedParkId, {
        bookingWindowDays: parkConfig.bookingWindowDays,
        currency: parkConfig.currency,
        enableCreditCard: parkConfig.enableCreditCard,
        enableLinePay: parkConfig.enableLinePay,
        heroImageUrl: parkConfig.heroImageUrl,
        intro: parkConfig.intro,
        maxTicketsPerOrder: 1,
        name: parkConfig.name,
        openDateEnd: parkConfig.openDateEnd,
        openDateStart: parkConfig.openDateStart,
        status: parkConfig.status,
        timezone: parkConfig.timezone
      });

      setParkConfig(result.data);
      setParks((current) =>
        current.map((park) =>
          park.parkId === result.data.parkId
            ? { ...park, name: result.data.name, status: result.data.status }
            : park
        )
      );
      setNotice("Park saved");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Save failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function addPark() {
    const suffix = Date.now().toString().slice(-6);
    const newParkId = `park-${suffix}`;
    const request: CreateParkConfigRequest = {
      bookingWindowDays: parkConfig?.bookingWindowDays ?? 14,
      currency: parkConfig?.currency ?? "TWD",
      enableCreditCard: parkConfig?.enableCreditCard ?? true,
      enableLinePay: parkConfig?.enableLinePay ?? true,
      heroImageUrl: `/images/${newParkId}.jpg`,
      intro: "Configure this park before opening sales.",
      maxTicketsPerOrder: 1,
      name: `New Park ${suffix}`,
      openDateEnd: parkConfig?.openDateEnd ?? "2026-12-31",
      openDateStart: parkConfig?.openDateStart ?? "2026-05-01",
      parkId: newParkId,
      status: "inactive",
      timezone: parkConfig?.timezone ?? "Asia/Taipei"
    };

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await createAdminPark(selectedParkId, request);

      setParks((current) => [
        ...current,
        {
          name: result.data.name,
          parkId: result.data.parkId,
          status: result.data.status
        }
      ]);
      setParkConfig(result.data);
      setSelectedParkId(result.data.parkId);
      setNotice("Park added");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Add park failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function setCurrentParkStatus(status: AdminParkConfig["status"]) {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await updateAdminParkStatus(selectedParkId, selectedParkId, {
        status
      });

      setParkConfig(result.data);
      setParks((current) =>
        current.map((park) =>
          park.parkId === result.data.parkId
            ? { ...park, name: result.data.name, status: result.data.status }
            : park
        )
      );
      setNotice(status === "active" ? "Park activated" : "Park deactivated");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Park status update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeCurrentPark() {
    if (parks.length <= 1) {
      setError("Cannot delete the last park.");
      return;
    }

    if (!window.confirm(`Delete park ${selectedParkId}?`)) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      await deleteAdminPark(selectedParkId, selectedParkId);

      const nextParkId =
        parks.find((park) => park.parkId !== selectedParkId)?.parkId ??
        "demo-park";
      setParks((current) =>
        current.filter((park) => park.parkId !== selectedParkId)
      );
      setSelectedParkId(nextParkId);
      setNotice("Park deleted");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Delete park failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveTicket(ticket: AdminTicketType) {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await updateAdminTicketType(
        selectedParkId,
        ticket.ticketTypeId,
        {
          currency: ticket.currency,
          dailyCapQuantity: ticket.dailyCapQuantity,
          description: ticket.description,
          isActive: ticket.isActive,
          name: ticket.name,
          periodCapQuantity: ticket.periodCapQuantity,
          price: ticket.price,
          remainingQuantity: ticket.remainingQuantity,
          requiresIdVerification: ticket.requiresIdVerification,
          saleEndDate: ticket.saleEndDate,
          saleStartDate: ticket.saleStartDate,
          visitEndDate: ticket.visitEndDate,
          visitStartDate: ticket.visitStartDate
        }
      );

      setTickets((current) =>
        current.map((item) =>
          item.ticketTypeId === result.data.ticketTypeId ? result.data : item
        )
      );
      setNotice("Ticket saved");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Save failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function addTicket() {
    const suffix = Date.now().toString().slice(-6);
    const request: CreateTicketTypeRequest = {
      currency: parkConfig?.currency ?? "TWD",
      dailyCapQuantity: 100,
      description: "New ticket type.",
      isActive: false,
      name: `New Ticket ${suffix}`,
      periodCapQuantity: 1000,
      price: 0,
      remainingQuantity: 100,
      requiresIdVerification: false,
      saleEndDate: parkConfig?.openDateEnd ?? "2026-12-31",
      saleStartDate: "2026-05-01",
      ticketTypeId: `${selectedParkId}-ticket-${suffix}`,
      visitEndDate: parkConfig?.openDateEnd ?? "2026-12-31",
      visitStartDate: parkConfig?.openDateStart ?? "2026-05-01"
    };

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await createAdminTicketType(selectedParkId, request);

      setTickets((current) => [result.data, ...current]);
      setNotice("Ticket type added");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Add ticket type failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function setTicketStatus(ticketTypeId: string, isActive: boolean) {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await updateAdminTicketTypeStatus(
        selectedParkId,
        ticketTypeId,
        isActive
      );

      setTickets((current) =>
        current.map((ticket) =>
          ticket.ticketTypeId === result.data.ticketTypeId ? result.data : ticket
        )
      );
      setNotice(isActive ? "Ticket type activated" : "Ticket type deactivated");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ticket status update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeTicket(ticketTypeId: string) {
    if (!window.confirm(`Delete ticket type ${ticketTypeId}?`)) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      await deleteAdminTicketType(selectedParkId, ticketTypeId);

      setTickets((current) =>
        current.filter((ticket) => ticket.ticketTypeId !== ticketTypeId)
      );
      setNotice("Ticket type deleted");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Delete ticket type failed"
      );
    } finally {
      setSaving(false);
    }
  }

  function patchTicket(ticketTypeId: string, patch: Partial<AdminTicketType>) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.ticketTypeId === ticketTypeId ? { ...ticket, ...patch } : ticket
      )
    );
  }

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950">
        <section className="mx-auto max-w-sm bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Admin Console
          </p>
          <h1 className="mt-2 text-2xl font-bold">Sign in</h1>
          <Field label="Login name">
            <input
              className="w-full border border-slate-300 px-3 py-3"
              onChange={(event) => setLoginName(event.target.value)}
              value={loginName}
            />
          </Field>
          <Field label="Password">
            <input
              className="w-full border border-slate-300 px-3 py-3"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </Field>
          <button
            className="mt-6 w-full bg-slate-950 px-4 py-3 text-sm font-bold text-white"
            onClick={() => setIsAuthed(true)}
            type="button"
          >
            Login
          </button>
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
              {(parks.length ? parks : [{ parkId: "demo-park", name: "demo-park", status: "active" as const }]).map(
                (park) => (
                  <option key={park.parkId} value={park.parkId}>
                    {park.name} ({park.status})
                  </option>
                )
              )}
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
            <div className="flex gap-2">
              <button
                className="border border-slate-300 px-4 py-2 text-sm font-bold"
                onClick={() => void loadAdminData(selectedParkId)}
                type="button"
              >
                Refresh
              </button>
              <button
                className="border border-slate-300 px-4 py-2 text-sm font-bold"
                onClick={() => setIsAuthed(false)}
                type="button"
              >
                Logout
              </button>
            </div>
          </header>

          {error ? (
            <div className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {notice ? (
            <div className="mt-4 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {notice}
            </div>
          ) : null}
          {loading ? (
            <p className="mt-4 text-sm font-medium text-slate-500">Loading...</p>
          ) : null}

          <div className="mt-6">
            {view === "overview" ? (
              <OverviewPanel orders={orders} tickets={tickets} users={users} />
            ) : null}
            {view === "park" && parkConfig ? (
              <ParkPanel
                config={parkConfig}
                disabled={saving}
                onAdd={addPark}
                onChange={setParkConfig}
                onDelete={removeCurrentPark}
                onSave={saveParkConfig}
                onSetStatus={setCurrentParkStatus}
              />
            ) : null}
            {view === "tickets" ? (
              <TicketPanel
                disabled={saving}
                onAdd={addTicket}
                onDelete={removeTicket}
                onPatch={patchTicket}
                onSave={saveTicket}
                onSetStatus={setTicketStatus}
                tickets={tickets}
              />
            ) : null}
            {view === "orders" ? <OrdersPanel orders={orders} /> : null}
            {view === "users" ? (
              <UsersPanel currency={parkConfig?.currency ?? "TWD"} users={users} />
            ) : null}
            {view === "analytics" ? <AnalyticsPanel orders={orders} /> : null}
            {view === "audit" ? <AuditPanel /> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function OverviewPanel({
  orders,
  tickets,
  users
}: {
  orders: OrderListItem[];
  tickets: AdminTicketType[];
  users: UserListItem[];
}) {
  const paidOrders = orders.filter((order) => order.orderStatus === "paid");
  const gmv = paidOrders.reduce((total, order) => total + order.totalAmount, 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Metric label="GMV" value={`TWD ${gmv}`} />
      <Metric label="Paid orders" value={String(paidOrders.length)} />
      <Metric label="Active tickets" value={String(tickets.filter((ticket) => ticket.isActive).length)} />
      <Metric label="Users" value={String(users.length)} />
    </div>
  );
}

function ParkPanel({
  config,
  disabled,
  onAdd,
  onChange,
  onDelete,
  onSave,
  onSetStatus
}: {
  config: AdminParkConfig;
  disabled: boolean;
  onAdd: () => void;
  onChange: (config: AdminParkConfig) => void;
  onDelete: () => void;
  onSave: () => void;
  onSetStatus: (status: AdminParkConfig["status"]) => void;
}) {
  return (
    <section className="bg-white p-4 shadow-sm">
      <div className="mb-5 flex flex-wrap gap-2">
        <PrimaryButton disabled={disabled} onClick={onAdd}>
          Add park
        </PrimaryButton>
        <SecondaryButton
          disabled={disabled || config.status === "active"}
          onClick={() => onSetStatus("active")}
        >
          Activate
        </SecondaryButton>
        <SecondaryButton
          disabled={disabled || config.status === "inactive"}
          onClick={() => onSetStatus("inactive")}
        >
          Deactivate
        </SecondaryButton>
        <DangerButton disabled={disabled} onClick={onDelete}>
          Delete park
        </DangerButton>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="Park name"
          onChange={(name) => onChange({ ...config, name })}
          value={config.name}
        />
        <TextInput
          label="Timezone"
          onChange={(timezone) => onChange({ ...config, timezone })}
          value={config.timezone}
        />
        <TextInput
          label="Currency"
          onChange={(currency) => onChange({ ...config, currency })}
          value={config.currency}
        />
        <NumberInput
          label="Booking window"
          onChange={(bookingWindowDays) =>
            onChange({ ...config, bookingWindowDays })
          }
          value={config.bookingWindowDays}
        />
        <TextInput
          label="Open date start"
          onChange={(openDateStart) => onChange({ ...config, openDateStart })}
          type="date"
          value={config.openDateStart}
        />
        <TextInput
          label="Open date end"
          onChange={(openDateEnd) => onChange({ ...config, openDateEnd })}
          type="date"
          value={config.openDateEnd}
        />
        <label className="block text-sm font-semibold md:col-span-2">
          Intro
          <textarea
            className="mt-2 min-h-24 w-full border border-slate-300 px-3 py-3"
            onChange={(event) =>
              onChange({ ...config, intro: event.target.value })
            }
            value={config.intro}
          />
        </label>
        <TextInput
          label="Hero image URL"
          onChange={(heroImageUrl) => onChange({ ...config, heroImageUrl })}
          value={config.heroImageUrl}
        />
        <label className="block text-sm font-semibold">
          Status
          <select
            className="mt-2 w-full border border-slate-300 px-3 py-3"
            onChange={(event) =>
              onChange({
                ...config,
                status: event.target.value as AdminParkConfig["status"]
              })
            }
            value={config.status}
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            checked={config.enableCreditCard}
            onChange={(event) =>
              onChange({ ...config, enableCreditCard: event.target.checked })
            }
            type="checkbox"
          />
          Credit card
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            checked={config.enableLinePay}
            onChange={(event) =>
              onChange({ ...config, enableLinePay: event.target.checked })
            }
            type="checkbox"
          />
          LINE Pay
        </label>
      </div>
      <PrimaryButton disabled={disabled} onClick={onSave}>
        Save park
      </PrimaryButton>
    </section>
  );
}

function TicketPanel({
  disabled,
  onAdd,
  onDelete,
  onPatch,
  onSave,
  onSetStatus,
  tickets
}: {
  disabled: boolean;
  onAdd: () => void;
  onDelete: (ticketTypeId: string) => void;
  onPatch: (ticketTypeId: string, patch: Partial<AdminTicketType>) => void;
  onSave: (ticket: AdminTicketType) => void;
  onSetStatus: (ticketTypeId: string, isActive: boolean) => void;
  tickets: AdminTicketType[];
}) {
  return (
    <div className="space-y-4">
      <section className="bg-white p-4 shadow-sm">
        <PrimaryButton disabled={disabled} onClick={onAdd}>
          Add ticket type
        </PrimaryButton>
      </section>
      {tickets.map((ticket) => (
        <section className="bg-white p-4 shadow-sm" key={ticket.ticketTypeId}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {ticket.ticketTypeId}
              </p>
              <h2 className="text-lg font-bold">{ticket.name}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <SecondaryButton
                disabled={disabled || ticket.isActive}
                onClick={() => onSetStatus(ticket.ticketTypeId, true)}
              >
                Activate
              </SecondaryButton>
              <SecondaryButton
                disabled={disabled || !ticket.isActive}
                onClick={() => onSetStatus(ticket.ticketTypeId, false)}
              >
                Deactivate
              </SecondaryButton>
              <DangerButton
                disabled={disabled}
                onClick={() => onDelete(ticket.ticketTypeId)}
              >
                Delete
              </DangerButton>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <TextInput
              label="Name"
              onChange={(name) => onPatch(ticket.ticketTypeId, { name })}
              value={ticket.name}
            />
            <NumberInput
              label="Price"
              onChange={(price) => onPatch(ticket.ticketTypeId, { price })}
              value={ticket.price}
            />
            <NumberInput
              label="Remaining"
              onChange={(remainingQuantity) =>
                onPatch(ticket.ticketTypeId, { remainingQuantity })
              }
              value={ticket.remainingQuantity}
            />
            <NumberInput
              label="Daily cap"
              onChange={(dailyCapQuantity) =>
                onPatch(ticket.ticketTypeId, { dailyCapQuantity })
              }
              value={ticket.dailyCapQuantity}
            />
            <TextInput
              label="Sale start"
              onChange={(saleStartDate) =>
                onPatch(ticket.ticketTypeId, { saleStartDate })
              }
              type="date"
              value={ticket.saleStartDate}
            />
            <TextInput
              label="Sale end"
              onChange={(saleEndDate) =>
                onPatch(ticket.ticketTypeId, { saleEndDate })
              }
              type="date"
              value={ticket.saleEndDate}
            />
            <TextInput
              label="Visit start"
              onChange={(visitStartDate) =>
                onPatch(ticket.ticketTypeId, { visitStartDate })
              }
              type="date"
              value={ticket.visitStartDate}
            />
            <TextInput
              label="Visit end"
              onChange={(visitEndDate) =>
                onPatch(ticket.ticketTypeId, { visitEndDate })
              }
              type="date"
              value={ticket.visitEndDate}
            />
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                checked={ticket.isActive}
                onChange={(event) =>
                  onPatch(ticket.ticketTypeId, { isActive: event.target.checked })
                }
                type="checkbox"
              />
              Active
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                checked={ticket.requiresIdVerification}
                onChange={(event) =>
                  onPatch(ticket.ticketTypeId, {
                    requiresIdVerification: event.target.checked
                  })
                }
                type="checkbox"
              />
              Verification
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold">
            Description
            <textarea
              className="mt-2 min-h-20 w-full border border-slate-300 px-3 py-3"
              onChange={(event) =>
                onPatch(ticket.ticketTypeId, {
                  description: event.target.value
                })
              }
              value={ticket.description}
            />
          </label>
          <PrimaryButton disabled={disabled} onClick={() => onSave(ticket)}>
            Save ticket
          </PrimaryButton>
        </section>
      ))}
    </div>
  );
}

function OrdersPanel({ orders }: { orders: OrderListItem[] }) {
  return (
    <TableSection
      columns={[
        "Order number",
        "User name",
        "Payment status",
        "Ticket type",
        "Ticket price",
        "Purchase date",
        "Admission date",
        "Admission time",
        "Verification data",
        "QR code"
      ]}
      emptyText="No orders"
      rows={orders.map((order) => [
        order.orderNo,
        order.userName ?? "Guest",
        order.paymentStatus ?? order.orderStatus,
        order.ticketName,
        `${order.currency} ${order.ticketPrice}`,
        formatDateTime(order.purchaseDate),
        order.admissionDate,
        order.admissionTime,
        order.verificationStatus ?? "-",
        order.qrCode ?? "-"
      ])}
      title="Order operations"
    />
  );
}

function UsersPanel({
  currency,
  users
}: {
  currency: string;
  users: UserListItem[];
}) {
  return (
    <TableSection
      columns={[
        "User name",
        "Registration type",
        "Registration date",
        "Last password change",
        "Orders",
        "Total spent",
        "Total tickets",
        "Unused tickets"
      ]}
      emptyText="No users"
      rows={users.map((user) => [
        user.displayName || user.account,
        user.accountType,
        formatDateTime(user.createdAt),
        user.lastPasswordChangedAt ? formatDateTime(user.lastPasswordChangedAt) : "-",
        String(user.orderCount),
        `${currency} ${user.totalAmountSpent}`,
        String(user.totalTicketCount),
        String(user.unusedTicketCount)
      ])}
      title="User operations"
    />
  );
}

function AnalyticsPanel({ orders }: { orders: OrderListItem[] }) {
  const paidOrders = orders.filter((order) => order.orderStatus === "paid");

  return (
    <DataSection
      rows={[
        ["Paid orders", String(paidOrders.length)],
        [
          "GMV",
          `TWD ${paidOrders.reduce((total, order) => total + order.totalAmount, 0)}`
        ],
        ["Pending orders", String(orders.filter((order) => order.orderStatus === "pending_payment").length)]
      ]}
      title="Analytics"
    />
  );
}

function AuditPanel() {
  return (
    <DataSection
      rows={[
        ["Config", "Park and ticket updates are persisted"],
        ["Orders", "Order records are read from the database"],
        ["Users", "Registered users are read from the database"]
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

function DataSection({
  emptyText,
  rows,
  title
}: {
  emptyText?: string;
  rows: Array<[string, string]>;
  title: string;
}) {
  return (
    <div className="bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 border border-slate-200 p-4 text-sm text-slate-500">
          {emptyText ?? "No records"}
        </p>
      ) : (
        <div className="mt-4 divide-y divide-slate-200 border border-slate-200">
          {rows.map(([label, value]) => (
            <div
              className="grid gap-2 px-3 py-3 text-sm md:grid-cols-[220px_1fr]"
              key={`${label}-${value}`}
            >
              <p className="font-semibold text-slate-700">{label}</p>
              <p className="text-slate-600">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TableSection({
  columns,
  emptyText,
  rows,
  title
}: {
  columns: string[];
  emptyText: string;
  rows: string[][];
  title: string;
}) {
  return (
    <div className="bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 border border-slate-200 p-4 text-sm text-slate-500">
          {emptyText}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[1200px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {columns.map((column) => (
                  <th
                    className="whitespace-nowrap px-3 py-3 font-bold text-slate-600"
                    key={column}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  className="border-b border-slate-100 last:border-b-0"
                  key={`${row[0]}-${rowIndex}`}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      className="max-w-[220px] px-3 py-3 align-top text-slate-700"
                      key={`${row[0]}-${columns[cellIndex]}`}
                    >
                      <span className="break-words">{cell}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="mt-4 block text-sm font-semibold">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function TextInput({
  label,
  onChange,
  type = "text",
  value
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        className="mt-2 w-full border border-slate-300 px-3 py-3"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function NumberInput({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        className="mt-2 w-full border border-slate-300 px-3 py-3"
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="mt-5 bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  disabled,
  onClick
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="mt-5 border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 disabled:text-slate-300"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function DangerButton({
  children,
  disabled,
  onClick
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 disabled:text-red-300"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export default App;
