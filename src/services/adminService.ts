import { apiRequest } from "./api";

export type AdminOrderStatus =
  "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface AdminOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustomizedScoop: boolean;
  numberOfScoops: number | null;
  age: number | null;
  colourTheme: string | null;
  preferredCharacter: string | null;
  preferredItems: string[];
  excludedItems: string[];
  additionalMessage: string | null;
}

export interface AdminOrder {
  id: string;
  orderNumber: string | null;
  createdAt: string;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  orderStatus: AdminOrderStatus;
  paymentStatus: string;
  razorpayPaymentId: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    fullName: string;
    phoneNumber: string;
    email: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  items: AdminOrderItem[];
}

export interface AdminDashboard {
  metrics: {
    totalOrders: number;
    pendingPayment: number;
    paidOrders: number;
    processing: number;
    shipped: number;
    delivered: number;
    revenue: number;
  };
  recentOrders: AdminOrder[];
}

export function adminLogin(email: string, password: string) {
  return apiRequest<{ email: string }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function adminLogout() {
  return apiRequest<void>("/admin/logout", {
    method: "POST",
  });
}

export function getAdminSession() {
  return apiRequest<{ authenticated: boolean }>("/admin/session");
}

export function getAdminDashboard() {
  return apiRequest<AdminDashboard>("/admin/dashboard");
}

export function getAdminOrders() {
  return apiRequest<AdminOrder[]>("/admin/orders");
}

export function getAdminOrder(orderId: string) {
  return apiRequest<AdminOrder>(`/admin/orders/${encodeURIComponent(orderId)}`);
}

export function updateAdminOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
) {
  return apiRequest<AdminOrder>(
    `/admin/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    },
  );
}

export interface CreateProductInput {
  name: string;
  category: "scoops" | "jewellery" | "kawaii";
  price: number;
  description: string;
  stock: number;
  image?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  images: {
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }[];
}

export function createAdminProduct(
  input: CreateProductInput,
  imageFiles?: File[],
) {
  if (imageFiles && imageFiles.length > 0) {
    const formData = new FormData();

    formData.append("name", input.name);
    formData.append("category", input.category);
    formData.append("price", String(input.price));
    formData.append("description", input.description);
    formData.append("stock", String(input.stock));

    imageFiles.forEach((imageFile) => {
      formData.append("image", imageFile);
    });

    return apiRequest<AdminProduct>("/admin/products", {
      method: "POST",
      body: formData,
    });
  }

  return apiRequest<AdminProduct>("/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadAdminProductImages(
  imageFiles: File[],
): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const imageFile of imageFiles) {
    const formData = new FormData();
    formData.append("image", imageFile);

    const result = await apiRequest<{
      url: string;
      publicId: string;
      width: number;
      height: number;
      format: string;
    }>("/admin/products/upload-image", {
      method: "POST",
      body: formData,
    });

    uploadedUrls.push(result.url);
  }

  return uploadedUrls;
}

export async function getAdminProduct(productId: string) {
  return apiRequest<AdminProduct>(
    `/admin/products/${encodeURIComponent(productId)}`,
  )
}

export async function updateAdminProduct(
  productId: string,
  input: {
    name?: string;
    category?: "scoops" | "jewellery" | "kawaii";
    price?: number;
    description?: string;
    stock?: number;
    images?: string[];
    active?: boolean;
  },
) {
  return apiRequest<AdminProduct>(
    `/admin/products/${encodeURIComponent(productId)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteAdminProduct(productId: string) {
  return apiRequest<AdminProduct>(
    `/admin/products/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    },
  );
}

export async function deleteAdminProductImage(
  productId: string,
  imageId: string,
) {
  return apiRequest<{ imageId: string }>(
    `/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
    {
      method: "DELETE",
    },
  );
}

/* =========================
   SCOOP MANAGEMENT
========================= */

export interface AdminScoopSetting {
  id: string;
  firstScoopPrice: number;
  additionalScoopPrice: number;
  maxScoops: number;
  maxPreferredItems: number;
  maxExcludedItems: number;
  active: boolean;
  imageUrl: string | null;
}

export interface AdminScoopShippingRule {
  id: string;
  scoopCount: number;
  shipping: number;
  active: boolean;
}

export interface AdminScoopOption {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
}

export interface AdminScoopConfig {
  setting: AdminScoopSetting;
  shippingRules: AdminScoopShippingRule[];
  colours: AdminScoopOption[];
  characters: AdminScoopOption[];
  items: AdminScoopOption[];
}

export function getAdminScoopConfig() {
  return apiRequest<AdminScoopConfig>("/admin/scoop/config");
}

export function updateAdminScoopSetting(input: {
  firstScoopPrice: number;
  additionalScoopPrice: number;
  maxScoops: number;
  maxPreferredItems: number;
  maxExcludedItems: number;
  imageUrl?: string;
}) {
  return apiRequest("/admin/scoop/config", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function uploadAdminScoopImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  return apiRequest<{ imageUrl: string }>("/admin/scoop/image", {
    method: "POST",
    body: formData,
  });
}

export function updateAdminScoopOption(
  type: "colour" | "character" | "item",
  id: string,
  input: {
    name?: string;
    active?: boolean;
    sortOrder?: number;
  },
) {
  return apiRequest(`/admin/scoop/options/${type}/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
export function createAdminScoopOption(input: {
  type: "colour" | "character" | "item";
  name: string;
  sortOrder?: number;
}) {
  return apiRequest<AdminScoopOption>("/admin/scoop/options", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteAdminScoopOption(
  type: "colour" | "character" | "item",
  id: string,
) {
  return apiRequest(`/admin/scoop/options/${type}/${id}`, {
    method: "DELETE",
  });
}
