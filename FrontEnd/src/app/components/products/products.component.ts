import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchProducts(params['search']);
      } else if (params['category']) {
        this.loadProductsByCategory(params['category']);
      } else {
        this.loadProducts();
      }
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadProductsByCategory(categoryId: string): void {
    this.loading.set(true);
    this.productService.getProductsByCategory(categoryId).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  searchProducts(query: string): void {
    this.loading.set(true);
    this.productService.searchProducts(query).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  addToCart(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      this.cartService.addToCart(product, 1);
      alert('Product added to cart!');
    } catch (error: any) {
      alert(error.message);
    }
  }

  getCategoryName(category: any): string {
    if (typeof category === 'string') {
      return 'Category'; // Fallback since we don't have category name
    }
    return category?.name || 'Category';
  }
}

