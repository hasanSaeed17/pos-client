import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, Subject } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InventoryService } from '../../../Services/inventory/inventory.service';
import { SupplierService } from '../../../Services/supplier/supplier.service';
import {MatCardModule} from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-inventory-list',
  imports: [
  CommonModule,
  MatCardModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatInputModule,
  MatFormFieldModule,
  MatIconModule,
  MatSelectModule,
  MatChipsModule,
  MatButtonModule,
  MatButtonToggleModule
],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.css'
})
export class InventoryListComponent implements OnInit {


  displayedColumns: string[] = [
    'name',
    'brand',
    'supplier',
    'sellingPrice',
    'currentStock',
    'status'
  ];

  dataSource = new MatTableDataSource<any>();

  allProducts: any[] = [];
  suppliers: any[] = [];

  selectedSupplier = '';
  selectedStatus = '';
  searchText = '';

  pageSize = 10;
  totalProducts = 0;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private inventoryService: InventoryService,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {

    this.loadInventory();
    this.loadSuppliers();

  }

  ngAfterViewInit() {

    this.dataSource.sort = this.sort;

  }

  loadInventory() {

    this.inventoryService.getInventory(1,1000,'','createdAt','desc')
      .subscribe((res:any)=>{

        this.allProducts = res.data || [];

        this.dataSource.data = this.allProducts;

      });

  }

  loadSuppliers(){

    this.supplierService.getAllSupplier()
      .subscribe((res:any)=>{

        this.suppliers = res.data || [];

      });

  }

  onSearch(event:Event){

    const input = event.target as HTMLInputElement;

    this.searchText = input.value.toLowerCase();

    this.applyFilters();

  }

  toggleStatus(status:string){

    if(this.selectedStatus === status){
      this.selectedStatus = '';
    } else {
      this.selectedStatus = status;
    }

    this.applyFilters();

  }

applyFilters() {

  let filtered = [...this.allProducts];

  const now = new Date();

  // DATE FILTER
  if (this.selectedDateFilter === 'today') {

    filtered = filtered.filter(p => {

      const date = new Date(p.createdAt);

      return date.toDateString() === now.toDateString();

    });

  }

  if (this.selectedDateFilter === 'week') {

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);

    filtered = filtered.filter(p => {

      const date = new Date(p.createdAt);

      return date >= startOfWeek;

    });

  }

  if (this.selectedDateFilter === 'month') {

    filtered = filtered.filter(p => {

      const date = new Date(p.createdAt);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );

    });

  }

  // SUPPLIER FILTER
  if (this.selectedSupplier) {

    filtered = filtered.filter(
      p => p?.supplierId?._id === this.selectedSupplier
    );

  }

  // STATUS FILTER
  if (this.selectedStatus === 'inStock') {

    filtered = filtered.filter(
      p => p.currentStock > p.lowStockQuantity
    );

  }

  if (this.selectedStatus === 'lowStock') {

    filtered = filtered.filter(
      p => p.currentStock > 0 && p.currentStock <= p.lowStockQuantity
    );

  }

  if (this.selectedStatus === 'outOfStock') {

    filtered = filtered.filter(
      p => p.currentStock === 0
    );

  }

  // SEARCH FILTER
  if (this.searchText) {

    const search = this.searchText.toLowerCase();

    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.brand?.toLowerCase().includes(search) ||
      p.category?.toLowerCase().includes(search)
    );

  }

  // UPDATE TABLE
  this.dataSource.data = filtered;

}

  getStockStatus(product:any){

    if(product.currentStock === 0){
      return { label:'Out Of Stock', color:'red' };
    }

    if(product.currentStock <= product.lowStockQuantity){
      return { label:'Low Stock', color:'orange' };
    }

    return { label:'In Stock', color:'green' };

  }


  selectedDateFilter = '';

  toggleDateFilter(filter: string) {

  if (this.selectedDateFilter === filter) {

    // disable filter
    this.selectedDateFilter = '';

  } else {

    // enable new filter
    this.selectedDateFilter = filter;

  }

  this.applyFilters();

}


}
