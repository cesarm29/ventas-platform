import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Product, Order, AuthResponse, LoginRequest, RegisterRequest, CreateOrderRequest } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  login(req: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/auth/login`, req);
  }

  register(req: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/auth/register`, req);
  }

  getProducts(page = 0, size = 20, search?: string, category?: string): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get<ApiResponse<Product[]>>(`${this.base}/products`, { params });
  }

  createProduct(p: Product): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.base}/products`, p);
  }

  updateProduct(id: number, p: Product): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.base}/products/${id}`, p);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/products/${id}`);
  }

  getOrders(page = 0, size = 20, status?: string): Observable<ApiResponse<Order[]>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<Order[]>>(`${this.base}/orders`, { params });
  }

  createOrder(req: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.base}/orders`, req);
  }

  updateOrderStatus(id: number, status: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.base}/orders/${id}/status?status=${status}`, {});
  }

  getStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.base}/products/stats`);
  }

  getOrderStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.base}/orders/stats`);
  }
}
