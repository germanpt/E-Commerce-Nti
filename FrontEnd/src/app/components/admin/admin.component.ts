import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Order, OrderStatus } from '../../models/order.model';
import { Product, Category, CreateProductData } from '../../models/product.model';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { ImageUploadService } from '../../core/services/image-upload.service';
import { SalesReportComponent } from '../sales-report/sales-report.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SalesReportComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  activeTab = signal<'orders' | 'products' | 'reports'>('orders');

  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  selectedStatus: OrderStatus | 'all' = 'all';
  loading = signal(true);
  selectedOrder = signal<Order | null>(null);
  orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loadingProducts = signal(true);
  showProductForm = signal(false);
  editingProduct = signal<Product | null>(null);
  showDeletedProducts = signal(false);

  productForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required, Validators.min(0)]),
    imageUrl: new FormControl('', [Validators.required]),
    categoryId: new FormControl('', [Validators.required]),
    stock: new FormControl('', [Validators.required, Validators.min(0)]),
  });

  selectedImages: File[] = [];
  imagePreviews: string[] = [];
  uploadingImages = signal(false);

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    public imageUploadService: ImageUploadService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadProducts();
    this.loadCategories();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.filterOrders();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  filterOrders(): void {
    if (this.selectedStatus === 'all') {
      this.filteredOrders.set(this.orders());
    } else {
      this.filteredOrders.set(
        this.orders().filter((order) => order.status === this.selectedStatus)
      );
    }
  }

  onStatusFilterChange(): void {
    this.filterOrders();
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
    if (confirm(`Are you sure you want to change the order status?`)) {
      this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
        next: () => {
          this.loadOrders();
          this.selectedOrder.set(null);
        },
        error: (err: any) => {
          alert('Failed to update order status: ' + err.message);
        },
      });
    }
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeOrderDetails(): void {
    this.selectedOrder.set(null);
  }

  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status];
  }

  loadProducts(): void {
    this.loadingProducts.set(true);
    this.productService.getProducts(this.showDeletedProducts()).subscribe({
      next: (products) => {
        this.products.set(products);
        this.filteredProducts.set(products);
        this.loadingProducts.set(false);
      },
      error: () => {
        this.loadingProducts.set(false);
      },
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
    });
  }

  toggleDeletedProducts(): void {
    this.showDeletedProducts.set(!this.showDeletedProducts());
    this.loadProducts();
  }

  openProductForm(product?: Product): void {
    if (product) {
      this.editingProduct.set(product);
      this.productForm.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images || [{ url: product.imageUrl || '' }],
        category:
          typeof product.category === 'string'
            ? product.category
            : product.category?._id || product.category?.id || '',
        sizes: product.sizes || [{ size: 'Default', stock: product.stock || 0 }],
      });
    } else {
      this.editingProduct.set(null);
      this.productForm.reset();
    }
    this.showProductForm.set(true);
  }

  closeProductForm(): void {
    this.showProductForm.set(false);
    this.editingProduct.set(null);
    this.productForm.reset();
    this.selectedImages = [];
    this.imagePreviews = [];
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }

    const productData: CreateProductData = {
      name: this.productForm.value.name,
      description: this.productForm.value.description,
      price: parseFloat(this.productForm.value.price),
      category: this.productForm.value.categoryId,
      sizes: [{ size: 'Default', stock: parseInt(this.productForm.value.stock) }],
      images: [{ url: this.productForm.value.imageUrl }],
    };

    if (this.editingProduct()) {
      alert('Product update not implemented yet. Please delete and recreate the product.');
      return;
    } else {
      this.productService.createProduct(productData).subscribe({
        next: async (createdProduct) => {
          if (this.selectedImages.length > 0 && createdProduct._id) {
            await this.uploadImagesForProduct(createdProduct._id);
          }

          this.loadProducts();
          this.closeProductForm();
          alert('Product created successfully!');
        },
        error: (err: any) => {
          alert('Failed to create product: ' + err.message);
        },
      });
    }
  }

  softDeleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"? This can be restored later.`)) {
      this.productService.softDeleteProduct(product.id || product._id || '').subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err: any) => {
          alert('Failed to delete product: ' + err.message);
        },
      });
    }
  }

  getCategoryName(category: any): string {
    if (typeof category === 'string') {
      return 'Category'; // Fallback since we don't have category name
    }
    return category?.name || 'Category';
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];

    for (const file of files) {
      const validation = this.imageUploadService.validateImageFile(file);

      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      this.selectedImages.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviews.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  async uploadImagesForProduct(productId: string): Promise<void> {
    if (this.selectedImages.length === 0) return;

    this.uploadingImages.set(true);

    try {
      for (const file of this.selectedImages) {
        await this.imageUploadService.uploadProductImage(productId, file).toPromise();
      }

      this.selectedImages = [];
      this.imagePreviews = [];
      this.loadProducts();
    } catch (error: any) {
      alert('Failed to upload images: ' + error.message);
    } finally {
      this.uploadingImages.set(false);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
