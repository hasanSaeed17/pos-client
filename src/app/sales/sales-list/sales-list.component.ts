import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { SalesService } from '../../../Services/sales/sales.service';
import { Sale } from '../../../Models/saleModel';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.css']
})
export class SalesListComponent implements OnInit {

  displayedColumns: string[] = [
    'saleCode',
    'customer',
    'date',
    'itemsCount',
    'total',
    'paid',
    'status'
  ];

  dataSource = new MatTableDataSource<Sale>();
  isLoading = false;

  filterForm!: FormGroup;

  // Summary
  totalSales = 0;
  totalTransactions = 0;
  totalPaid = 0;
  totalPending = 0;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSales();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      status: [''],
      paymentMethod: [''],
      period: [''],
      from: [''],
      to: ['']
    });
  }

  private loadSales(filters?: any): void {

    this.isLoading = true;

    this.salesService.getSales(filters).subscribe({
      next: (res: any) => {

        const sales = res.data || [];

        // Sort by date DESC
        sales.sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        this.dataSource.data = sales;

        this.calculateSummary(sales);

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to load sales');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {

    const { status, paymentMethod, period, from, to } = this.filterForm.value;

    if (period && (from || to)) {
      alert('Use either Period OR Date Range.');
      return;
    }

    if ((from && !to) || (!from && to)) {
      alert('Select both From and To dates.');
      return;
    }

    if (from && to && new Date(from) > new Date(to)) {
      alert('From date cannot be after To date.');
      return;
    }

    const filters: any = {};

    if (status) filters.status = status;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (period) filters.period = period;

    if (from && to) {
      filters.from = new Date(from).toISOString();
      filters.to = new Date(to).toISOString();
    }

    this.loadSales(filters);
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.loadSales();
  }

  calculateSummary(sales: Sale[]): void {

    this.totalTransactions = sales.length;

    this.totalSales = sales.reduce(
      (sum, s: any) => sum + s.grandTotal,
      0
    );

    this.totalPaid = sales.reduce(
      (sum, s: any) => sum + s.paidAmount,
      0
    );

    this.totalPending = this.totalSales - this.totalPaid;
  }

  getStatus(sale: any): string {

    if (sale.paidAmount === 0) return 'Unpaid';
    if (sale.paidAmount < sale.grandTotal) return 'Partial';
    return 'Paid';
  }

  getItemsCount(sale: any): number {
  if (!sale?.items || !Array.isArray(sale.items)) return 0;

  return sale.items.reduce(
    (sum: number, item: any) => sum + (item.quantity || 0),
    0
  );
}

}