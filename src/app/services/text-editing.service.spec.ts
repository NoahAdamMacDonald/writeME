import { TestBed } from '@angular/core/testing';

import { TextEditingService } from './text-editing.service';

describe('TextEditingService', () => {
  let service: TextEditingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextEditingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
