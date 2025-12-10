import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesReportService, SalesReportData, SalesReportResponse } from '../../core/services/sales-report.service';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.css'
})
export class SalesReportComponent {
  startDate = signal('');
  endDate = signal('');
  reportData = signal<SalesReportData | null>(null);
  loading = signal(false);
  error = signal('');

  constructor(private salesReportService: SalesReportService) {}

  generateReport(): void {
    if (!this.startDate() || !this.endDate()) {
      this.error.set('Please select both start and end dates.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.reportData.set(null);

    this.salesReportService.getSalesReport(this.startDate(), this.endDate())
      .subscribe({
        next: (response: SalesReportResponse) => {
          this.reportData.set(response.data);
          this.loading.set(false);
        },
        error: (err: any) => {
          this.error.set(err.message);
          this.loading.set(false);
        }
      });
  }

  getMonthName(month: number): string {
    return this.salesReportService.getMonthName(month);
  }

  formatCurrency(amount: number): string {
    return this.salesReportService.formatCurrency(amount);
  }

  formatDateForDisplay(dateString: string): string {
    return this.salesReportService.formatDateForDisplay(dateString);
  }

  get overallStats() {
    return this.reportData()?.overallStats?.[0] || null;
  }

  get topProducts() {
    return this.reportData()?.topProducts || [];
  }

  get topUsers() {
    return this.reportData()?.topUsers || [];
  }

  get monthlySales() {
    return this.reportData()?.monthlySales || [];
  }
}
