import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Cart, CartItem } from '../../models/cart.model';
import { Product } from '../../models/product.model';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();
  
  private readonly CART_KEY = 'cart_data';

  constructor(
    private authService: AuthService,
    private productService: ProductService
  ) {
    this.loadCartFromStorage();
  }

  getCart(): Observable<Cart | null> {
    return this.cart$;
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const user = this.authService.getCurrentUser();

    if (!user) {
      throw new Error('User must be logged in to add items to cart');
    }

    let cart: Cart;
    
    if (!currentCart) {
      cart = {
        id: Date.now().toString(),
        userId: user.id || user._id || '',
        items: [],
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      cart = { ...currentCart };
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId === (product.id || product._id));

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        id: Date.now().toString(),
        productId: product.id || product._id || '',
        product,
        quantity,
        price: product.price
      });
    }

    cart.total = this.calculateTotal(cart.items);
    cart.updatedAt = new Date();

    this.cartSubject.next(cart);
    this.saveCartToStorage(cart);
  }

  removeFromCart(itemId: string): void {
    const currentCart = this.cartSubject.value;
    if (!currentCart) return;

    const cart: Cart = {
      ...currentCart,
      items: currentCart.items.filter(item => item.id !== itemId),
      updatedAt: new Date()
    };

    cart.total = this.calculateTotal(cart.items);
    this.cartSubject.next(cart);
    this.saveCartToStorage(cart);
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const currentCart = this.cartSubject.value;
    if (!currentCart) return;

    const cart: Cart = {
      ...currentCart,
      items: currentCart.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ),
      updatedAt: new Date()
    };

    cart.total = this.calculateTotal(cart.items);
    this.cartSubject.next(cart);
    this.saveCartToStorage(cart);
  }

  clearCart(): void {
    this.cartSubject.next(null);
    localStorage.removeItem(this.CART_KEY);
  }

  getCartItemCount(): number {
    const cart = this.cartSubject.value;
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  private saveCartToStorage(cart: Cart): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  }

  private loadCartFromStorage(): void {
    const cartData = localStorage.getItem(this.CART_KEY);
    if (cartData) {
      try {
        const cart = JSON.parse(cartData);
        this.cartSubject.next(cart);
      } catch (error) {
        this.clearCart();
      }
    }
  }
}

