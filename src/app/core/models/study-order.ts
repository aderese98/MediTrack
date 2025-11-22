export type StudyStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export type Modality = 'PET' | 'CT' | 'MRI' | 'NM';

export interface StudyOrder {
    id: number;
    patientId: number;
    accessionNumber: string,
    modality: Modality,
    description: string;
    scheduledFor: string;
    status: StudyStatus;
    location: string;
}