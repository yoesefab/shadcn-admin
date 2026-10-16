export type UserRole = 'ADMINISTRATOR' | 'MANAGER' | 'STOCK_EMPLOYEE'
export type InventoryMovementType =
  | 'INITIAL_STOCK'
  | 'PURCHASE'
  | 'SALE'
  | 'CUSTOMER_RETURN'
  | 'SUPPLIER_RETURN'
  | 'DAMAGE'
  | 'CORRECTION'
export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
export type AlertType =
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'APPROACHING_STOCKOUT'
  | 'SLOW_MOVING'
  | 'DEAD_STOCK'
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL'
export type RecommendationStatus =
  | 'PROPOSED'
  | 'ACKNOWLEDGED'
  | 'DISMISSED'
  | 'ORDERED'

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface FieldViolation {
  field: string
  message: string
}
export interface ApiErrorPayload {
  timestamp?: string
  status: number
  code: string
  message: string
  path?: string
  violations?: FieldViolation[]
}

export interface UserProfile {
  id: number
  fullName: string
  email: string
  role: UserRole
}
export interface UserResponse extends UserProfile {
  active: boolean
}
export interface UserRequest {
  fullName: string
  email: string
  password?: string
  role: UserRole
  active: boolean
}
export interface Reference {
  id: number
  name: string
}
export interface Category extends Reference {
  parent: Reference | null
}
export interface Supplier extends Reference {
  contactName: string | null
  email: string | null
  phone: string | null
  address: string | null
  defaultLeadTimeDays: number
  active: boolean
}

export interface ProductSummary {
  id: number
  sku: string
  isbn: string | null
  title: string
  imageUrl: string | null
  language: string
  sellingPrice: number
  category: string | null
  publisher: string | null
  active: boolean
}
export interface ProductDetail extends Omit<
  ProductSummary,
  'category' | 'publisher'
> {
  description: string | null
  purchaseCost: number | null
  minimumStockThreshold: number
  supplierLeadTimeDays: number | null
  category: Reference | null
  publisher: Reference | null
  supplier: Reference | null
  authors: Reference[]
  createdAt: string
  updatedAt: string
}
export interface ProductRequest {
  sku: string
  isbn?: string
  title: string
  description?: string
  language: string
  sellingPrice: number
  purchaseCost?: number | null
  minimumStockThreshold: number
  supplierLeadTimeDays?: number | null
  categoryId?: number | null
  publisherId?: number | null
  supplierId?: number | null
  authorIds: number[]
}

export interface StockItem {
  productId: number
  sku: string
  title: string
  imageUrl: string | null
  currentStock: number
  minimumThreshold: number
  active: boolean
}
export interface InventoryMovement {
  id: number
  productId: number
  sku: string
  productTitle: string
  imageUrl: string | null
  type: InventoryMovementType
  quantity: number
  resultingStock: number
  reason: string
  orderId: number | null
  createdBy: string
  occurredAt: string
}

export interface OrderItem {
  id: number
  productId: number
  sku: string
  title: string
  imageUrl: string | null
  quantity: number
  unitPrice: number
  discount: number
  lineTotal: number
}
export interface SalesOrder {
  id: number
  externalReference: string | null
  orderDate: string
  status: OrderStatus
  customerCity: string | null
  totalAmount: number
  source: 'MANUAL' | 'CSV_IMPORT'
  items: OrderItem[]
  createdAt: string
}
export interface OrderCreateRequest {
  externalReference?: string
  orderDate: string
  status: OrderStatus
  customerCity?: string
  items: Array<{
    productId: number
    quantity: number
    unitPrice: number
    discount: number
  }>
}

export interface ImportRowError {
  rowNumber: number
  field: string
  code: string
  message: string
  rejectedValue: string
}
export interface ImportPreview {
  id: number
  fileName: string
  checksum: string
  status:
    | 'VALIDATING'
    | 'READY'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'PARTIAL'
    | 'DUPLICATE'
  totalRows: number
  successfulRows: number
  failedRows: number
  errors: ImportRowError[]
  startedAt: string
  completedAt: string | null
}

export interface StockAlert {
  id: number
  productId: number
  sku: string
  productTitle: string
  imageUrl: string | null
  type: AlertType
  severity: AlertSeverity
  explanation: string
  status: AlertStatus
  createdAt: string
  acknowledgedAt: string | null
  resolvedAt: string | null
}

export interface Forecast {
  id: number
  productId: number
  sku: string
  title: string
  imageUrl: string | null
  periodStart: string
  periodEnd: string
  method: string
  predictedDemand: number
  accuracyMetric: string
  accuracyValue: number
  generatedAt: string
  parameters: string
  explanation: string
}
export interface Recommendation {
  id: number
  productId: number
  sku: string
  title: string
  imageUrl: string | null
  currentStock: number
  predictedDemand: number
  leadTimeDays: number
  safetyStock: number
  reorderPoint: number
  recommendedQuantity: number
  explanation: string
  generatedAt: string
  status: RecommendationStatus
}

export interface DashboardMetric {
  label: string
  value: number
}
export interface DashboardTrend {
  date: string
  revenue: number
  orders: number
  units: number
}
export interface ProductMetric {
  productId: number
  sku: string
  title: string
  imageUrl: string | null
  units: number
  revenue: number
  currentStock: number
}
export interface Dashboard {
  totalRevenue: number
  numberOfOrders: number
  unitsSold: number
  averageOrderValue: number
  currentStockQuantity: number
  inventoryValue: number
  lowStockProducts: number
  outOfStockProducts: number
  stockTurnover: number
  estimatedDaysRemaining: number
  bestsellingProducts: ProductMetric[]
  slowMovingProducts: ProductMetric[]
  salesByCategory: DashboardMetric[]
  salesByLanguage: DashboardMetric[]
  revenueTrend: DashboardTrend[]
}

export interface Setting {
  key: string
  value: string
  description: string | null
  updatedAt: string
}
export interface AuditLog {
  id: number
  userId: number | null
  userEmail: string
  action: string
  entityType: string
  entityId: string
  occurredAt: string
  metadata: string | null
}
