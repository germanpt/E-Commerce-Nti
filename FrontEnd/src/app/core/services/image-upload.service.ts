import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  constructor(private http: HttpClient) {}

  uploadProductImage(productId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('imageFile', file);

    return this.http.post<{success: boolean, data: any[], message: string}>(
      `${environment.apiUrl}/products/${productId}/images`,
      formData
    ).pipe(
      map(response => response),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to upload image. Please try again.';
        if (error.error?.error) {
          errorMessage = error.error.error;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Validate file before upload
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, GIF, and WebP images are allowed.'
      };
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 5MB.'
      };
    }

    return { valid: true };
  }

  getFullImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `${environment.apiUrl}${imageUrl}`;
  }
}
