import { useState, useEffect } from 'react';

export interface OrganizationTerms {
  orgType: string;
  // Entity labels
  providerSingular: string;      // "Doctor", "Instructor", "Stylist", "Provider"
  providerPlural: string;        // "Doctors", "Instructors", "Stylists", "Providers"
  customerSingular: string;      // "Patient", "Student", "Client", "Client"
  customerPlural: string;        // "Patients", "Students", "Clients", "Clients"
  serviceSingular: string;       // "Medical Service", "Course / Class", "Treatment", "Service"
  servicePlural: string;         // "Medical Services", "Courses & Classes", "Treatments & Services", "Services"
  appointmentSingular: string;   // "Appointment", "Session / Class", "Appointment", "Booking"
  appointmentPlural: string;     // "Appointments", "Sessions & Classes", "Appointments", "Bookings"
  
  // Locations and Facility
  facilityLabel: string;         // "Clinic", "College", "Salon", "Office"
  inFacility: string;            // "In Clinic", "On Campus", "In Salon", "On-Site"
  waiting: string;               // "Waiting Patients", "Waiting Students", "Waiting Clients", "Waiting Clients"
  inConsult: string;             // "In Consult", "In Session", "In Service", "In Meeting"
  
  // Professional / Qualification
  licenseLabel: string;          // "Medical License #", "Faculty ID / Staff #", "License / Cert #", "Professional ID"
  specialtyLabel: string;        // "Specialty", "Department / Subject", "Specialty", "Expertise"
  registrationLabel: string;     // "Medical Board Registration No.", "Institutional Accreditation / Reg No.", etc.
  
  // CRM & Headers
  crmTitle: string;              // "Patient Directory & CRM", "Student Directory & CRM", etc.
  
  // Appointment Details & Session Specifics
  reasonForVisitLabel: string;   // "Reason for Visit", "Purpose of Session / Class", "Service Preference / Notes"
  summaryLabel: string;          // "Treatment Summary & Notes", "Session / Class Summary & Notes", etc.
  feedbackTitle: string;         // "Patient Feedback", "Student Feedback", "Client Feedback"

  // Sidebar Navigation (Labels & Icons)
  providersNavLabel: string;
  providersNavIcon: string;
  customersNavLabel: string;
  customersNavIcon: string;
  servicesNavLabel: string;
  servicesNavIcon: string;
  appointmentsNavLabel: string;
  appointmentsNavIcon: string;
}

/**
 * Normalizes any organization type string into a standard key:
 * 'Clinic' | 'College' | 'Saloon' | 'Other Organization'
 */
export function normalizeOrgType(type?: string | null): 'Clinic' | 'College' | 'Saloon' | 'Other' {
  if (!type) return 'Clinic';
  const clean = type.trim().toLowerCase();
  if (clean.includes('college') || clean.includes('university') || clean.includes('school') || clean.includes('education') || clean.includes('academic')) {
    return 'College';
  }
  if (clean.includes('saloon') || clean.includes('salon') || clean.includes('spa') || clean.includes('beauty') || clean.includes('barber')) {
    return 'Saloon';
  }
  if (clean.includes('clinic') || clean.includes('hospital') || clean.includes('medical') || clean.includes('health') || clean.includes('dental')) {
    return 'Clinic';
  }
  return 'Other';
}

/**
 * Returns comprehensive terminology tokens for a given organization type.
 */
export function getOrganizationTerms(rawType?: string | null): OrganizationTerms {
  const norm = normalizeOrgType(rawType || (typeof window !== 'undefined' ? localStorage.getItem('organizationType') : null));
  const orgTypeDisplay = rawType || norm;

  switch (norm) {
    case 'College':
      return {
        orgType: orgTypeDisplay,
        providerSingular: 'Instructor',
        providerPlural: 'Instructors & Faculty',
        customerSingular: 'Student',
        customerPlural: 'Students',
        serviceSingular: 'Course / Class',
        servicePlural: 'Courses & Classes',
        appointmentSingular: 'Session / Class',
        appointmentPlural: 'Sessions & Classes',
        facilityLabel: 'College',
        inFacility: 'On Campus',
        waiting: 'Waiting Students',
        inConsult: 'In Session',
        licenseLabel: 'Faculty ID / Staff #',
        specialtyLabel: 'Department / Subject',
        registrationLabel: 'Institutional Accreditation / Reg No.',
        crmTitle: 'Student Directory & Academic Records',
        reasonForVisitLabel: 'Purpose of Session / Meeting',
        summaryLabel: 'Session / Class Summary & Notes',
        feedbackTitle: 'Student Feedback',
        providersNavLabel: 'Instructors',
        providersNavIcon: 'school',
        customersNavLabel: 'Students',
        customersNavIcon: 'school',
        servicesNavLabel: 'Courses & Classes',
        servicesNavIcon: 'menu_book',
        appointmentsNavLabel: 'All Sessions',
        appointmentsNavIcon: 'calendar_month'
      };

    case 'Saloon':
      return {
        orgType: orgTypeDisplay,
        providerSingular: 'Stylist',
        providerPlural: 'Stylists & Specialists',
        customerSingular: 'Client',
        customerPlural: 'Clients',
        serviceSingular: 'Treatment & Service',
        servicePlural: 'Treatments & Services',
        appointmentSingular: 'Appointment',
        appointmentPlural: 'Appointments',
        facilityLabel: 'Salon',
        inFacility: 'In Salon',
        waiting: 'Waiting Clients',
        inConsult: 'In Service',
        licenseLabel: 'License / Cert #',
        specialtyLabel: 'Styling Specialty',
        registrationLabel: 'Business Registration / License No.',
        crmTitle: 'Client Directory & Preferences',
        reasonForVisitLabel: 'Requested Styling / Service Notes',
        summaryLabel: 'Styling & Service Notes',
        feedbackTitle: 'Client Feedback',
        providersNavLabel: 'Stylists',
        providersNavIcon: 'content_cut',
        customersNavLabel: 'Clients',
        customersNavIcon: 'face',
        servicesNavLabel: 'Treatments & Services',
        servicesNavIcon: 'spa',
        appointmentsNavLabel: 'All Appointments',
        appointmentsNavIcon: 'calendar_month'
      };

    case 'Other':
      return {
        orgType: orgTypeDisplay,
        providerSingular: 'Consultant',
        providerPlural: 'Staff & Consultants',
        customerSingular: 'Client',
        customerPlural: 'Clients',
        serviceSingular: 'Service',
        servicePlural: 'Services',
        appointmentSingular: 'Booking',
        appointmentPlural: 'Bookings & Meetings',
        facilityLabel: 'Office',
        inFacility: 'On-Site',
        waiting: 'Waiting Clients',
        inConsult: 'In Meeting',
        licenseLabel: 'Professional ID',
        specialtyLabel: 'Domain Expertise',
        registrationLabel: 'Official Registration / Tax No.',
        crmTitle: 'Client Directory & CRM',
        reasonForVisitLabel: 'Purpose of Meeting / Notes',
        summaryLabel: 'Meeting & Service Summary',
        feedbackTitle: 'Client Feedback',
        providersNavLabel: 'Providers',
        providersNavIcon: 'badge',
        customersNavLabel: 'Clients',
        customersNavIcon: 'groups',
        servicesNavLabel: 'Services Manager',
        servicesNavIcon: 'business_center',
        appointmentsNavLabel: 'All Bookings',
        appointmentsNavIcon: 'calendar_month'
      };

    case 'Clinic':
    default:
      return {
        orgType: orgTypeDisplay,
        providerSingular: 'Doctor',
        providerPlural: 'Doctors & Providers',
        customerSingular: 'Patient',
        customerPlural: 'Patients',
        serviceSingular: 'Medical Service',
        servicePlural: 'Medical Services',
        appointmentSingular: 'Appointment',
        appointmentPlural: 'Appointments',
        facilityLabel: 'Clinic',
        inFacility: 'In Clinic',
        waiting: 'Waiting Patients',
        inConsult: 'In Consult',
        licenseLabel: 'Medical License #',
        specialtyLabel: 'Medical Specialty',
        registrationLabel: 'Medical Board Registration No.',
        crmTitle: 'Patient Directory & Medical Records',
        reasonForVisitLabel: 'Reason for Visit',
        summaryLabel: 'Treatment Summary & Notes',
        feedbackTitle: 'Patient Feedback',
        providersNavLabel: 'Providers',
        providersNavIcon: 'medical_services',
        customersNavLabel: 'Patients',
        customersNavIcon: 'group',
        servicesNavLabel: 'Services Manager',
        servicesNavIcon: 'medical_services',
        appointmentsNavLabel: 'All Appointments',
        appointmentsNavIcon: 'calendar_month'
      };
  }
}

/**
 * Maps raw roles like 'patient', 'user', 'service_provider' to industry-appropriate terms.
 * e.g., for College: 'patient' -> 'student', 'service_provider' -> 'instructor'.
 */
export function formatRole(role: string | undefined | null, terms: OrganizationTerms): string {
  if (!role) return terms.customerSingular.toLowerCase();
  const r = role.toLowerCase().trim();
  if (r === 'patient' || r === 'student' || r === 'client' || r === 'user' || r === 'customer') {
    return terms.customerSingular.toLowerCase();
  }
  if (r === 'service_provider' || r === 'provider' || r === 'doctor' || r === 'instructor' || r === 'stylist') {
    return terms.providerSingular.toLowerCase();
  }
  return role;
}

/**
 * React hook that provides the active organization's terminology and updates dynamically
 * whenever the organization type is changed or updated in localStorage.
 */
export function useOrganizationTerms(): OrganizationTerms {
  const [terms, setTerms] = useState<OrganizationTerms>(() => 
    getOrganizationTerms(typeof window !== 'undefined' ? localStorage.getItem('organizationType') : null)
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const currentType = localStorage.getItem('organizationType');
      setTerms(getOrganizationTerms(currentType));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('organization-type-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('organization-type-changed', handleStorageChange);
    };
  }, []);

  return terms;
}

/**
 * Utility to broadcast an organization type update to all active components
 */
export function setAndBroadcastOrgType(type: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('organizationType', type);
    window.dispatchEvent(new Event('organization-type-changed'));
  }
}

export interface DepartmentPreset {
  name: string;
  code: string;
  description: string;
}

export interface DepartmentTerms {
  entityTitle: string;
  createModalTitle: string;
  editModalTitle: string;
  badgeLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  codeLabel: string;
  codePlaceholder: string;
  headLabel: string;
  headPlaceholder: string;
  descLabel: string;
  descPlaceholder: string;
  totalCountLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  createButtonLabel: string;
  saveButtonLabel: string;
  icon: string;
  presets: DepartmentPreset[];
}

export function getDepartmentTerms(rawType?: string | null): DepartmentTerms {
  const norm = normalizeOrgType(rawType || (typeof window !== 'undefined' ? localStorage.getItem('organizationType') : null));

  switch (norm) {
    case 'College':
      return {
        entityTitle: 'Academic Departments & Faculties',
        createModalTitle: 'Create Academic Department / Faculty',
        editModalTitle: 'Edit Academic Department / Faculty',
        badgeLabel: 'Academic Department',
        nameLabel: 'Department / Faculty Name',
        namePlaceholder: 'e.g. Computer Science & Engineering, School of Business',
        codeLabel: 'Department Code / Acronym',
        codePlaceholder: 'e.g. CSE, BBA, EEE',
        headLabel: 'Head of Department / Dean / Program Lead',
        headPlaceholder: 'Assigned Instructors in this Department',
        descLabel: 'Curriculum Scope & Department Overview',
        descPlaceholder: 'Brief overview of academic programs, laboratories, faculty allocation, and student courses under this department...',
        totalCountLabel: 'Total Academic Departments',
        emptyTitle: 'No Academic Departments Defined',
        emptyDescription: "You haven't defined any academic departments for your college yet. Create one to begin organizing instructors and courses.",
        createButtonLabel: 'New Academic Department',
        saveButtonLabel: 'Save Academic Department',
        icon: 'school',
        presets: [
          { name: 'Computer Science & Engineering', code: 'CSE', description: 'Curriculum oversight for software engineering, computing laboratories, algorithms, and technical faculty allocation.' },
          { name: 'School of Business Administration', code: 'BBA', description: 'Management studies, corporate finance, marketing strategy courses, and administrative academic tracking.' },
          { name: 'Electrical & Electronics Engineering', code: 'EEE', description: 'Hardware laboratories, circuit design, power electronics, robotics, and specialized engineering instructors.' },
          { name: 'Civil & Structural Engineering', code: 'CIVIL', description: 'Structural mechanics, surveying workshops, urban planning lectures, and laboratory practical sessions.' },
          { name: 'Humanities & Social Sciences', code: 'HSS', description: 'Foundational communication, sociology, psychology, language electives, and interdisciplinary courses.' },
          { name: 'Biotechnology & Life Sciences', code: 'BIO', description: 'Microbiology research, biochemistry practicals, genetic engineering labs, and life science faculty.' }
        ]
      };

    case 'Saloon':
      return {
        entityTitle: 'Service Sections & Styling Departments',
        createModalTitle: 'Create Service Section / Styling Department',
        editModalTitle: 'Edit Service Section / Styling Department',
        badgeLabel: 'Styling Section',
        nameLabel: 'Department / Section Name',
        namePlaceholder: 'e.g. Hair Care & Styling, Nail & Lash Lounge',
        codeLabel: 'Section Code / Tag',
        codePlaceholder: 'e.g. HAIR, NAIL, SPA',
        headLabel: 'Lead Stylist / Section Supervisor',
        headPlaceholder: 'Assigned Stylists in this Section',
        descLabel: 'Service Scope & Section Amenities',
        descPlaceholder: 'Overview of styling stations, equipment, treatment chairs, products used, and service specialties...',
        totalCountLabel: 'Total Service Sections',
        emptyTitle: 'No Service Sections Defined',
        emptyDescription: "You haven't defined any styling sections or departments for your salon yet. Create one to assign stylists and treatments.",
        createButtonLabel: 'New Service Section',
        saveButtonLabel: 'Save Section',
        icon: 'content_cut',
        presets: [
          { name: 'Hair Care & Creative Styling', code: 'HAIR', description: 'Precision haircuts, balayage, creative coloring, keratin smoothing treatments, and personalized styling consultations.' },
          { name: 'Nail Bar & Lash Artistry', code: 'NAIL', description: 'Gel manicures, spa pedicures, acrylic extensions, custom nail art, and eyelash extensions.' },
          { name: 'Facial & Advanced Skincare Studio', code: 'SKIN', description: 'Hydra-facials, chemical peels, anti-aging therapies, and personalized skincare rejuvenation sessions.' },
          { name: 'Therapeutic Body Massage & Spa', code: 'SPA', description: 'Swedish massage, deep tissue therapy, aromatherapy sessions, and holistic body relaxation treatments.' },
          { name: 'Bridal & Event Glamour Suite', code: 'BRIDAL', description: 'High-definition bridal makeup, hair setting, pre-wedding grooming, and special occasion styling packages.' }
        ]
      };

    case 'Clinic':
      return {
        entityTitle: 'Medical Departments & Specializations',
        createModalTitle: 'Create Medical Department',
        editModalTitle: 'Edit Medical Department',
        badgeLabel: 'Clinical Department',
        nameLabel: 'Department / Specialty Name',
        namePlaceholder: 'e.g. Cardiology, Pediatrics, Dermatology, Dental',
        codeLabel: 'Department Code / Acronym',
        codePlaceholder: 'e.g. CARD, PED, DERM',
        headLabel: 'Head of Department / Chief Medical Officer',
        headPlaceholder: 'Assigned Doctors / Specialists in this Department',
        descLabel: 'Clinical Scope & Treatments Overview',
        descPlaceholder: 'Description of diagnostic equipment, inpatient/outpatient consultation scope, and medical treatments offered...',
        totalCountLabel: 'Total Medical Departments',
        emptyTitle: 'No Medical Departments Defined',
        emptyDescription: "You haven't defined any clinical departments for your clinic yet. Create one to assign doctors and treatments.",
        createButtonLabel: 'New Medical Department',
        saveButtonLabel: 'Save Department',
        icon: 'local_hospital',
        presets: [
          { name: 'Cardiology & Heart Care', code: 'CARD', description: 'Diagnostic ECG, echocardiography, hypertension management, outpatient cardiac consultations, and preventative heart care.' },
          { name: 'Pediatrics & Child Health', code: 'PED', description: 'Comprehensive healthcare, immunizations, developmental screenings, and medical care for infants and children.' },
          { name: 'Dermatology & Skin Aesthetics', code: 'DERM', description: 'Skin disease diagnosis, dermatological procedures, aesthetic dermatology, and allergy screenings.' },
          { name: 'Orthopedics & Joint Care', code: 'ORTHO', description: 'Musculoskeletal treatment, fracture management, joint rehabilitation, and sports medicine consultations.' },
          { name: 'Dental & Maxillofacial Care', code: 'DENT', description: 'Routine dental checkups, orthodontics, oral hygiene, root canals, and cosmetic dental treatments.' },
          { name: 'General & Internal Medicine', code: 'GEN', description: 'Primary consultations, chronic disease management, preventive health checkups, and diagnostic screenings.' }
        ]
      };

    default:
      return {
        entityTitle: 'Departments & Operational Divisions',
        createModalTitle: 'Create Department / Division',
        editModalTitle: 'Edit Department / Division',
        badgeLabel: 'Operational Department',
        nameLabel: 'Department / Division Name',
        namePlaceholder: 'e.g. Legal Advisory, Financial Consulting, Client Operations',
        codeLabel: 'Division Code / Acronym',
        codePlaceholder: 'e.g. ADV, OPS, FIN',
        headLabel: 'Division Head / Practice Lead',
        headPlaceholder: 'Assigned Team Leads in this Division',
        descLabel: 'Division Scope & Responsibilities',
        descPlaceholder: 'Description of services delivered, client onboarding process, and team responsibilities...',
        totalCountLabel: 'Total Operational Departments',
        emptyTitle: 'No Departments Defined',
        emptyDescription: "You haven't defined any operational departments for your organization yet. Create one to organize providers and services.",
        createButtonLabel: 'New Department',
        saveButtonLabel: 'Save Department',
        icon: 'domain',
        presets: [
          { name: 'Consulting & Strategic Advisory', code: 'ADV', description: 'Client strategy sessions, feasibility studies, management consultations, and corporate advisory.' },
          { name: 'Client Operations & Account Support', code: 'OPS', description: 'Client onboarding, SLA tracking, account maintenance, and cross-functional project management.' },
          { name: 'Finance, Tax & Audit Division', code: 'FIN', description: 'Tax planning, corporate financial reviews, ledger auditing, and regulatory compliance consulting.' },
          { name: 'Digital Solutions & Tech Architecture', code: 'TECH', description: 'Digital transformation architecture, software consulting, and technical implementation projects.' },
          { name: 'Professional Training & Workshops', code: 'TRAIN', description: 'Professional development modules, corporate coaching, leadership workshops, and certified seminars.' }
        ]
      };
  }
}

export function useDepartmentTerms(): DepartmentTerms {
  const [terms, setTerms] = useState<DepartmentTerms>(() => 
    getDepartmentTerms(typeof window !== 'undefined' ? localStorage.getItem('organizationType') : null)
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const currentType = localStorage.getItem('organizationType');
      setTerms(getDepartmentTerms(currentType));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('organization-type-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('organization-type-changed', handleStorageChange);
    };
  }, []);

  return terms;
}
