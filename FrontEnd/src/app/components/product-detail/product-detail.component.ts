import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  quantity = signal(1);
  loading = signal(true);

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  loadProduct(id: string): void {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.product.set(product);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  increaseQuantity(): void {
    const currentQty = this.quantity();
    const product = this.product();
    if (product && currentQty < (product.stock || 0)) {
      this.quantity.set(currentQty + 1);
    }
  }

  getCategoryName(category: any): string {
    if (typeof category === 'string') {
      return 'Category'; // Fallback since we don't have category name
    }
    return category?.name || 'Category';
  }

  decreaseQuantity(): void {
    const currentQty = this.quantity();
    if (currentQty > 1) {
      this.quantity.set(currentQty - 1);
    }
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      this.cartService.addToCart(product, this.quantity());
      alert('Product added to cart!');
    } catch (error: any) {
      alert(error.message);
    }
  }
}

