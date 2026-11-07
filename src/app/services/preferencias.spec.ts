import { TestBed } from '@angular/core/testing';
import { Preferencias } from './preferencias';

describe('Preferencias', () => {
  let service: Preferencias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Preferencias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
