import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, Category, CreateProductData } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getProducts(includeDeleted: boolean = false): Observable<Product[]> {
    const params: any = {};
    if (includeDeleted) {
      params.includeDeleted = 'true';
    }
    return this.http
      .get<{ success: boolean; count: number; data: Product[] }>(`${environment.apiUrl}/products`, {
        params,
      })
      .pipe(
        map((response) => response.data.map((product) => this.mapProductResponse(product))),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to load products. Please try again.';
          if (error.error?.error) {
            errorMessage = error.error.error;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http
      .get<{ success: boolean; data: Product }>(`${environment.apiUrl}/products/${slug}`)
      .pipe(
        map((response) => this.mapProductResponse(response.data)),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to load product. Please try again.';
          if (error.error?.error) {
            errorMessage = error.error.error;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getProductById(id: string): Observable<Product | undefined> {
    return this.getProductBySlug(id);
  }

  searchProducts(query: string): Observable<Product[]> {
    const params = { search: query };
    return this.http
      .get<{ success: boolean; count: number; data: Product[] }>(`${environment.apiUrl}/products`, {
        params,
      })
      .pipe(
        map((response) => response.data.map((product) => this.mapProductResponse(product))),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to search products. Please try again.';
          if (error.error?.error) {
            errorMessage = error.error.error;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<{ success: boolean; count: number; data: Category[] }>(
        `${environment.apiUrl}/categories`
      )
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to load categories. Please try again.';
          if (error.error?.error) {
            errorMessage = error.error.error;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http
      .get<{ success: boolean; data: Category }>(`${environment.apiUrl}/categories/${id}`)
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to load category. Please try again.';
          if (error.error?.error) {
            errorMessage = error.error.error;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  createProduct(productData: CreateProductData): Observable<Product> {
    return this.http
      .post<{ success: boolean; data: Product }>(`${environment.apiUrl}/products`, productData)
      .pipe(
        map((response) => this.mapProductResponse(response.data)),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to create product. Please try again.';
          if (error.error?.error) {
            errorMessage = error.error.error;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  softDeleteProduct(id: string): Observable<Product> {
    return this.http
      .delete<{ success: boolean; data: Product }>(`${environment.apiUrl}/products/${id}`)
      .pipe(
        map((response) => this.mapProductResponse(response.data)),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to delete product. Please try again.';
          if (error.error?.error) {
            errorMessage = error.error.error;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  updateStock(id: string, stock: number): Observable<Product> {
    return this.http
      .put<{ success: boolean; data: Product }>(`${environment.apiUrl}/products/stock/${id}`, {
        stock,
      })
      .pipe(
        map((response) => this.mapProductResponse(response.data)),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to update stock. Please try again.';
          if (error.error?.error) {
            errorMessage = error.error.error;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.getProducts().pipe(
      map((products) =>
        products.filter((product) => {
          if (typeof product.category === 'string') {
            return product.category === categoryId;
          } else {
            return (
              (product.category as Category)?._id === categoryId ||
              (product.category as Category)?.id === categoryId
            );
          }
        })
      )
    );
  }

  private mapProductResponse(product: Product): Product {
    const mappedProduct = { ...product };

    if (product.sizes && product.sizes.length > 0) {
      mappedProduct.stock = product.sizes.reduce((total, size) => total + size.stock, 0);
    } else {
      mappedProduct.stock = 0;
    }

    if (product.images && product.images.length > 0) {
      mappedProduct.imageUrl = product.images[0].url;
    } else {
      mappedProduct.imageUrl = 'https://via.placeholder.com/300x300?text=No+Image';
    }

    return mappedProduct;
  }
}
