import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface SalesReportData {
  overallStats: Array<{
    _id: null;
    totalRevenue: number;
    totalQuantity: number;
    totalOrders: number;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    revenue: number;
    quantitySold: number;
  }>;
  topUsers: Array<{
    _id: string;
    name: string;
    email: string;
    totalSpent: number;
    totalQuantity: number;
    ordersCount: number;
  }>;
  monthlySales: Array<{
    _id: {
      year: number;
      month: number;
    };
    totalRevenue: number;
    totalQuantity: number;
  }>;
}

export interface SalesReportResponse {
  message: string;
  data: SalesReportData;
}

@Injectable({
  providedIn: 'root'
})
export class SalesReportService {
  constructor(private http: HttpClient) {}

  getSalesReport(startDate: string, endDate: string): Observable<SalesReportResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<SalesReportResponse>(`${environment.apiUrl}/sales/report`, { params })
      .pipe(
        map(response => response),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to load sales report. Please try again.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
