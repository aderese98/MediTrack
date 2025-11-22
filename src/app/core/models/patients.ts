export type PatientStatus = 'Active' | 'Completed' | 'On Hold';

export interface Patient {
    id: number;
    mrn: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    sex: 'M' | 'F' | 'O';
    primaryOncologist: string;
    status: PatientStatus;
    lastUpdated: string;
}