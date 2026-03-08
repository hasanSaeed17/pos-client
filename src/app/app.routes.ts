import { Routes } from '@angular/router';

import { SupplierOrderComponent } from './supplier/supplier-order/supplier-order.component';
import { SupplierListComponent } from './supplier/supplier-list/supplier-list.component';
import { PurchaseOrderComponent } from './purchase/purchase-order/purchase-order.component';
import { PurchaseListComponent } from './purchase/purchase-list/purchase-list.component';
import { SaleOrderComponent } from './sales/sale-order/sale-order.component';
import { SalesListComponent } from './sales/sales-list/sales-list.component';
import { PurchaseReportComponent } from './reports/purchase-report/purchase-report.component';
import { SalesReportComponent } from './reports/sales-report/sales-report.component';
import { InventoryAdjustmentComponent } from './inventory/inventory-adjustment/inventory-adjustment.component';
import { InventoryListComponent } from './inventory/inventory-list/inventory-list.component';

export const routes: Routes = [

    {path: 'supplierOrder', component: SupplierOrderComponent},
    {path: 'supplierList', component: SupplierListComponent},
    {path: 'purchaseOrder', component: PurchaseOrderComponent},
    {path: 'purchaseList', component: PurchaseListComponent},
    {path: 'purchaseReport', component: PurchaseReportComponent},
    {path: 'saleOrder', component: SaleOrderComponent},
    {path: 'salesList', component: SalesListComponent},
    {path: 'salesReport', component: SalesReportComponent},
    {path: 'inventoryAdjustment', component: InventoryAdjustmentComponent},
    {path: 'inventoryList', component: InventoryListComponent},


];
