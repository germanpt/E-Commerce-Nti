import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Order, OrderStatus, OrderItem, Address } from '../../models/order.model';
import { Cart } from '../../models/cart.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orders: Order[] = [];

  constructor(private authService: AuthService) {}

  createOrder(cart: Cart, shippingAddress: Address): Observable<Order> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User must be logged in to create an order');
    }

    const orderItems: OrderItem[] = cart.items.map((item) => ({
      id: Date.now().toString() + Math.random(),
      productId: item.productId,
      product: item.product,
      quantity: item.quantity,
      price: item.price,
    }));

    const order: Order = {
      id: Date.now().toString(),
      userId: user.id || user._id || '',
      user: {
        id: user.id || user._id || '',
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      items: orderItems,
      total: cart.total,
      status: 'pending',
      shippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.push(order);
    return of(order);
  }

  getOrders(): Observable<Order[]> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return of([]);
    }

    if (user.role === 'admin') {
      return of([...this.orders]);
    }

    return of(this.orders.filter((order) => order.userId === user.id));
  }

  getOrderById(id: string): Observable<Order | undefined> {
    const order = this.orders.find((o) => o.id === id);
    const user = this.authService.getCurrentUser();

    if (!order || !user) {
      return of(undefined);
    }

    if (user.role === 'admin' || order.userId === user.id) {
      return of(order);
    }

    return of(undefined);
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    order.updatedAt = new Date();
    return of(order);
  }

  getOrdersByStatus(status: OrderStatus): Observable<Order[]> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return of([]);
    }

    let filtered = this.orders.filter((order) => order.status === status);

    if (user.role !== 'admin') {
      filtered = filtered.filter((order) => order.userId === user.id);
    }

    return of(filtered);
  }
}
