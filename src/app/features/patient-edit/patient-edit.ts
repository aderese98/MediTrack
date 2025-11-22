import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClinicalData } from '../../core/clinical-data';
import { Patient, PatientStatus } from '../../core/models/patients';
@Component({
  selector: 'app-patient-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './patient-edit.html',
  styleUrls: ['./patient-edit.scss'],
})
export class PatientEdit implements OnInit {
  // signal-based state
  loading = signal(true);
  loadingError = signal<string | null>(null);
  submitting = signal(false);
  submitError = signal<string | null>(null);
  patient = signal<Patient | null>(null);

  statusOptions: PatientStatus[] = ['Active', 'Completed', 'On Hold'];

  form!: FormGroup;

  // derived title
  pageTitle = computed(() => {
    const p = this.patient();
    if (!p) return 'Edit Patient';
    return `Edit: ${p.lastName}, ${p.firstName}`;
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clinicalData: ClinicalData
  ) {
    this.form = this.fb.group({
      mrn: ['', [Validators.required, Validators.maxLength(20)]],
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      dateOfBirth: ['', [Validators.required]],
      sex: ['O', [Validators.required]],
      primaryOncologist: [
        '',
        [Validators.required, Validators.maxLength(80)],
      ],
      status: ['Active', [Validators.required]],
    });
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading.set(false);
      this.loadingError.set('Invalid patient ID.');
      return;
    }

    this.loading.set(true);
    this.loadingError.set(null);

    this.clinicalData.getPatientById(id).subscribe({
      next: (patient) => {
        this.patient.set(patient);
        this.loading.set(false);

        // Patch form with fetched patient
        this.form.patchValue({
          mrn: patient.mrn,
          firstName: patient.firstName,
          lastName: patient.lastName,
          // dateOfBirth stored as ISO; slice for <input type="date">
          dateOfBirth: patient.dateOfBirth?.slice(0, 10),
          sex: patient.sex,
          primaryOncologist: patient.primaryOncologist,
          status: patient.status,
        });
      },
      error: (err) => {
        console.error('Failed to load patient', err);
        this.loading.set(false);
        this.loadingError.set('Failed to load patient. Please try again.');
      },
    });
  }

  onSubmit() {
    this.submitError.set(null);

    if (this.form.invalid || !this.patient()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const value = this.form.value;
    const current = this.patient()!;

    const payload: Omit<Patient, 'id'> = {
      mrn: value.mrn!,
      firstName: value.firstName!,
      lastName: value.lastName!,
      dateOfBirth: value.dateOfBirth!,
      sex: value.sex!,
      primaryOncologist: value.primaryOncologist!,
      status: value.status! as PatientStatus,
      lastUpdated: new Date().toISOString(),
    };

    this.clinicalData.updatePatient(current.id, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/patients']);
      },
      error: (err) => {
        console.error('Failed to update patient', err);
        this.submitting.set(false);
        this.submitError.set(
          'Failed to update patient. Please try again or contact support.'
        );
      },
    });
  }
}
