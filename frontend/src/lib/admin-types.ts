import type {
  Address,
  Category,
  InquiryStatus,
  InquiryType,
  Order,
  OrderStatus,
  PaymentStatus,
  ProductImage,
  ProductStatus,
  Role,
  Spec,
} from "./types";

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface AdminStats {
  totals: {
    grossSales: number;
    collected: number;
    orders: number;
    pending: number;
    toFulfil: number;
    customers: number;
    activeProducts: number;
    lowStock: number;
    newInquiries: number;
  };
  statusCounts: Partial<Record<OrderStatus, number>>;
  series: { date: string; orders: number; revenue: number }[];
  recentOrders: (Omit<Order, "items" | "history"> & { user: { firstName: string; lastName: string } | null })[];
  lowStock: { id: string; sku: string; label: string; stock: number; lowStockThreshold: number; product: { id: string; name: string } }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  isPurchasable: boolean;
  isFeatured: boolean;
  badge: string | null;
  filterType: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category: { id: string; slug: string; name: string };
  image: ProductImage | null;
  variantCount: number;
  activeVariantCount: number;
  totalStock: number;
  lowStockCount: number;
  priceFrom: number | null;
  priceTo: number | null;
}

export interface AdminVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  width: number | null;
  height: number | null;
  depth: number | null;
  actualSize: string | null;
  mervRating: number | null;
  packQuantity: number;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  _count?: { orderItems: number };
}

export interface AdminProduct {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  features: string[];
  specs: Spec[] | null;
  filterType: string | null;
  status: ProductStatus;
  isPurchasable: boolean;
  isFeatured: boolean;
  badge: string | null;
  availabilityNote: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
  category: Category;
  images: ProductImage[];
  variants: AdminVariant[];
  orderCount: number;
}

export interface InventoryRow extends AdminVariant {
  label: string;
  isLow: boolean;
  product: { id: string; name: string; slug: string; status: ProductStatus; category: { name: string; slug: string } };
}

export interface StockMovement {
  id: string;
  delta: number;
  stockAfter: number;
  reason: "ORDER" | "CANCEL" | "ADJUSTMENT" | "RESTOCK";
  note: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string } | null;
}

export type AdminOrderRow = Omit<Order, "items" | "history"> & {
  user: { id: string; firstName: string; lastName: string; email: string } | null;
  _count: { items: number };
};

export type AdminOrder = Order & {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    createdAt: string;
    _count: { orders: number };
  } | null;
  allowedTransitions: OrderStatus[];
};

export interface CustomerRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface CustomerDetail extends CustomerRow {
  addresses: Address[];
  orders: (Omit<Order, "items" | "history"> & { _count: { items: number } })[];
}

export interface Inquiry {
  id: string;
  type: InquiryType;
  status: InquiryStatus;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  productType: string | null;
  productId: string | null;
  productName: string | null;
  message: string;
  /** Business-account requests only. */
  address: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface AdminSettings {
  id: number;
  storeName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  address: string | null;
  currency: string;
  shippingFee: number;
  freeShippingThreshold: number | null;
  taxRate: number;
  checkoutEnabled: boolean;
  announcement: string | null;
  customFilter: CustomFilterRules;
  updatedAt: string;
}

/** Admin-editable rules for custom-size filter ordering. */
export interface CustomFilterRules {
  enabled: boolean;
  minDimension: number;
  maxDimension: number;
  step: number;
  depths: number[];
  mervRatings: number[];
  /** Dollars per square inch per filter: rates[depth][merv]. */
  rates: Record<string, Record<string, number>>;
  minUnitPrice: number;
  packs: { quantity: number; discount: number }[];
  leadTimeNote: string;
}

export type { PaymentStatus };

// ─── Business accounts ──────────────────────────────────────────────────────

import type { BusinessFilterLine } from "./types";

export interface BusinessRow {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { users: number; filters: number };
}

export interface BusinessDetail {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  inquiryId: string | null;
  createdAt: string;
  users: { id: string; email: string; firstName: string; lastName: string; isActive: boolean; createdAt: string }[];
  filters: BusinessFilterLine[];
}

/** Returned when a login is created or linked. The temporary password is shown once. */
export interface BusinessLoginResult {
  business: BusinessDetail;
  login: { email: string; created: boolean; tempPassword: string | null };
}
