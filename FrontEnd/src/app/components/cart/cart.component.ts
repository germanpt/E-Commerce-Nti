import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Cart, CartItem } from '../../models/cart.model';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Address } from '../../models/order.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart = signal<Cart | null>(null);
  showCheckout = signal(false);
  shippingAddress: Address = {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  };
  loading = signal(false);

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart.set(cart);
    });
  }

  updateQuantity(itemId: string, quantity: number): void {
    this.cartService.updateQuantity(itemId, quantity);
  }

  removeItem(itemId: string): void {
    if (confirm('Are you sure you want to remove this item?')) {
      this.cartService.removeFromCart(itemId);
    }
  }

  proceedToCheckout(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.showCheckout.set(true);
  }

  placeOrder(): void {
    const currentCart = this.cart();
    if (!currentCart || currentCart.items.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!this.shippingAddress.street || !this.shippingAddress.city || 
        !this.shippingAddress.state || !this.shippingAddress.zipCode || 
        !this.shippingAddress.country) {
      alert('Please fill in all shipping address fields');
      return;
    }

    this.loading.set(true);
    this.orderService.createOrder(currentCart, this.shippingAddress).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        alert('Order placed successfully!');
        this.router.navigate(['/orders', order.id]);
      },
      error: (err) => {
        alert('Failed to place order: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  cancelCheckout(): void {
    this.showCheckout.set(false);
  }
}

