# Deccan Care Maternity & General Hospital

A modern, high-performance web platform and admin management system for **Deccan Care Maternity & General Hospital**, located in Kalaburagi, Karnataka.

---

## 🏥 Hospital Overview

- **Facility Name:** Deccan Care Maternity & General Hospital
- **Address:** Near Quadri Chowk, Opp. Bharat Petrol Bunk, Sheikh Roza, Kalaburagi, Karnataka - 585101
- **Specialties:** Maternity Care, Obstetrics & Gynaecology, Pediatrics, General Medicine, Diagnostic Facilities, and 24/7 Emergency & Casualty Support.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling & UI:** Tailwind CSS, Framer Motion, Lucide Icons
- **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Backend & Database:** Google Firebase, Cloud Firestore, Firebase Authentication
- **Media Storage:** Cloudinary (Unsigned client-side uploads)
- **Document Generation:** jsPDF (Client-side appointment slip / confirmation generation)
- **Mapping:** OpenStreetMap / Leaflet integration

---

## ✨ Key Features

1. **Cinematic 3D Opening:** High-performance WebGL 3D brand reveal featuring a translucent crystalline medical core, precision 3D cross, gyroscopic telemetry rings, and weightless ambient particles that smoothly dissolves into the homepage.
2. **Public Healthcare Portal:**
   - Detailed clinical services directory and hospital facilities overview.
   - Comprehensive doctors directory with qualification, designation, and bio profiles.
   - Hospital gallery with responsive, touch-friendly image lightbox viewer.
   - Direct 24/7 emergency calling and map navigation.
3. **Public Appointment Booking:**
   - Frictionless patient booking workflow (**no patient login/registration required**).
   - Dynamic real-time doctor availability and time slot filtering.
   - Firestore transaction-based atomic double-booking protection.
   - Instant booking confirmation with downloadable and printable PDF Appointment Slips.
4. **Secure Admin Control Center (`/admin`):**
   - Protected dashboard with Firebase Authentication and admin role authorization.
   - Doctor management (Create, Read, Update, Delete with Cloudinary image upload).
   - Service management (Live Firestore sync with baseline fallback).
   - Gallery media management (Upload, Edit, Delete).
   - Availability and slot generation (Batch 6-slot generation and custom slot configuration).
   - Appointment triage and status tracking (Upcoming, Completed, Cancelled).
   - Hospital contact and timing configuration.

---

## ⚙️ Environment Configuration

The application requires environment variables for Firebase and Cloudinary integrations. 

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Populate `.env` with your deployment keys:

```env
# Firebase Web App Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Cloudinary Unsigned Upload Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

> **Note:** Never commit `.env` or sensitive Firebase Service Account private keys to source control.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm / yarn / pnpm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
The application will run locally at `http://localhost:5173/`.

### Production Build
```bash
npm run build
```

---

## 🔒 Security & Privacy

- All sensitive environment files (`.env`, `.env.local`, `*.json` credentials) are excluded via `.gitignore`.
- Firestore Security Rules enforce authentication for administrative writes while allowing public read access for hospital metadata and public slot booking.
- Patient health records and appointment details are stored securely.

---

## 📄 License
© 2026 Deccan Care Maternity & General Hospital. All rights reserved.
