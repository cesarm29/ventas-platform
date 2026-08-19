export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { fullName: string; email: string; password: string; }
export interface AuthResponse { token: string; email: string; fullName: string; role: string; expiresIn: number; }
export interface ApiResponse<T> { success: boolean; message: string; data: T; timestamp: string; pageInfo?: PageInfo; }
export interface PageInfo { page: number; size: number; totalElements: number; totalPages: number; }

export interface Product {
  id: number | null; name: string; description: string;
  category: string; price: number; stock: number; active: boolean;
}

export interface Order {
  id: number | null; clientName: string; clientEmail: string;
  items: OrderItem[]; status: string; total: number; createdAt: string;
}

export interface OrderItem {
  productId: number; productName: string;
  quantity: number; unitPrice: number; subtotal: number;
}

export interface CreateOrderRequest {
  clientName: string; clientEmail: string;
  items: { productId: number; quantity: number }[];
}

export interface AuthState {
  token: string | null; email: string | null; fullName: string | null;
  role: string | null; isAuthenticated: boolean; loading: boolean; error: string | null;
}

export interface ProductState {
  products: Product[]; loading: boolean; error: string | null; pageInfo: PageInfo | null;
}

export interface OrderState {
  orders: Order[]; loading: boolean; error: string | null; pageInfo: PageInfo | null;
}
