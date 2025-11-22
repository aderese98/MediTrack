# MediTrack – Clinical Workflow Dashboard (Angular 21)

MediTrack is a clinical workflow dashboard built with **Angular 21** that simulates how a radiopharmaceutical / oncology research network might manage:

- Patient enrollment & status
- Imaging and therapy study orders
- Daily appointment schedule
- Operational tasks for coordinators and clinicians

It uses a **mock REST API** to model integration with clinical systems (PACS/RIS/EMR-style backends) and demonstrates modern Angular patterns:
**standalone components, signals, new control flow (`@if`, `@for`), reactive forms, and RxJS interop**.

---

## Features

### 📋 Patient Management

- Patient list with **search, status filters, and sortable columns**
- **Create** new patients with a validated reactive form
- **Edit** existing patients via an API-backed edit form
- Status chips for Active / Completed / On Hold
- Automatic `lastUpdated` timestamps

### 🧪 Studies & Orders

- Table of imaging/therapy orders with:
  - Filters by **modality** (PET/CT/MRI/NM)
  - Filters by **status** (Scheduled, In Progress, Completed, Cancelled)
- Sorted by earliest scheduled date to help staff prioritize

### 📅 Schedule

- Agenda-style view of upcoming appointments
- Quick range selector:
  - **Today**
  - **Next 7 days**
  - **All upcoming**
- Shows appointment type, location, clinician, and status

### ✅ Tasks Queue

- Task board for coordinators / clinicians
- Filter tasks by **status** (Open, In Progress, Done)
- Filter tasks by **priority** (Critical, High, Normal, Low)
- Click to cycle task status:
  - Open → In Progress → Done → Open
- Changes are persisted via a mock API (`json-server`)

### 🧭 Dashboard Overview

- High-level snapshot of operational health:
  - Active patients
  - Scheduled studies
  - Today’s appointments
  - Open tasks (with count of high-priority items)
- Cards link into the relevant sections (Patients, Studies, Schedule, Tasks)

---

## Tech Stack

- **Frontend**
  - Angular 21 (standalone components, signals, new control flow)
  - TypeScript, HTML, SCSS
  - RxJS (`forkJoin`, `takeUntilDestroyed`)

- **API / Backend (Mocked)**
  - `json-server` serving:
    - `/patients`
    - `/studyOrders`
    - `/appointments`
    - `/tasks`
  - Simulates integration with clinical systems / PACS / RIS / EMR

---

## Architecture

- `src/app/core`
  - `models/` – TypeScript interfaces for domain objects: `Patient`, `StudyOrder`, `Appointment`, `Task`
  - `clinical-data.service.ts` – single entry point for all HTTP calls
- `src/app/features`
  - `dashboard.*` – high-level summary cards
  - `patients.*` – list, search, filter, sort, navigate to create/edit
  - `patient-form.*` – create patient (reactive form)
  - `patient-edit.*` – edit patient (signals + reactive form)
  - `studies.*` – studies/orders table with filters
  - `schedule.*` – appointment agenda with date range filters
  - `tasks.*` – tasks queue with filters and status toggling
- `app.routes.ts`
  - Routes for `/dashboard`, `/patients`, `/patients/new`, `/patients/:id/edit`, `/studies`, `/schedule`, `/tasks`

Patterns used:

- **Signals** for UI state (`loading`, filters, derived lists)
- **`computed()`** for filtered + sorted collections
- **New control flow** (`@if`, `@for`) instead of `*ngIf` / `*ngFor`
- **`takeUntilDestroyed`** for automatic subscription cleanup
- **Reactive forms** for create/edit workflows

---

## Getting Started

### 1. Install dependencies

```bash
npm install
