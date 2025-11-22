import {
  Component,
  OnInit,
  computed,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Patient, PatientStatus } from '../../core/models/patients';
import { ClinicalData } from '../../core/clinical-data';
@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patients.html',
  styleUrls: ['./patients.scss'],
})
export class Patients implements OnInit {
  private destroyRef = inject(DestroyRef);

  // raw data from API
  private patients = signal<Patient[]>([]);

  // UI state (signals)
  searchTerm = signal('');
  statusFilter = signal<'all' | PatientStatus>('all');
  sortField = signal<'lastName' | 'mrn' | 'lastUpdated'>('lastName');
  sortDirection = signal<'asc' | 'desc'>('asc');

  loading = signal(true);
  error = signal<string | null>(null);

  // derived data
  filteredPatients = computed(() => {
    let items = this.patients();

    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      items = items.filter((p) => {
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        return (
          fullName.includes(term) ||
          p.mrn.toLowerCase().includes(term) ||
          p.primaryOncologist.toLowerCase().includes(term)
        );
      });
    }

    const status = this.statusFilter();
    if (status !== 'all') {
      items = items.filter((p) => p.status === status);
    }

    const sortField = this.sortField();
    const dir = this.sortDirection();
    const factor = dir === 'asc' ? 1 : -1;

    return items.slice().sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';

      switch (sortField) {
        case 'lastName':
          av = a.lastName;
          bv = b.lastName;
          break;
        case 'mrn':
          av = a.mrn;
          bv = b.mrn;
          break;
        case 'lastUpdated':
          av = new Date(a.lastUpdated).getTime();
          bv = new Date(b.lastUpdated).getTime();
          break;
      }

      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  });

  constructor(private clinicalData: ClinicalData) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.clinicalData
      .getPatients()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (patients) => {
          this.patients.set(patients);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load patients', err);
          this.error.set('Failed to load patients. Please try again.');
          this.loading.set(false);
        },
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onStatusFilterChange(value: string): void {
    if (value === 'all' || value === 'Active' || value === 'Completed' || value === 'On Hold') {
      this.statusFilter.set(value as 'all' | PatientStatus);
    }
  }

  toggleSort(field: 'lastName' | 'mrn' | 'lastUpdated'): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  formatDob(dob: string): string {
    return new Date(dob).toLocaleDateString();
  }

  formatLastUpdated(date: string): string {
    return new Date(date).toLocaleString();
  }
}
