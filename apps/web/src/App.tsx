import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  GuestPurchaseNoticeResponse,
  HealthResponse,
  HomeContentResponse,
  OrderDetail,
  PaymentMethod,
  PurchaseContentOptionsResponse,
  PurchaseMethodOptionsResponse,
  TicketStatus
} from "@packages/shared-types";
import {
  confirmPurchaseContent,
  createOrder,
  getApiHealth,
  getGuestPurchaseNotice,
  getHomeContent,
  getMyOrders,
  getMyTickets,
  getPurchaseContentOptions,
  getPurchaseMethodOptions,
  loginExistingAccount,
  payOrder,
  registerUser
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
  status: TicketStatus;
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
  const [purchaseContextId, setPurchaseContextId] = useState("");
  const [activeOrder, setActiveOrder] = useState<OrderDetail | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState("");
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isTicketPickerOpen, setIsTicketPickerOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(window.localStorage.getItem("ticketingUserId"))
  );
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

    if (page === "p62" && isLoggedIn) {
      void loadMyOrderHistory();
    }

    if ((page === "p63" || page === "p64") && isLoggedIn) {
      void loadMyTickets();
    }
  }, [guestNotice, isLoggedIn, page, purchaseMethods, purchaseOptions]);

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
      setIsDatePickerOpen(false);
      setIsTimePickerOpen(false);
      setIsTicketPickerOpen(false);
    }
  }

  async function loadMyOrderHistory() {
    const result = await runRequest(() => getMyOrders());

    if (result) {
      setOrders(
        result.items.map((order) => ({
          amount: order.totalAmount,
          orderNo: order.orderNo,
          status: order.orderStatus === "paid" ? "paid" : "pending",
          ticketName: order.ticketName,
          timeLabel: order.timeLabel,
          visitDate: order.visitDate
        }))
      );
    }
  }

  async function loadMyTickets() {
    const result = await runRequest(() => getMyTickets());

    if (result) {
      setTickets(
        result.items.map((ticket) => ({
          status: ticket.status,
          ticketName: ticket.ticketName,
          ticketNo: ticket.ticketNo,
          timeLabel: ticket.timeLabel,
          visitDate: ticket.visitDate
        }))
      );
    }
  }

  async function createOrderFromSelection() {
    if (!selectedDate || !selectedTimeSlotId || !selectedTicketTypeId) {
      setError("Select a date, time, and ticket type before continuing.");
      return null;
    }

    const result = await runRequest(() =>
      createOrder({
        purchaseContextId: purchaseContextId || undefined,
        purchaseMode: isLoggedIn ? "registered" : "guest",
        quantity: 1,
        ticketTypeId: selectedTicketTypeId,
        timeSlotId: selectedTimeSlotId,
        visitDate: selectedDate
      })
    );

    if (!result) {
      return null;
    }

    setActiveOrder(result.data);
    syncOrderState(result.data);
    return result.data;
  }

  function syncOrderState(order: OrderDetail) {
    const firstItem = order.items[0];
    const orderRecord: OrderRecord = {
      amount: order.totalAmount,
      orderNo: order.orderNo,
      status: order.orderStatus === "paid" ? "paid" : "pending",
      ticketName: firstItem?.ticketName ?? "Ticket",
      timeLabel: order.timeLabel,
      visitDate: order.visitDate
    };
    const ticketRecords: TicketRecord[] = order.tickets.map((ticket) => ({
      status: ticket.status,
      ticketName: firstItem?.ticketName ?? "Ticket",
      ticketNo: ticket.ticketNo,
      timeLabel: order.timeLabel,
      visitDate: order.visitDate
    }));

    setLatestOrder(orderRecord);
    setOrders((current) => [
      orderRecord,
      ...current.filter((item) => item.orderNo !== orderRecord.orderNo)
    ]);

    if (ticketRecords[0]) {
      setLatestTicket(ticketRecords[0]);
      setTickets((current) => [
        ...ticketRecords,
        ...current.filter(
          (item) =>
            !ticketRecords.some((ticket) => ticket.ticketNo === item.ticketNo)
        )
      ]);
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
      setPurchaseContextId(result.purchaseContextId);
      setActiveOrder(null);
      goTo(result.nextPage);
    }
  }

  async function handleLogin() {
    if (!accountInput || !passwordInput) {
      setError("Account and password are required.");
      return;
    }

    const result = await runRequest(() =>
      loginExistingAccount({
        account: accountInput,
        password: passwordInput
      })
    );

    if (result) {
      window.localStorage.setItem("ticketingUserId", result.data.userId);
      setIsLoggedIn(true);
      goTo("p32");
    }
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

  async function handleRegistrationComplete() {
    if (!accountInput || !verificationCode || !newPassword) {
      setError("Account, verification code, and password are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    const result = await runRequest(() =>
      registerUser({
        account: accountInput,
        accountType: page === "p41" ? "phone" : "email",
        password: newPassword,
        verificationCode
      })
    );

    if (result) {
      window.localStorage.setItem("ticketingUserId", result.data.userId);
      setIsLoggedIn(true);
      goTo("p32");
    }
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

  async function handleConfirmAndPay() {
    const order = activeOrder ?? (await createOrderFromSelection());

    if (order) {
      goTo("p12");
    }
  }

  async function handlePaymentSuccess(method: PaymentMethod = paymentMethod as PaymentMethod) {
    const order = activeOrder ?? (await createOrderFromSelection());

    if (!order) {
      return;
    }

    const result = await runRequest(() =>
      payOrder(order.orderId, {
        method
      })
    );

    if (result) {
      setActiveOrder(result.data.order);
      syncOrderState(result.data.order);
      goTo("p13");
    }
  }

  function handleLogout() {
    window.localStorage.removeItem("ticketingUserId");
    setIsLoggedIn(false);
    goTo("p1");
  }

  function handleBack() {
    if (page === "p1") {
      return;
    }

    goTo(previousPage === page ? "p1" : previousPage);
  }

  return (
    <main className="min-h-screen bg-neutral-200 text-black">
      <div className="mx-auto grid h-dvh w-full max-w-[520px] grid-rows-[58px_1fr_68px] overflow-hidden bg-white shadow-xl">
        <AppHeader onBack={handleBack} title={home?.park.name ?? pageTitle} />

        <section className="overflow-y-auto px-8 py-6">
          {error ? <Notice tone="error">{error}</Notice> : null}
          {loading ? <Notice>載入中...</Notice> : null}

          {page === "p1" ? (
            <PageBlock>
              <HeroImage
                alt={home?.park.name ?? "Park image"}
                src={home?.park.heroImageUrl}
              />
              <p className="mx-auto mt-8 max-w-sm text-center text-[24px] font-semibold leading-snug">
                {home?.park.intro ?? "xx景區：簡介xxxxxxxxxx xxxxxxxxxxxx"}
              </p>
              <div className="mt-16 space-y-1 text-[28px] font-semibold leading-tight">
                <p>開放日期：{formatOpenDateRange(home?.park.openDateRange)}</p>
                <p>
                  票價：{home ? `${home.ticketSummary.startingPrice} 元起` : "100 元起"}
                </p>
              </div>
              <PrimaryButton onClick={() => goTo("p2")}>開始購票</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p2" ? (
            <PageBlock className="pt-16">
              {(purchaseMethods?.options ?? []).map((option) => (
                <ChoiceButton
                  description={getPurchaseMethodDescription(option.id)}
                  key={option.id}
                  onClick={() => goTo(option.targetPage)}
                  title={getPurchaseMethodLabel(option.id)}
                />
              ))}
            </PageBlock>
          ) : null}

          {page === "p3" ? (
            <PageBlock className="pt-12">
              <div className="space-y-9 text-[28px] font-semibold leading-snug">
                <p>您目前選擇[未註冊購票]方式<br />請確認以下事項後續:</p>
                <ul className="ml-10 list-disc space-y-6 text-[24px]">
                  <li>無法查詢歷史購票記錄</li>
                  <li>無法查詢入園或通行使用狀態</li>
                  <li>無法申請退票或修改訂單</li>
                </ul>
              </div>
              <hr className="my-10 border-neutral-300" />
              <p className="text-[22px] font-semibold">相關購票風險與責任需由使用者自行承擔</p>
              <label className="mt-6 flex items-center gap-3 text-[24px]">
                <input
                  checked={acknowledged}
                  className="h-8 w-8 border-2 border-black"
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  type="checkbox"
                />
                <span>我已閱讀並了解上述說明</span>
              </label>
              <PrimaryButton disabled={!acknowledged} onClick={() => goTo("p10")}>
                繼續購票
              </PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p10" ? (
            <PageBlock>
              <SectionTitle>入園日期</SectionTitle>
              <CalendarPicker
                dates={purchaseOptions?.visitDates ?? []}
                isOpen={isDatePickerOpen}
                onChange={setSelectedDate}
                onToggle={() => setIsDatePickerOpen((current) => !current)}
                selectedDate={selectedDate}
              />

              <SectionTitle>入園時間</SectionTitle>
              <SelectField
                ariaLabel="Entry time"
                isOpen={isTimePickerOpen}
                onChange={setSelectedTimeSlotId}
                onToggle={() => setIsTimePickerOpen((current) => !current)}
                options={
                  purchaseOptions?.timeSlots.map((timeSlot) => ({
                    disabled: !timeSlot.isAvailable,
                    label: timeSlot.label,
                    value: timeSlot.timeSlotId
                  })) ?? []
                }
                value={selectedTimeSlotId}
              />

              <SectionTitle>票種（單選）</SectionTitle>
              <SelectField
                ariaLabel="Ticket type"
                isOpen={isTicketPickerOpen}
                onChange={setSelectedTicketTypeId}
                onToggle={() => setIsTicketPickerOpen((current) => !current)}
                options={
                  purchaseOptions?.ticketTypes.map((ticketType) => ({
                    label: `${ticketType.name} ${ticketType.currency} ${ticketType.price}`,
                    value: ticketType.ticketTypeId
                  })) ?? []
                }
                value={selectedTicketTypeId}
              />

              <PrimaryButton onClick={handleConfirmPurchase}>確認購票</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p11" ? (
            <PageBlock>
              <SectionTitle>入園日期</SectionTitle>
              <FramedRow icon={<CalendarIcon />} value={formatDisplayDate(selectedDate)} />
              <SectionTitle>入園時間</SectionTitle>
              <FramedRow icon={<ClockIcon />} value={selectedTimeSlot?.label ?? "-"} />
              <SectionTitle>票券資訊</SectionTitle>
              <FramedRow
                icon={<TicketIcon />}
                value={`${selectedTicket?.name ?? "-"}NT$${selectedTicket?.price ?? 0}×1`}
              />
              <SectionTitle>費用明細</SectionTitle>
              <div className="rounded-lg border border-neutral-400 px-3 py-3 text-[24px] leading-snug">
                <p>票價：NT$ {selectedTicket?.price ?? 0}×1</p>
                <p>總金額：NT$ {selectedTicket?.price ?? 0}</p>
              </div>
              <div className="mt-4 text-[26px] font-semibold">注意事項</div>
              <div className="mt-2 rounded-lg bg-[#d9d9d9] px-5 py-4 text-[20px] leading-8">
                <ul className="ml-5 list-disc">
                  <li>門票僅限當日使用</li>
                  <li>請依所選時段入園</li>
                  <li>逾時可能影響入園權益</li>
                  <li>購票完成後請妥善保存入場憑證</li>
                </ul>
              </div>
              <p className="mt-4 text-right text-[26px] font-semibold">
                總金額：NT$ {selectedTicket?.price ?? 0}
              </p>
              <PrimaryButton onClick={handleConfirmAndPay}>確認並付款</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p12" ? (
            <PageBlock className="pt-8">
              <h2 className="mb-10 text-[30px] font-semibold">請選擇付款方式</h2>
              <div className="rounded-lg bg-[#d9d9d9] p-3">
                {[
                  ["credit-card", "信用卡支付"],
                  ["line-pay", "LINE PAY"]
                ].map(([value, label]) => (
                  <button
                    className={`mb-10 block min-h-36 w-full rounded-lg bg-white text-center text-[30px] font-medium last:mb-0 ${
                      value === "line-pay" ? "text-[#19b34a]" : "text-black"
                    }`}
                    key={value}
                    onClick={() => {
                      setPaymentMethod(value);
                      void handlePaymentSuccess(value as PaymentMethod);
                    }}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </PageBlock>
          ) : null}

          {page === "p13" ? (
            <PageBlock className="text-center">
              <SuccessIcon />
              <h2 className="mt-5 text-[36px] font-semibold">付款成功</h2>
              <div className="mt-8 space-y-4 text-left text-[24px] font-semibold">
                <p>訂單編號：{latestOrder?.orderNo ?? "-"}</p>
                <p>入園日期：{formatDisplayDate(latestOrder?.visitDate ?? selectedDate)}</p>
                <p>票數：1張</p>
              </div>
              <h3 className="mt-10 text-[32px] font-semibold">二維碼憑證</h3>
              <QrPreview value={latestTicket?.ticketNo ?? "TKT-DEMO"} />
              <div className="mt-4 rounded-lg border border-neutral-400 px-6 py-3 text-left text-[22px] font-semibold">
                <p>入園日期：{latestOrder?.visitDate ?? selectedDate}</p>
                <p className="border-y border-neutral-300 py-1">
                  入園時間：{latestOrder?.timeLabel ?? selectedTimeSlot?.label ?? "-"}
                </p>
                <p>狀態：<span className="text-[#24b24a]">未使用</span></p>
              </div>
              <PrimaryButton onClick={() => setQrTicket(latestTicket)}>存儲到手機</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p30" ? (
            <PageBlock>
              <TextField label="手機或電子信箱" onChange={setAccountInput} value={accountInput} />
              <TextField label="密碼" onChange={setPasswordInput} type="password" value={passwordInput} />
              <PrimaryButton onClick={handleLogin}>登入</PrimaryButton>
              <SecondaryButton onClick={() => goTo("p31")}>忘記密碼</SecondaryButton>
            </PageBlock>
          ) : null}

          {page === "p31" ? (
            <PageBlock>
              <TextField label="手機或電子信箱" onChange={setAccountInput} value={accountInput} />
              <TextField label="驗證碼" onChange={setVerificationCode} value={verificationCode} />
              <TextField label="新密碼" onChange={setNewPassword} type="password" value={newPassword} />
              <TextField label="確認密碼" onChange={setConfirmPassword} type="password" value={confirmPassword} />
              <PrimaryButton onClick={handlePasswordReset}>完成重設</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p32" ? (
            <PageBlock className="pt-20 text-center">
              <SuccessIcon />
              <h2 className="mt-8 text-[34px] font-semibold">認證成功</h2>
              <PrimaryButton onClick={() => goTo("p10")}>繼續購票</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p33" ? (
            <PageBlock>
              <TextField label="驗證碼" onChange={setVerificationCode} value={verificationCode} />
              <TextField label="新密碼" onChange={setNewPassword} type="password" value={newPassword} />
              <TextField label="確認密碼" onChange={setConfirmPassword} type="password" value={confirmPassword} />
              <PrimaryButton onClick={handleChangePassword}>更新密碼</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p40" ? (
            <PageBlock className="pt-20">
              <ChoiceButton onClick={() => goTo("p41")} title="手機註冊" />
              <ChoiceButton onClick={() => goTo("p42")} title="電子信箱註冊" />
            </PageBlock>
          ) : null}

          {page === "p41" ? (
            <RegistrationPage
              accountLabel="手機號碼"
              accountValue={accountInput}
              codeValue={verificationCode}
              confirmPassword={confirmPassword}
              newPassword={newPassword}
              onAccountChange={setAccountInput}
              onCodeChange={setVerificationCode}
              onConfirmPasswordChange={setConfirmPassword}
              onSubmit={handleRegistrationComplete}
              onPasswordChange={setNewPassword}
              title="手機註冊"
            />
          ) : null}

          {page === "p42" ? (
            <RegistrationPage
              accountLabel="電子信箱"
              accountValue={accountInput}
              codeValue={verificationCode}
              confirmPassword={confirmPassword}
              newPassword={newPassword}
              onAccountChange={setAccountInput}
              onCodeChange={setVerificationCode}
              onConfirmPasswordChange={setConfirmPassword}
              onSubmit={handleRegistrationComplete}
              onPasswordChange={setNewPassword}
              title="電子信箱註冊"
            />
          ) : null}

          {page === "p50" ? (
            <PageBlock>
              <SummaryRows
                rows={[
                  ["入園日期", selectedDate || "-"],
                  ["入園時間", selectedTimeSlot?.label ?? "-"],
                  ["票種", selectedTicket?.name ?? "-"],
                  ["驗證", "付款前需完成資格驗證"]
                ]}
              />
              <SecondaryButton onClick={() => goTo("p10")}>返回修改</SecondaryButton>
              <PrimaryButton onClick={() => goTo("p51")}>開始驗證</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p51" ? (
            <PageBlock>
              <div className="rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center">
                <p className="text-[28px] font-semibold">上傳證件照片</p>
                <SecondaryButton onClick={() => setVerificationUploaded(true)}>
                  選擇圖片
                </SecondaryButton>
              </div>
              <p className="mt-4 text-[20px]">上傳狀態：{verificationUploaded ? "已選擇" : "尚未上傳"}</p>
              <PrimaryButton disabled={!verificationUploaded} onClick={() => goTo("p52")}>
                提交驗證成功
              </PrimaryButton>
              <SecondaryButton
                disabled={!verificationUploaded}
                onClick={() => {
                  setVerificationReason("資格檢核未通過。");
                  goTo("p53");
                }}
              >
                示範失敗結果
              </SecondaryButton>
            </PageBlock>
          ) : null}

          {page === "p52" ? (
            <PageBlock className="pt-20 text-center">
              <SuccessIcon />
              <h2 className="mt-8 text-[34px] font-semibold">驗證成功</h2>
              <PrimaryButton onClick={() => goTo("p12")}>繼續付款</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p53" ? (
            <PageBlock className="pt-10">
              <div className="rounded-lg bg-[#d9d9d9] p-6 text-[24px] font-semibold">
                {verificationReason}
              </div>
              <PrimaryButton onClick={() => goTo("p51")}>重新上傳</PrimaryButton>
            </PageBlock>
          ) : null}

          {page === "p60" ? (
            <PageBlock>
              <ProfileHero loggedIn={false} subtitle="請先登入賬號可查看訂單及票券" title="尚未登入" />
              <div className="mt-6 grid grid-cols-2 gap-6">
                <PrimaryButton compact onClick={() => goTo("p30")}>登入</PrimaryButton>
                <PrimaryButton compact onClick={() => goTo("p40")}>註冊</PrimaryButton>
              </div>
              <MenuList
                title="常用功能"
                items={[
                  ["登入", () => goTo("p30")],
                  ["註冊", () => goTo("p40")]
                ]}
              />
            </PageBlock>
          ) : null}

          {page === "p61" ? (
            <PageBlock>
              <ProfileHero
                loggedIn
                subtitle={accountInput || "demo@example.com"}
                title="xxx"
              />
              <MenuList
                items={[
                  ["我的訂單", () => goTo("p62"), "查詢購買記錄"],
                  ["我的票券", () => goTo("p63"), "查詢票券記錄"],
                  ["修改密碼", () => goTo("p33")],
                  ["登出", handleLogout]
                ]}
              />
            </PageBlock>
          ) : null}

          {page === "p62" ? (
            <PageBlock>
              <RecordList
                emptyText="尚無訂單"
                items={orders.map((order) => ({
                  line1: order.orderNo,
                  line2: `${order.ticketName} - ${order.visitDate} ${order.timeLabel}`,
                  line3: `${order.status} - TWD ${order.amount}`
                }))}
              />
            </PageBlock>
          ) : null}

          {page === "p63" ? (
            <PageBlock>
              <TabBar active="unused" onHistory={() => goTo("p64")} onUnused={() => goTo("p63")} />
              <RecordList
                emptyText="尚無未使用票券"
                items={tickets
                  .filter((ticket) => ticket.status === "unused")
                  .map((ticket) => ({
                    action: () => setQrTicket(ticket),
                    actionLabel: "查看二維碼",
                    line1: ticket.ticketNo,
                    line2: `${ticket.ticketName} - ${ticket.visitDate}`,
                    line3: ticket.timeLabel
                  }))}
              />
            </PageBlock>
          ) : null}

          {page === "p64" ? (
            <PageBlock>
              <TabBar active="history" onHistory={() => goTo("p64")} onUnused={() => goTo("p63")} />
              <RecordList
                emptyText="尚無歷史票券"
                items={tickets
                  .filter((ticket) => ticket.status !== "unused")
                  .map((ticket) => ({
                    line1: ticket.ticketNo,
                    line2: `${ticket.ticketName} - ${ticket.visitDate}`,
                    line3: `${ticket.status} - ${ticket.timeLabel}`
                  }))}
              />
            </PageBlock>
          ) : null}
        </section>

        <AppFooter onHome={() => goTo("p1")} onProfile={openProfile} />

        {qrTicket ? (
          <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/30 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
              <h2 className="text-xl font-bold">票券二維碼</h2>
              <p className="mt-2 text-lg">{qrTicket.ticketName}</p>
              <div className="mt-5 rounded-lg bg-[#d9d9d9] p-6 text-center font-mono text-sm">
                {qrTicket.ticketNo}
              </div>
              <PrimaryButton onClick={() => setQrTicket(null)}>關閉</PrimaryButton>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function getPageTitle(page: PageId) {
  const titles: Record<PageId, string> = {
    p1: "xx園區",
    p2: "選擇購票方式",
    p3: "未註冊購票說明",
    p10: "選擇購票內容",
    p11: "確認訂單",
    p12: "選擇付款方式",
    p13: "付款成功",
    p30: "登入",
    p31: "忘記密碼",
    p32: "認證成功",
    p33: "修改密碼",
    p40: "註冊",
    p41: "手機註冊",
    p42: "電子信箱註冊",
    p50: "確認資格票",
    p51: "證件上傳",
    p52: "驗證成功",
    p53: "驗證失敗",
    p60: "個人中心",
    p61: "個人中心",
    p62: "我的訂單",
    p63: "我的票券",
    p64: "歷史票券"
  };

  return titles[page];
}

function AppHeader({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <header className="grid grid-cols-[56px_1fr_56px] items-center bg-[#ffd45a] text-black">
      <button
        aria-label="Go back"
        className="flex h-full items-center justify-center"
        onClick={onBack}
        type="button"
      >
        <BackIcon />
      </button>
      <h1 className="text-center text-[28px] font-semibold leading-none">{title}</h1>
      <button
        aria-label="Language"
        className="flex h-full items-center justify-center"
        type="button"
      >
        <LanguageIcon />
      </button>
    </header>
  );
}

function AppFooter({
  onHome,
  onProfile
}: {
  onHome: () => void;
  onProfile: () => void;
}) {
  return (
    <footer className="grid grid-cols-2 bg-[#ffd45a] text-black">
      <FooterButton icon={<HomeIcon />} label="首頁" onClick={onHome} />
      <FooterButton icon={<ProfileIcon />} label="個人" onClick={onProfile} />
    </footer>
  );
}

function FooterButton({
  icon,
  label,
  onClick
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex flex-col items-center justify-center gap-1 text-[18px] font-semibold"
      onClick={onClick}
      type="button"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function PageBlock({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function Notice({
  children,
  tone = "info"
}: {
  children: ReactNode;
  tone?: "error" | "info";
}) {
  return (
    <div
      className={`mb-4 rounded-lg px-3 py-2 text-sm font-semibold ${
        tone === "error"
          ? "border border-red-200 bg-red-50 text-red-700"
          : "bg-[#d9d9d9] text-black"
      }`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 mt-5 text-[28px] font-semibold">{children}</h2>;
}

function ChoiceButton({
  description,
  onClick,
  title
}: {
  description?: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      className="mb-16 w-full rounded-lg bg-[#d9d9d9] px-4 py-7 text-center text-black"
      onClick={onClick}
      type="button"
    >
      <span className="block text-[30px] font-semibold leading-tight">{title}</span>
      {description ? (
        <span className="mt-4 block text-[24px] font-semibold leading-tight">
          {description}
        </span>
      ) : null}
    </button>
  );
}

function HeroImage({ alt, src }: { alt: string; src?: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="rounded-sm bg-[#d9d9d9] px-4 py-20 text-center text-4xl font-semibold">
        園區主視覺
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className="h-60 w-full rounded-sm bg-[#d9d9d9] object-cover"
      onError={() => setHasError(true)}
      src={src}
    />
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
    <label className="mb-5 block text-[24px] font-semibold">
      {label}
      <input
        className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-3 text-[22px]"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function SelectField({
  ariaLabel,
  isOpen,
  onChange,
  onToggle,
  options,
  value
}: {
  ariaLabel: string;
  isOpen: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  options: Array<{ disabled?: boolean; label: string; value: string }>;
  value: string;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className="rounded-lg bg-[#d9d9d9]">
      <button
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-[24px] font-semibold"
        onClick={onToggle}
        type="button"
      >
        <span>{selected?.label ?? "請選擇"}</span>
        {isOpen ? <ChevronDown /> : <ChevronRight />}
      </button>
      {isOpen ? (
        <div className="space-y-2 px-3 pb-3">
          {options.map((option) => (
            <button
              className={`w-full rounded-lg px-4 py-3 text-left text-[22px] font-semibold ${
                option.value === value ? "bg-[#ffd45a]" : "bg-white"
              } ${option.disabled ? "text-neutral-400" : "text-black"}`}
              disabled={option.disabled}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                onToggle();
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PrimaryButton({
  children,
  compact = false,
  disabled = false,
  onClick
}: {
  children: ReactNode;
  compact?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`mt-9 rounded-lg bg-[#ffd45a] px-4 py-4 text-center text-[34px] font-semibold text-black disabled:bg-neutral-300 ${
        compact ? "w-full" : "mx-auto block w-[82%]"
      }`}
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
      className="mt-4 w-full rounded-lg bg-[#d9d9d9] px-4 py-4 text-[24px] font-semibold text-black disabled:text-neutral-400"
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
    <dl className="divide-y divide-neutral-300 rounded-lg border border-neutral-300 text-[22px]">
      {rows.map(([label, value]) => (
        <div className="flex justify-between gap-4 px-3 py-3" key={label}>
          <dt>{label}</dt>
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
  title: string;
}) {
  return (
    <PageBlock>
      <h2 className="mb-6 text-[30px] font-semibold">{title}</h2>
      <TextField label={accountLabel} onChange={onAccountChange} value={accountValue} />
      <TextField label="驗證碼" onChange={onCodeChange} value={codeValue} />
      <TextField label="密碼" onChange={onPasswordChange} type="password" value={newPassword} />
      <TextField
        label="確認密碼"
        onChange={onConfirmPasswordChange}
        type="password"
        value={confirmPassword}
      />
      <PrimaryButton onClick={onSubmit}>完成註冊</PrimaryButton>
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
    return <p className="rounded-lg bg-[#d9d9d9] p-5 text-[22px]">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div className="rounded-lg border border-neutral-300 p-4" key={item.line1}>
          <p className="text-[24px] font-bold">{item.line1}</p>
          <p className="mt-1 text-[20px] text-neutral-700">{item.line2}</p>
          <p className="mt-1 text-[20px] text-neutral-600">{item.line3}</p>
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
    <div className="mb-4 grid grid-cols-2 rounded-lg border border-neutral-300 text-[22px] font-bold">
      <button
        className={`px-3 py-3 ${active === "unused" ? "bg-[#ffd45a]" : ""}`}
        onClick={onUnused}
        type="button"
      >
        未使用
      </button>
      <button
        className={`px-3 py-3 ${active === "history" ? "bg-[#ffd45a]" : ""}`}
        onClick={onHistory}
        type="button"
      >
        歷史
      </button>
    </div>
  );
}

function CalendarPicker({
  dates,
  isOpen,
  onChange,
  onToggle,
  selectedDate
}: {
  dates: Array<{ date: string; isAvailable: boolean }>;
  isOpen: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  selectedDate: string;
}) {
  const firstDate = selectedDate || dates.find((date) => date.isAvailable)?.date || dates[0]?.date;
  const [visibleMonth, setVisibleMonth] = useState(() =>
    firstDate ? firstDate.slice(0, 7) : new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate.slice(0, 7));
    }
  }, [selectedDate]);

  const monthDate = new Date(`${visibleMonth}-01T00:00:00`);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const availableByDate = new Map(dates.map((date) => [date.date, date.isAvailable]));
  type CalendarCell =
    | { isBlank: true; key: string }
    | { date: string; day: number; isAvailable: boolean; isBlank: false; key: string };
  const cells: CalendarCell[] = [];

  for (let index = 0; index < startDay; index += 1) {
    cells.push({ isBlank: true, key: `blank-${index}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({
      date,
      day,
      isBlank: false,
      isAvailable: availableByDate.get(date) === true,
      key: date
    });
  }

  function moveMonth(offset: number) {
    const next = new Date(year, month + offset, 1);
    setVisibleMonth(
      `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`
    );
  }

  return (
    <div className="rounded-lg bg-[#d9d9d9] p-3">
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-2 py-2 text-left text-[24px] font-semibold"
        onClick={onToggle}
        type="button"
      >
        <span>{selectedDate || "請選擇日期"}</span>
        {isOpen ? <ChevronDown /> : <ChevronRight />}
      </button>
      {isOpen ? (
        <div className="rounded-lg bg-[#f7f7f7] p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between text-[22px] font-bold">
            <span>{monthDate.toLocaleString("en-US", { month: "long", year: "numeric" })}</span>
            <span className="flex gap-6 text-[#168bd0]">
              <button
                aria-label="Previous month"
                onClick={() => moveMonth(-1)}
                type="button"
              >
                <ChevronLeft />
              </button>
              <button
                aria-label="Next month"
                onClick={() => moveMonth(1)}
                type="button"
              >
                <ChevronRight />
              </button>
            </span>
          </div>
          <div className="grid grid-cols-7 gap-y-3 text-center text-[16px] font-bold text-neutral-400">
            {["SUN", "MON", "WED", "THU", "FRI", "SAT", "SUN"].map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-y-3 text-center text-[26px]">
            {cells.map((cell) =>
              !cell.isBlank ? (
                <button
                  className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${
                    selectedDate === cell.date ? "bg-[#dfefff] text-[#168bd0]" : ""
                  } ${cell.isAvailable ? "" : "text-neutral-300"}`}
                  disabled={!cell.isAvailable}
                  key={cell.key}
                  onClick={() => {
                    onChange(cell.date);
                    onToggle();
                  }}
                  type="button"
                >
                  {cell.day}
                </button>
              ) : (
                <span key={cell.key} />
              )
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FramedRow({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-5 rounded-lg border border-neutral-400 px-3 py-2 text-[28px] font-medium">
      {icon}
      <span>{value}</span>
    </div>
  );
}

function ProfileHero({
  loggedIn,
  subtitle,
  title
}: {
  loggedIn: boolean;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-8 rounded-lg bg-[#d9d9d9] px-4 py-10">
      <ProfileLargeIcon />
      <div className="flex-1 text-center">
        <p className="text-[26px] font-semibold">{title}</p>
        <p className="mt-4 text-[20px] font-semibold">{subtitle}</p>
      </div>
      {loggedIn ? (
        <span className="rounded-lg bg-[#44c767] px-4 py-2 text-[20px] font-semibold">
          已登入
        </span>
      ) : null}
    </div>
  );
}

function MenuList({
  items,
  title
}: {
  items: Array<[string, () => void, string?]>;
  title?: string;
}) {
  return (
    <div className="mt-10 border-y border-neutral-300">
      {title ? <h2 className="mt-4 text-[30px] font-semibold">{title}</h2> : null}
      {items.map(([label, onClick, description]) => (
        <button
          className="flex w-full items-center justify-between border-b border-neutral-300 py-5 text-left last:border-b-0"
          key={label}
          onClick={onClick}
          type="button"
        >
          <span>
            <span className="block text-[32px] font-semibold">{label}</span>
            {description ? (
              <span className="block text-[24px] text-neutral-500">{description}</span>
            ) : null}
          </span>
          <ChevronRight />
        </button>
      ))}
    </div>
  );
}

function QrPreview({ value }: { value: string }) {
  return (
    <div className="mt-4 rounded-lg bg-[#d9d9d9] p-8">
      <div className="mx-auto grid aspect-square w-[72%] grid-cols-5 grid-rows-5 gap-2 bg-white p-4">
        {Array.from({ length: 25 }, (_, index) => (
          <span
            className={index % 2 === 0 || value.charCodeAt(index % value.length) % 3 === 0 ? "bg-black" : "bg-white"}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

function formatOpenDateRange(value?: string) {
  if (!value) {
    return "2/1－4/1";
  }

  return value.replace(/2026-/g, "").replace(/-/g, "/").replace(" to ", "－");
}

function formatDisplayDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(
    date.getDate()
  ).padStart(2, "0")}（星期${weekdays[date.getDay()]}）`;
}

function getPurchaseMethodLabel(id: string) {
  if (id === "existing-account") {
    return "登錄既有帳號";
  }

  if (id === "new-account") {
    return "註冊新帳號";
  }

  return "直接購票（未註冊）";
}

function getPurchaseMethodDescription(id: string) {
  if (id === "existing-account") {
    return "可查詢訂單、票券使用狀態";
  }

  if (id === "new-account") {
    return "註冊後可使用完整購票功能";
  }

  return "快速購票，無法查詢或修改訂單";
}

function BackIcon() {
  return (
    <svg aria-hidden="true" className="h-9 w-9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" viewBox="0 0 24 24">
      <path d="M15 4 7 12l8 8" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="m4 10 8-7 8 7v10h-5v-6H9v6H4z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="9" r="3" />
      <path d="M6.5 19c1.5-3 3.3-4.5 5.5-4.5S16 16 17.5 19" />
    </svg>
  );
}

function ProfileLargeIcon() {
  return (
    <svg aria-hidden="true" className="h-32 w-32 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="27" />
      <circle cx="32" cy="24" r="9" fill="currentColor" />
      <path d="M14 53c4-12 10-18 18-18s14 6 18 18" fill="currentColor" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-9 w-9 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <path d="M8 2v5M16 2v5M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="h-10 w-10 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg aria-hidden="true" className="h-10 w-10 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
      <path d="M4 8a2 2 0 0 0 0 4 2 2 0 0 1 0 4h16a2 2 0 0 1 0-4 2 2 0 0 0 0-4z" />
      <path d="M9 8v8M13 10h4M13 14h4" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-[#0bb621]">
      <svg aria-hidden="true" className="h-24 w-24 text-white" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" viewBox="0 0 24 24">
        <path d="m5 13 4 4L19 7" />
      </svg>
    </div>
  );
}

function ChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`h-8 w-8 ${className}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" viewBox="0 0 24 24">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" viewBox="0 0 24 24">
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default App;
