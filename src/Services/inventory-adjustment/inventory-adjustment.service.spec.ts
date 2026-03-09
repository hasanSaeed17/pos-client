import { TestBed } from '@angular/core/testing';

import { InventoryAdjustmentService } from './inventory-adjustment.service';

describe('InventoryAdjustmentService', () => {
  let service: InventoryAdjustmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryAdjustmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
