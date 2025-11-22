import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClinicalData } from '../../core/clinical-data';
import { PatientStatus } from '../../core/models/patients';
@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './patient-form.html',
  styleUrls: ['./patient-form.scss'],
})
export class PatientForm {
  submitting = false;
  submitError: string | null = null;

  statusOptions: PatientStatus[] = ['Active', 'Completed', 'On Hold'];

  // declare, but don't initialize here
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private clinicalData: ClinicalData,
    private router: Router
  ) {
    // safe to use `fb` here (after DI)
    this.form = this.fb.group({
      mrn: ['', [Validators.required, Validators.maxLength(20)]],
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      dateOfBirth: ['', [Validators.required]],
      sex: ['O', [Validators.required]], // 'M' | 'F' | 'O'
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

  onSubmit() {
    this.submitError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const value = this.form.value;

    this.clinicalData
      .createPatient({
        mrn: value.mrn!,
        firstName: value.firstName!,
        lastName: value.lastName!,
        dateOfBirth: value.dateOfBirth!,
        sex: value.sex!,
        primaryOncologist: value.primaryOncologist!,
        status: value.status! as PatientStatus,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/patients']);
        },
        error: (err) => {
          console.error('Failed to create patient', err);
          this.submitting = false;
          this.submitError =
            'Failed to create patient. Please try again or contact support.';
        },
      });
  }
}
