import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  searchQuery = signal('');
  categories = signal<Category[]>([]);
  cartItemCount = signal(0);
  isAuthenticated = signal(false);
  isAdmin = signal(false);
  currentUser = signal<any>(null);

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.updateAuthState();
    this.updateCartCount();

    this.authService.currentUser$.subscribe(() => {
      this.updateAuthState();
    });

    this.cartService.cart$.subscribe(() => {
      this.updateCartCount();
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  updateAuthState(): void {
    this.isAuthenticated.set(this.authService.isAuthenticated());
    this.isAdmin.set(this.authService.isAdmin());
    this.currentUser.set(this.authService.getCurrentUser());
  }

  updateCartCount(): void {
    this.cartItemCount.set(this.cartService.getCartItemCount());
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { search: query } });
    }
  }

  onCategorySelect(categoryId: string): void {
    this.router.navigate(['/products'], { queryParams: { category: categoryId } });
  }

  logout(): void {
    this.authService.logout();
  }
}

