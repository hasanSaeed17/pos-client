import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Product } from '../../../Models/productModel';
import { Sale, SaleItem } from '../../../Models/saleModel';

import { SalesService } from '../../../Services/sales/sales.service';
import { ProductService } from '../../../Services/products/product.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-sale-order',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatRippleModule,
    MatTabsModule
  ],
  templateUrl: './sale-order.component.html',
  styleUrls: ['./sale-order.component.css']
})
export class SaleOrderComponent implements OnInit {

  // ================= FORM =================
  saleForm!: FormGroup;

  // ================= DATA =================
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProductId: string | null = null;
  isSubmitting = false;

  searchTerm: string = '';
selectedCategory: string = '';
selectedBrand: string = '';

categories: string[] = [];
brands: string[] = [];

  // ================= MATERIAL TABLE DATASOURCE =================
  itemDataSource = new MatTableDataSource<FormGroup>([]);

  displayedColumns = [
    'name',
    'brand',
    'category',
    'sellingPrice',
    'currentStock'
  ];

  itemColumns = [
    'productName',
    'brand',
    'sellingPrice',
    'quantity',
    'discount',
    'total',
    'remove'
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private saleService: SalesService
  ) {}

  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();

    // Recalculate paid amount automatically when items change
    this.items.valueChanges.subscribe(() => {
      this.syncPaidAmount();
    });
  }

private initForm(): void {
  this.saleForm = this.fb.group({
    customerName: [''],
    paymentMethod: ['', Validators.required],
    paidAmount: [0, [Validators.required, Validators.min(0)]],
    isFullyPaid: [true],

    // ✅ ADD FILTER CONTROLS
    search: [''],
    categoryFilter: [''],
    brandFilter: [''],

    items: this.fb.array([])
  });

  this.saleForm.get('isFullyPaid')?.valueChanges.subscribe(isFull => {
    if (isFull) {
      this.saleForm.get('paidAmount')
        ?.setValue(this.grandTotal(), { emitEvent: false });
    }
  });

  // 🔥 FILTER SUBSCRIPTIONS
  this.saleForm.get('search')?.valueChanges.subscribe(() => this.applyFilters());
  this.saleForm.get('categoryFilter')?.valueChanges.subscribe(() => this.applyFilters());
  this.saleForm.get('brandFilter')?.valueChanges.subscribe(() => this.applyFilters());
}

  // ============================================================
  // FORM ARRAY GETTER
  // ============================================================

  get items(): FormArray<FormGroup> {
    return this.saleForm.get('items') as FormArray<FormGroup>;
  }

  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

private loadProducts(): void {
  this.productService.getAvailableProducts().subscribe({
    next: (res) => {
      this.products = res || [];
      this.filteredProducts = [...this.products];

      // ✅ Safe extraction (removes undefined)
      this.categories = Array.from(
        new Set(
          this.products
            .map(p => p.category)
            .filter((c): c is string => !!c)
        )
      );

      this.brands = Array.from(
        new Set(
          this.products
            .map(p => p.brand)
            .filter((b): b is string => !!b)
        )
      );
    },
    error: () => alert('Failed to load products')
  });
}

  // ============================================================
  // SEARCH FILTER
  // ============================================================

applyFilters(): void {

  const search = this.saleForm.get('search')?.value?.toLowerCase() || '';
  const category = this.saleForm.get('categoryFilter')?.value || '';
  const brand = this.saleForm.get('brandFilter')?.value || '';

  this.filteredProducts = this.products.filter(p => {

    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search) ||
      (p.brand || '').toLowerCase().includes(search) ||
      (p.category || '').toLowerCase().includes(search);

    const matchesCategory =
      !category || p.category === category;

    const matchesBrand =
      !brand || p.brand === brand;

    return matchesSearch && matchesCategory && matchesBrand;
  });
}
  // ============================================================
  // PRODUCT SELECTION
  // ============================================================

  selectProduct(product: Product): void {
    this.selectedProductId = product._id;
  }

  onRowDoubleClick(product: Product, event: MouseEvent): void {
    event.stopPropagation();
    this.addProduct(product);
  }

  // ============================================================
  // ADD PRODUCT
  // ============================================================

  addProduct(product: Product): void {

    if (!product || product.currentStock <= 0) {
      alert('Stock is 0. Cannot add this product.');
      return;
    }

    // Check if already exists
    const existing = this.items.controls.find(
      ctrl => ctrl.value.productId === product._id
    );

    if (existing) {
      const newQty = existing.value.quantity + 1;

      if (newQty > product.currentStock) {
        alert('Quantity exceeds available stock.');
        return;
      }

      existing.patchValue({ quantity: newQty });
      this.refreshTable();
      return;
    }

    // Add new item
    const itemGroup = this.fb.group({
      productId: [product._id],
      productName: [product.name],
      category: [product.category],
      brand: [product.brand],
      costPrice: [product.costPrice],
      sellingPrice: [product.sellingPrice],
      quantity: [
        1,
        [Validators.required, Validators.min(1)]
      ],
      discount: [
        0,
        [Validators.min(0)]
      ],
      stock: [product.currentStock]
    });

    this.items.push(itemGroup);
    this.refreshTable();
  }

  // ============================================================
  // REMOVE ITEM
  // ============================================================

  removeItem(index: number): void {
    if (index < 0 || index >= this.items.length) return;

    this.items.removeAt(index);
    this.refreshTable();
  }

  // ============================================================
  // TABLE REFRESH (CRITICAL FOR MATERIAL)
  // ============================================================

  private refreshTable(): void {
    this.itemDataSource.data = [...this.items.controls];
  }

  // ============================================================
  // CALCULATIONS
  // ============================================================

  lineTotal(item: any): number {
    return (item.sellingPrice - item.discount) * item.quantity;
  }

  subtotal(): number {
    return this.items.value.reduce(
      (sum: number, i: any) =>
        sum + (i.sellingPrice * i.quantity),
      0
    );
  }

  totalDiscount(): number {
    return this.items.value.reduce(
      (sum: number, i: any) =>
        sum + (i.discount * i.quantity),
      0
    );
  }

  grandTotal(): number {
    return this.subtotal() - this.totalDiscount();
  }

  private syncPaidAmount(): void {
    if (this.saleForm.get('isFullyPaid')?.value) {
      this.saleForm
        .get('paidAmount')
        ?.setValue(this.grandTotal(), { emitEvent: false });
    }
  }

  // ============================================================
  // SAVE SALE
  // ============================================================

  saveSale(): void {

    if (this.items.length === 0) {
      alert('Add at least one product.');
      return;
    }

    if (this.saleForm.invalid) {
      alert('Complete required fields.');
      return;
    }

    const salePayload: Sale = {
      customerName: this.saleForm.value.customerName,
      items: this.items.value.map((i: any): SaleItem => ({
        productId: i.productId,
        productName: i.productName,
        category: i.category,
        brand: i.brand,
        costPrice: i.costPrice,
        sellingPrice: i.sellingPrice,
        quantity: i.quantity,
        discount: i.discount,
        lineTotal: this.lineTotal(i)
      })),
      subtotal: this.subtotal(),
      totalDiscount: this.totalDiscount(),
      grandTotal: this.grandTotal(),
      paidAmount: this.saleForm.value.isFullyPaid
        ? this.grandTotal()
        : this.saleForm.value.paidAmount,
      isFullyPaid: this.saleForm.value.isFullyPaid,
      paymentMethod: this.saleForm.value.paymentMethod,
      createdBy: 'admin'
    };

    this.isSubmitting = true;

    this.saleService.createSale(salePayload).subscribe({
      next: () => {
        alert('Sale created successfully');

        this.saleForm.reset({
          isFullyPaid: true,
          paidAmount: 0,
          paymentMethod: ''
        });

        this.items.clear();
        this.refreshTable();
        this.selectedProductId = null;
        this.isSubmitting = false;
      },
      error: () => {
        alert('Failed to create sale');
        this.isSubmitting = false;
      }
    });
  }
}