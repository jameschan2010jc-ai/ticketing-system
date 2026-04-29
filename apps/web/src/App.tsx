import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  GuestPurchaseNoticeResponse,
  HealthResponse,
  HomeContentResponse,
  PurchaseContentOptionsResponse,
  PurchaseMethodOptionsResponse
} from "@packages/shared-types";
import {
  confirmPurchaseContent,
  getApiHealth,
  getGuestPurchaseNotice,
  getHomeContent,
  getPurchaseContentOptions,
  getPurchaseMethodOptions
} from "./services/api";

type PageId =
  | "p1"
  | "p2"
  | "p3"
  | "p10"
  | "p11"
  | "p12"
  | "p13"
  | "p30"
  | "p31"
  | "p32"
  | "p33"
  | "p40"
  | "p41"
  | "p42"
  | "p50"
  | "p51"
  | "p52"
  | "p53"
  | "p60"
  | "p61"
  | "p62"
  | "p63"
  | "p64";

interface OrderRecord {
  orderNo: string;
  ticketName: string;
  visitDate: string;
  timeLabel: string;
  amount: number;
  status: "paid" | "pending";
}

interface TicketRecord {
  ticketNo: string;
  ticketName: string;
  visitDate: string;
  timeLabel: string;
  status: "unused" | "used";
}

function App() {
  const [page, setPage] = useState<PageId>("p1");
  const [previousPage, setPreviousPage] = useState<PageId>("p1");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [home, setHome] = useState<HomeContentResponse | null>(null);
  const [purchaseMethods, setPurchaseMethods] =
    useState<PurchaseMethodOptionsResponse | null>(null);
  const [guestNotice, setGuestNotice] =
    useState<GuestPurchaseNoticeResponse | null>(null);
  const [purchaseOptions, setPurchaseOptions] =
    useState<PurchaseContentOptionsResponse | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState("");
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountInput, setAccountInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [verificationUploaded, setVerificationUploaded] = useState(false);
  const [verificationReason, setVerificationReason] = useState(
    "ID image is unreadable. Please upload a clearer image."
  );
  const [qrTicket, setQrTicket] = useState<TicketRecord | null>(null);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [latestOrder, setLatestOrder] = useState<OrderRecord | null>(null);
  const [latestTicket, setLatestTicket] = useState<TicketRecord | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadHealth();
    void loadHome();
  }, []);

  useEffect(() => {
    if (page === "p2" && !purchaseMethods) {
      void loadPurchaseMethods();
    }

    if (page === "p3" && !guestNotice) {
      void loadGuestNotice();
    }

    if (page === "p10" && !purchaseOptions) {
      void loadPurchaseOptions();
    }
  }, [guestNotice, page, purchaseMethods, purchaseOptions]);

  const selectedTicket = useMemo(
    () =>
      purchaseOptions?.ticketTypes.find(
        (ticketType) => ticketType.ticketTypeId === selectedTicketTypeId
      ) ?? null,
    [purchaseOptions, selectedTicketTypeId]
  );

  const selectedTimeSlot = useMemo(
    () =>
      purchaseOptions?.timeSlots.find(
        (timeSlot) => timeSlot.timeSlotId === selectedTimeSlotId
      ) ?? null,
    [purchaseOptions, selectedTimeSlotId]
  );

  const pageTitle = getPageTitle(page);

  async function runRequest<T>(request: () => Promise<T>) {
    setError(null);
    setLoading(true);

    try {
      return await request();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Request failed"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function loadHealth() {
    const result = await runRequest(getApiHealth);

    if (result) {
      setHealth(result);
    }
  }

  async function loadHome() {
    const result = await runRequest(getHomeContent);

    if (result) {
      setHome(result);
    }
  }

  async function loadPurchaseMethods() {
    const result = await runRequest(getPurchaseMethodOptions);

    if (result) {
      setPurchaseMethods(result);
    }
  }

  async function loadGuestNotice() {
    const result = await runRequest(getGuestPurchaseNotice);

    if (result) {
      setGuestNotice(result);
    }
  }

  async function loadPurchaseOptions() {
    const result = await runRequest(getPurchaseContentOptions);

    if (result) {
      setPurchaseOptions(result);
      setSelectedDate(
        result.visitDates.find((date) => date.isAvailable)?.date ?? ""
      );
      setSelectedTimeSlotId(
        result.timeSlots.find((timeSlot) => timeSlot.isAvailable)?.timeSlotId ??
          ""
      );
      setSelectedTicketTypeId(result.ticketTypes[0]?.ticketTypeId ?? "");
    }
  }

  function goTo(nextPage: PageId) {
    setPreviousPage(page);
    setError(null);
    setPage(nextPage);
  }

  function openProfile() {
    goTo(isLoggedIn ? "p61" : "p60");
  }

  async function handleConfirmPurchase() {
    if (!selectedDate || !selectedTimeSlotId || !selectedTicketTypeId) {
      setError("Select a date, time, and ticket type before continuing.");
      return;
    }

    const result = await runRequest(() =>
      confirmPurchaseContent({
        purchaseMode: isLoggedIn ? "registered" : "guest",
        quantity: 1,
        ticketTypeId: selectedTicketTypeId,
        timeSlotId: selectedTimeSlotId,
        visitDate: selectedDate
      })
    );

    if (result) {
      goTo(result.nextPage);
    }
  }

  function handleLogin() {
    if (!accountInput || !passwordInput) {
      setError("Account and password are required.");
      return;
    }

    setIsLoggedIn(true);
    goTo("p32");
  }

  function handlePasswordReset() {
    if (!accountInput || !verificationCode || !newPassword) {
      setError("Account, verification code, and new password are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setPasswordInput("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    goTo("p30");
  }

  function handleRegistrationComplete() {
    if (!accountInput || !verificationCode || !newPassword) {
      setError("Account, verification code, and password are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setIsLoggedIn(true);
    goTo("p32");
  }

  function handleChangePassword() {
    if (!verificationCode || !newPassword) {
      setError("Verification code and new password are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    goTo("p61");
  }

  function handlePaymentSuccess() {
    const orderNo = `ORD-${Date.now().toString().slice(-6)}`;
    const ticketNo = `TKT-${Date.now().toString().slice(-6)}`;
    const order: OrderRecord = {
      orderNo,
      ticketName: selectedTicket?.name ?? "Adult Ticket",
      visitDate: selectedDate || "2026-05-01",
      timeLabel: selectedTimeSlot?.label ?? "09:00 - 12:00",
      amount: selectedTicket?.price ?? 180,
      status: "paid"
    };
    const ticket: TicketRecord = {
      ticketNo,
      ticketName: order.ticketName,
      visitDate: order.visitDate,
      timeLabel: order.timeLabel,
      status: "unused"
    };

    setLatestOrder(order);
    setLatestTicket(ticket);
    setOrders((current) => [order, ...current]);
    setTickets((current) => [ticket, ...current]);
    goTo("p13");
  }

  function handleLogout() {
    setIsLoggedIn(false);
    goTo("p1");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white shadow-sm md:max-w-3xl">
        <header className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              className="min-h-10 px-2 text-sm font-semibold text-slate-600"
              onClick={() => goTo("p1")}
              type="button"
            >
              Home
            </button>
            <div className="text-center">
              <p className="text-sm font-bold">{pageTitle}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                API {health?.status ?? "checking"}
              </p>
            </div>
            <button
              className="min-h-10 px-2 text-sm font-semibold text-slate-600"
              onClick={openProfile}
              type="button"
            >
              Profile
            </button>
          </div>
        </header>

        <section className="flex-1 px-4 py-5">
          {error ? (
            <div className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <p className="mb-4 text-sm font-medium text-slate-500">Loading...</p>
          ) : null}

          {page === "p1" ? (
            <PageBlock page="p1" title={home?.park.name ?? "Smart Scenic Park"}>
              <p className="text-base leading-7 text-slate-600">
                {home?.park.intro ?? "Loading park introduction..."}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <InfoBox label="Open dates" value={home?.park.openDateRange ?? "-"} />
                <InfoBox
                  label="From"
                  value={
                    home
                      ? `${home.ticketSummary.currency} ${home.ticketSummary.startingPrice}`
                      : "-"
                  }
                />
              </dl>
              <PrimaryButton onClick={() => goTo("p2")}>
                {home?.primaryAction.label ?? "Start Purchase"}
              </PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p2" ? (
            <PageBlock page="p2" title={purchaseMethods?.title ?? "Choose purchase method"}>
              <div className="space-y-3">
                {purchaseMethods?.options.map((option) => (
                  <button
                    className="w-full border border-slate-200 px-4 py-4 text-left hover:border-slate-900"
                    key={option.id}
                    onClick={() => goTo(option.targetPage)}
                    type="button"
                  >
                    <span className="block text-base font-bold">{option.label}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </PageBlock>
          ) : null}

          {page === "p3" ? (
            <PageBlock page="p3" title={guestNotice?.title ?? "Guest purchase notice"}>
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                {guestNotice?.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <label className="mt-6 flex items-start gap-3 text-sm font-medium text-slate-700">
                <input
                  checked={acknowledged}
                  className="mt-1 h-4 w-4"
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  {guestNotice?.acknowledgementLabel ??
                    "I understand the guest purchase rules."}
                </span>
              </label>
              <PrimaryButton disabled={!acknowledged} onClick={() => goTo("p10")}>
                Continue purchase
              </PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p10" ? (
            <PageBlock page="p10" title="Select ticket content">
              <div className="space-y-4">
                <SelectField
                  label="Visit date"
                  onChange={setSelectedDate}
                  options={
                    purchaseOptions?.visitDates.map((date) => ({
                      disabled: !date.isAvailable,
                      label: `${date.date}${date.isAvailable ? "" : " (sold out)"}`,
                      value: date.date
                    })) ?? []
                  }
                  value={selectedDate}
                />
                <SelectField
                  label="Entry time"
                  onChange={setSelectedTimeSlotId}
                  options={
                    purchaseOptions?.timeSlots.map((timeSlot) => ({
                      disabled: !timeSlot.isAvailable,
                      label: timeSlot.label,
                      value: timeSlot.timeSlotId
                    })) ?? []
                  }
                  value={selectedTimeSlotId}
                />
                <div>
                  <p className="text-sm font-semibold">Ticket type</p>
                  <div className="mt-2 space-y-2">
                    {purchaseOptions?.ticketTypes.map((ticketType) => (
                      <button
                        className={`w-full border px-3 py-3 text-left ${
                          selectedTicketTypeId === ticketType.ticketTypeId
                            ? "border-slate-950"
                            : "border-slate-200"
                        }`}
                        key={ticketType.ticketTypeId}
                        onClick={() => setSelectedTicketTypeId(ticketType.ticketTypeId)}
                        type="button"
                      >
                        <span className="block font-bold">{ticketType.name}</span>
                        <span className="block text-sm text-slate-600">
                          {ticketType.currency} {ticketType.price} - Remaining{" "}
                          {ticketType.remainingQuantity}
                          {ticketType.requiresIdVerification
                            ? " - ID verification required"
                            : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-500">
                Global rule: max 1 ticket per order.
              </p>
              <PrimaryButton onClick={handleConfirmPurchase}>
                {selectedTicket?.requiresIdVerification
                  ? "Continue to verification"
                  : "Continue to order confirmation"}
              </PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p11" ? (
            <PageBlock page="p11" title="Order confirmation">
              <SummaryRows
                rows={[
                  ["Visit date", selectedDate || "-"],
                  ["Entry time", selectedTimeSlot?.label ?? "-"],
                  ["Ticket", selectedTicket?.name ?? "-"],
                  ["Quantity", "1"],
                  ["Total", `${selectedTicket?.currency ?? "TWD"} ${selectedTicket?.price ?? 0}`]
                ]}
              />
              <SecondaryButton onClick={() => goTo("p10")}>Back to edit</SecondaryButton>
              <PrimaryButton onClick={() => goTo("p12")}>Confirm and pay</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p12" ? (
            <PageBlock page="p12" title="Payment method">
              <div className="space-y-2">
                {[
                  ["credit-card", "Credit card"],
                  ["line-pay", "LINE Pay"]
                ].map(([value, label]) => (
                  <button
                    className={`w-full border px-4 py-4 text-left font-bold ${
                      paymentMethod === value ? "border-slate-950" : "border-slate-200"
                    }`}
                    key={value}
                    onClick={() => setPaymentMethod(value)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <SecondaryButton onClick={() => goTo(previousPage === "p52" ? "p52" : "p11")}>
                Back
              </SecondaryButton>
              <PrimaryButton onClick={handlePaymentSuccess}>Pay now</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p13" ? (
            <PageBlock page="p13" title="Payment success">
              <SummaryRows
                rows={[
                  ["Order no.", latestOrder?.orderNo ?? "-"],
                  ["Ticket no.", latestTicket?.ticketNo ?? "-"],
                  ["Visit", `${latestOrder?.visitDate ?? "-"} ${latestOrder?.timeLabel ?? ""}`],
                  ["Status", "Paid"]
                ]}
              />
              <div className="mt-5 border border-slate-300 p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  QR voucher
                </p>
                <p className="mt-3 break-all font-mono text-sm">
                  {latestTicket?.ticketNo ?? "TKT-DEMO"}
                </p>
              </div>
              <PrimaryButton onClick={() => setQrTicket(latestTicket)}>
                Save or view voucher
              </PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p30" ? (
            <PageBlock page="p30" title="Existing account login">
              <TextField label="Phone or email" onChange={setAccountInput} value={accountInput} />
              <TextField
                label="Password"
                onChange={setPasswordInput}
                type="password"
                value={passwordInput}
              />
              <PrimaryButton onClick={handleLogin}>Login</PrimaryButton>
              <SecondaryButton onClick={() => goTo("p31")}>Forget password</SecondaryButton>
            </PageBlock>
          ) : null}

          {page === "p31" ? (
            <PageBlock page="p31" title="Forget password">
              <TextField label="Phone or email" onChange={setAccountInput} value={accountInput} />
              <TextField label="Verification code" onChange={setVerificationCode} value={verificationCode} />
              <TextField label="New password" onChange={setNewPassword} type="password" value={newPassword} />
              <TextField label="Confirm password" onChange={setConfirmPassword} type="password" value={confirmPassword} />
              <PrimaryButton onClick={handlePasswordReset}>Complete reset</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p32" ? (
            <PageBlock page="p32" title="Authentication success">
              <p className="text-sm leading-6 text-slate-600">
                Your account is ready. Continue to select ticket content.
              </p>
              <PrimaryButton onClick={() => goTo("p10")}>Continue purchase</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p33" ? (
            <PageBlock page="p33" title="Change password">
              <TextField label="Verification code" onChange={setVerificationCode} value={verificationCode} />
              <TextField label="New password" onChange={setNewPassword} type="password" value={newPassword} />
              <TextField label="Confirm password" onChange={setConfirmPassword} type="password" value={confirmPassword} />
              <PrimaryButton onClick={handleChangePassword}>Update password</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p40" ? (
            <PageBlock page="p40" title="Registration method">
              <SecondaryButton onClick={() => goTo("p41")}>Phone registration</SecondaryButton>
              <SecondaryButton onClick={() => goTo("p42")}>Email registration</SecondaryButton>
            </PageBlock>
          ) : null}

          {page === "p41" ? (
            <RegistrationPage
              accountLabel="Phone number"
              accountValue={accountInput}
              codeValue={verificationCode}
              confirmPassword={confirmPassword}
              newPassword={newPassword}
              onAccountChange={setAccountInput}
              onCodeChange={setVerificationCode}
              onConfirmPasswordChange={setConfirmPassword}
              onSubmit={handleRegistrationComplete}
              onPasswordChange={setNewPassword}
              page="p41"
              title="Phone registration"
            />
          ) : null}

          {page === "p42" ? (
            <RegistrationPage
              accountLabel="Email"
              accountValue={accountInput}
              codeValue={verificationCode}
              confirmPassword={confirmPassword}
              newPassword={newPassword}
              onAccountChange={setAccountInput}
              onCodeChange={setVerificationCode}
              onConfirmPasswordChange={setConfirmPassword}
              onSubmit={handleRegistrationComplete}
              onPasswordChange={setNewPassword}
              page="p42"
              title="Email registration"
            />
          ) : null}

          {page === "p50" ? (
            <PageBlock page="p50" title="Verification required order">
              <SummaryRows
                rows={[
                  ["Visit date", selectedDate || "-"],
                  ["Entry time", selectedTimeSlot?.label ?? "-"],
                  ["Ticket", selectedTicket?.name ?? "-"],
                  ["Verification", "Required before payment"]
                ]}
              />
              <SecondaryButton onClick={() => goTo("p10")}>Back to edit</SecondaryButton>
              <PrimaryButton onClick={() => goTo("p51")}>Start verification</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p51" ? (
            <PageBlock page="p51" title="Ticket ID verification upload">
              <div className="border border-dashed border-slate-300 p-6 text-center">
                <p className="text-sm font-semibold">Upload ID image</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Demo upload stores only local UI state.
                </p>
                <SecondaryButton onClick={() => setVerificationUploaded(true)}>
                  Select image
                </SecondaryButton>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Upload status: {verificationUploaded ? "ready" : "not uploaded"}
              </p>
              <PrimaryButton
                disabled={!verificationUploaded}
                onClick={() => goTo("p52")}
              >
                Submit verification success
              </PrimaryButton>
              <SecondaryButton
                disabled={!verificationUploaded}
                onClick={() => {
                  setVerificationReason("Qualification check did not pass.");
                  goTo("p53");
                }}
              >
                Demo failed result
              </SecondaryButton>
            </PageBlock>
          ) : null}

          {page === "p52" ? (
            <PageBlock page="p52" title="Verification success">
              <p className="text-sm leading-6 text-slate-600">
                Qualification verification passed. Continue to payment.
              </p>
              <PrimaryButton onClick={() => goTo("p12")}>Continue payment</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p53" ? (
            <PageBlock page="p53" title="Verification failed">
              <p className="text-sm leading-6 text-slate-600">{verificationReason}</p>
              <PrimaryButton onClick={() => goTo("p51")}>Re-upload</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p60" ? (
            <PageBlock page="p60" title="Profile">
              <p className="text-sm leading-6 text-slate-600">
                You are not logged in. Login or register to keep order and ticket history in your account.
              </p>
              <SecondaryButton onClick={() => goTo("p30")}>Login</SecondaryButton>
              <SecondaryButton onClick={() => goTo("p40")}>Register</SecondaryButton>
            </PageBlock>
          ) : null}

          {page === "p61" ? (
            <PageBlock page="p61" title="Profile center">
              <SummaryRows rows={[["Account", accountInput || "demo@example.com"], ["Status", "Active"]]} />
              <SecondaryButton onClick={() => goTo("p62")}>My orders</SecondaryButton>
              <SecondaryButton onClick={() => goTo("p63")}>My tickets</SecondaryButton>
              <SecondaryButton onClick={() => goTo("p33")}>Change password</SecondaryButton>
              <PrimaryButton onClick={handleLogout}>Logout</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p62" ? (
            <PageBlock page="p62" title="My orders">
              <RecordList
                emptyText="No orders yet."
                items={orders.map((order) => ({
                  line1: order.orderNo,
                  line2: `${order.ticketName} - ${order.visitDate} ${order.timeLabel}`,
                  line3: `${order.status} - TWD ${order.amount}`
                }))}
              />
              <SecondaryButton onClick={() => goTo("p61")}>Back to profile</SecondaryButton>
            </PageBlock>
          ) : null}

          {page === "p63" ? (
            <PageBlock page="p63" title="My tickets - unused">
              <TabBar active="unused" onHistory={() => goTo("p64")} onUnused={() => goTo("p63")} />
              <RecordList
                emptyText="No unused tickets yet."
                items={tickets
                  .filter((ticket) => ticket.status === "unused")
                  .map((ticket) => ({
                    action: () => setQrTicket(ticket),
                    actionLabel: "View QR Code",
                    line1: ticket.ticketNo,
                    line2: `${ticket.ticketName} - ${ticket.visitDate}`,
                    line3: ticket.timeLabel
                  }))}
              />
            </PageBlock>
          ) : null}

          {page === "p64" ? (
            <PageBlock page="p64" title="My tickets - history">
              <TabBar active="history" onHistory={() => goTo("p64")} onUnused={() => goTo("p63")} />
              <RecordList
                emptyText="No used tickets yet."
                items={tickets
                  .filter((ticket) => ticket.status === "used")
                  .map((ticket) => ({
                    line1: ticket.ticketNo,
                    line2: `${ticket.ticketName} - ${ticket.visitDate}`,
                    line3: ticket.timeLabel
                  }))}
              />
            </PageBlock>
          ) : null}
        </section>

        {qrTicket ? (
          <div className="fixed inset-0 z-10 flex items-end bg-slate-950/30 p-4 md:items-center md:justify-center">
            <div className="w-full max-w-sm bg-white p-5 shadow-xl">
              <h2 className="text-lg font-bold">Ticket QR Code</h2>
              <p className="mt-2 text-sm text-slate-600">{qrTicket.ticketName}</p>
              <div className="mt-5 border border-slate-300 p-6 text-center font-mono text-sm">
                {qrTicket.ticketNo}
              </div>
              <PrimaryButton onClick={() => setQrTicket(null)}>Close</PrimaryButton>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function getPageTitle(page: PageId) {
  const titles: Record<PageId, string> = {
    p1: "Home",
    p2: "Purchase Method",
    p3: "Guest Notice",
    p10: "Purchase Content",
    p11: "Order Confirmation",
    p12: "Payment Method",
    p13: "Payment Success",
    p30: "Login",
    p31: "Forget Password",
    p32: "Auth Success",
    p33: "Change Password",
    p40: "Register",
    p41: "Phone Register",
    p42: "Email Register",
    p50: "Verification Order",
    p51: "ID Upload",
    p52: "Verify Success",
    p53: "Verify Failed",
    p60: "Profile Guest",
    p61: "Profile",
    p62: "Orders",
    p63: "Tickets",
    p64: "History"
  };

  return titles[page];
}

function PageBlock({
  children,
  page,
  title
}: {
  children: ReactNode;
  page: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-sky-700">{page}</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 p-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function TextField({
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
    <label className="mb-4 block text-sm font-semibold">
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

function SelectField({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ disabled?: boolean; label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <select
        className="mt-2 w-full border border-slate-300 px-3 py-3"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option disabled={option.disabled} key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PrimaryButton({
  children,
  disabled = false,
  onClick
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="mt-5 w-full bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300"
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
  disabled = false,
  onClick
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="mt-3 w-full border border-slate-300 px-4 py-3 text-sm font-bold text-slate-800 disabled:text-slate-300"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function SummaryRows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="divide-y divide-slate-200 border border-slate-200">
      {rows.map(([label, value]) => (
        <div className="flex justify-between gap-4 px-3 py-3 text-sm" key={label}>
          <dt className="text-slate-500">{label}</dt>
          <dd className="text-right font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RegistrationPage({
  accountLabel,
  accountValue,
  codeValue,
  confirmPassword,
  newPassword,
  onAccountChange,
  onCodeChange,
  onConfirmPasswordChange,
  onPasswordChange,
  onSubmit,
  page,
  title
}: {
  accountLabel: string;
  accountValue: string;
  codeValue: string;
  confirmPassword: string;
  newPassword: string;
  onAccountChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  page: string;
  title: string;
}) {
  return (
    <PageBlock page={page} title={title}>
      <TextField label={accountLabel} onChange={onAccountChange} value={accountValue} />
      <TextField label="Verification code" onChange={onCodeChange} value={codeValue} />
      <TextField label="Password" onChange={onPasswordChange} type="password" value={newPassword} />
      <TextField
        label="Confirm password"
        onChange={onConfirmPasswordChange}
        type="password"
        value={confirmPassword}
      />
      <PrimaryButton onClick={onSubmit}>Complete registration</PrimaryButton>
    </PageBlock>
  );
}

function RecordList({
  emptyText,
  items
}: {
  emptyText: string;
  items: Array<{
    action?: () => void;
    actionLabel?: string;
    line1: string;
    line2: string;
    line3: string;
  }>;
}) {
  if (items.length === 0) {
    return <p className="border border-slate-200 p-4 text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div className="border border-slate-200 p-4" key={item.line1}>
          <p className="font-bold">{item.line1}</p>
          <p className="mt-1 text-sm text-slate-600">{item.line2}</p>
          <p className="mt-1 text-sm text-slate-500">{item.line3}</p>
          {item.action ? (
            <SecondaryButton onClick={item.action}>{item.actionLabel ?? "Open"}</SecondaryButton>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function TabBar({
  active,
  onHistory,
  onUnused
}: {
  active: "history" | "unused";
  onHistory: () => void;
  onUnused: () => void;
}) {
  return (
    <div className="mb-4 grid grid-cols-2 border border-slate-300 text-sm font-bold">
      <button
        className={`px-3 py-3 ${active === "unused" ? "bg-slate-950 text-white" : ""}`}
        onClick={onUnused}
        type="button"
      >
        Unused
      </button>
      <button
        className={`px-3 py-3 ${active === "history" ? "bg-slate-950 text-white" : ""}`}
        onClick={onHistory}
        type="button"
      >
        History
      </button>
    </div>
  );
}

export default App;
