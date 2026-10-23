// Shapes returned by the NestJS API (money fields arrive as numbers).

export type Role = "CUSTOMER" | "ADMIN";
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
/** COD only appears on orders placed before card payments; it is no longer offered. */
export type PaymentMethod = "COD" | "CARD";

/** A made-to-order filter as the customer specified it (inches). */
export interface CustomSpec {
  width: number;
  height: number;
  depth: number;
  mervRating: number;
  packQuantity: number;
}

export interface CustomFilterOptions {
  enabled: boolean;
  minDimension: number;
  maxDimension: number;
  step: number;
  depths: number[];
  mervRatings: number[];
  packs: { quantity: number; discount: number }[];
  leadTimeNote: string;
}

export interface CustomQuote {
  label: string;
  sizeLabel: string;
  perFilter: number;
  unitPrice: number;
  packQuantity: number;
}
export type InquiryType = "CONTACT_SALES" | "FRANCHISE" | "PRODUCT_INTEREST" | "GENERAL" | "BUSINESS_ACCOUNT";
export type InquiryStatus = "NEW" | "READ" | "ARCHIVED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  /** Set when this login belongs to a business account. */
  business: { id: string; name: string; isActive: boolean } | null;
}

export interface Address {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  statusLabel: string | null;
  imageUrl: string | null;
  imagePublicId?: string | null;
  sortOrder: number;
  productCount?: number;
}

export interface ImageRef {
  url: string;
  alt: string | null;
}

export interface ProductImage extends ImageRef {
  id: string;
  publicId: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  badge: string | null;
  filterType: string | null;
  isPurchasable: boolean;
  isFeatured: boolean;
  availabilityNote: string | null;
  createdAt: string;
  category: { slug: string; name: string; statusLabel: string | null };
  image: ImageRef | null;
  hoverImage: ImageRef | null;
  priceFrom: number | null;
  priceTo: number | null;
  pricePerFilterFrom: number | null;
  compareAtPrice: number | null;
  mervRatings: number[];
  sizeCount: number;
  sizes: string[];
  packQuantities: number[];
  inStock: boolean;
  variantCount: number;
  match: {
    variantId: string;
    size: string;
    mervRating: number | null;
    packQuantity: number;
    price: number;
    stock: number;
  } | null;
}

export interface ProductList {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  facets: { sizes: string[]; mervRatings: number[]; depths: number[]; types: string[] };
  appliedSize: string | null;
}

export interface Variant {
  id: string;
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
}

export interface Spec {
  label: string;
  value: string;
}

export interface ProductDetail {
  id: string;
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
  category: Category;
  images: ProductImage[];
  variants: Variant[];
  options: {
    sizes: { size: string; depth: number | null; actualSize: string | null }[];
    mervRatings: number[];
    packQuantities: number[];
  };
  related: ProductSummary[];
}

export interface CategoryWithProducts extends Category {
  products: ProductSummary[];
}

export interface FilterSize {
  size: string;
  width: number;
  height: number;
  depth: number;
  pricePerFilterFrom: number;
}

export interface CartLine {
  id: string;
  /** Null for custom-size lines. */
  variantId: string | null;
  isCustom: boolean;
  custom: CustomSpec | null;
  quantity: number;
  available: boolean;
  issue: string | null;
  maxQuantity: number;
  unitPrice: number;
  compareAtPrice?: number | null;
  lineTotal: number;
  variant: {
    sku: string;
    size: string;
    actualSize: string | null;
    mervRating: number | null;
    packQuantity: number;
    label: string;
  } | null;
  product: { id: string; name: string; slug: string | null; image: ImageRef | null } | null;
}

export interface Cart {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  freeShippingRemaining: number | null;
  shippingFeeStandard: number;
  freeShippingThreshold: number | null;
  taxRate: number;
  currency: string;
}

export interface OrderItem {
  id: string;
  variantId: string | null;
  productId: string | null;
  productName: string;
  productSlug: string | null;
  variantLabel: string;
  sku: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  isCustom: boolean;
  customSpec: CustomSpec | null;
}

export interface OrderHistoryEntry {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
  changedBy: { firstName: string; lastName: string; role: Role } | null;
}

export interface Order {
  id: string;
  number: number;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** Unpaid card orders hold stock until this time. */
  paymentExpiresAt: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  currency: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  email: string;
  phone: string;
  shipFullName: string;
  shipPhone: string;
  shipLine1: string;
  shipLine2: string | null;
  shipCity: string;
  shipState: string;
  shipPostalCode: string;
  shipCountry: string;
  customerNote: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  placedAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  paidAt: string | null;
  items: OrderItem[];
  history: OrderHistoryEntry[];
}

export interface OrderSummary
  extends Omit<Order, "items" | "history"> {
  itemCount: number;
  lineCount: number;
  previewImages: string[];
  firstItemName: string | null;
}

export interface StoreSettings {
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
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

// ─── Business accounts ──────────────────────────────────────────────────────

/** One filter on a business's saved list, priced and checked against stock. */
export type BusinessFilterLine = CartLine & {
  label: string | null;
  sortOrder: number;
};

export interface MyBusiness {
  business: { id: string; name: string; phone: string | null; address: string | null };
  filters: BusinessFilterLine[];
}

export interface ReorderResult {
  added: number;
  skipped: { filterId: string; reason: string }[];
  cart: Cart;
}
