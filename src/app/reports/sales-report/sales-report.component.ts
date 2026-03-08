import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { SalesService } from '../../../Services/sales/sales.service';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.css'
})
export class SalesReportComponent implements OnInit {

  @ViewChildren(MatExpansionPanel) panels!: QueryList<MatExpansionPanel>;

  sales: any[] = [];
  isLoading = false;

  /* ================= SUMMARY DATA ================= */

  totalSales = 0;
  totalRevenue = 0;
  totalItems = 0;
  totalPaid = 0;
  totalPending = 0;

  /* ================= FILTER STATES ================= */

  activePeriod: 'daily' | 'weekly' | 'monthly' | null = null;

  filterForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSales();
  }

  /* =====================================================
     FORM INITIALIZATION
  ===================================================== */

  private initializeForm(): void {

    this.filterForm = this.fb.group({
      paymentMethod: [''],
      from: [''],
      to: ['']
    });
  }

  /* =====================================================
     LOAD SALES
  ===================================================== */

  private loadSales(filters?: any): void {

    this.isLoading = true;

    this.salesService.getSalesReport(filters).subscribe({

      next: (res) => {

        this.sales = res?.data || [];
        this.calculateSummary();

        this.isLoading = false;
      },

      error: (err) => {

        console.error('Sales report error:', err);
        alert('Failed to load sales report');

        this.isLoading = false;
      }
    });
  }

  /* =====================================================
     SUMMARY CALCULATION
  ===================================================== */

  private calculateSummary(): void {

    this.totalSales = this.sales.length;

    this.totalRevenue = this.sales.reduce(
      (sum, s) => sum + (s.grandTotal || 0),
      0
    );

    this.totalPaid = this.sales.reduce(
      (sum, s) => sum + (s.paidAmount || 0),
      0
    );

    this.totalPending = this.totalRevenue - this.totalPaid;

    this.totalItems = this.sales.reduce((sum, s) => {

      const itemsCount = s.items?.reduce(
        (itemSum: number, item: any) => itemSum + (item.quantity || 0),
        0
      ) || 0;

      return sum + itemsCount;

    }, 0);
  }

  /* =====================================================
     PERIOD FILTER
  ===================================================== */

  togglePeriod(period: 'daily' | 'weekly' | 'monthly'): void {

    if (this.activePeriod === period) {
      this.activePeriod = null;
    }
    else {
      this.activePeriod = period;
    }

    this.applyFilters();
  }

  /* =====================================================
     APPLY FILTERS
  ===================================================== */

  applyFilters(): void {

    const { paymentMethod, from, to } = this.filterForm.value;

    const filters: any = {};

    if (this.activePeriod) {
      filters.period = this.activePeriod;
    }

    if (paymentMethod) {
      filters.paymentMethod = paymentMethod;
    }

    if (from && to) {
      filters.from = new Date(from).toISOString();
      filters.to = new Date(to).toISOString();
    }

    this.loadSales(filters);
  }

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  resetFilters(): void {

    this.activePeriod = null;
    this.filterForm.reset();

    this.loadSales();
  }

  /* =====================================================
     EXPANSION CONTROLS
  ===================================================== */

  expandAll(): void {
    this.panels.forEach(panel => panel.open());
  }

  collapseAll(): void {
    this.panels.forEach(panel => panel.close());
  }


}