import type {
  CreateOrderPaymentRequest,
  CreateOrderPaymentResponse,
  PaymentMethodListResponse,
  PaymentSuccessSummaryResponse
} from "@packages/shared-types";
import { markOrderPaid } from "../repositories/order.repository";
import { getOrder, OrderServiceError } from "./orders.service";

const enabledPaymentMethods: PaymentMethodListResponse = {
  methods: [
    {
      isEnabled: true,
      label: "Credit card",
      method: "credit-card"
    },
    {
      isEnabled: true,
      label: "LINE Pay",
      method: "line-pay"
    }
  ]
};

export function getPaymentMethods(): PaymentMethodListResponse {
  return enabledPaymentMethods;
}

export async function createSuccessfulPayment(
  orderId: string,
  request: CreateOrderPaymentRequest
): Promise<CreateOrderPaymentResponse> {
  if (
    !enabledPaymentMethods.methods.some(
      (method) => method.method === request.method && method.isEnabled
    )
  ) {
    throw new OrderServiceError(
      "PAYMENT_METHOD_NOT_AVAILABLE",
      "Selected payment method is not available.",
      400
    );
  }

  const result = await markOrderPaid(orderId, request.method);

  return {
    data: {
      nextPage: "p13",
      nextRoute: "/payment-success",
      order: result.order,
      orderId,
      paymentId: result.paymentId,
      status: "success"
    },
    success: true
  };
}

export async function getPaymentSuccessSummary(
  orderId: string
): Promise<PaymentSuccessSummaryResponse> {
  const order = await getOrder(orderId);

  return {
    data: order
  };
}
