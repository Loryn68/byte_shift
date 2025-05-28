import { 
  users, patients, appointments, labTests, medications, prescriptions, billing,
  type User, type InsertUser, type Patient, type InsertPatient,
  type Appointment, type InsertAppointment, type LabTest, type InsertLabTest,
  type Medication, type InsertMedication, type Prescription, type InsertPrescription,
  type Billing, type InsertBilling
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patient management
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  getOutpatients(): Promise<Patient[]>;
  getInpatients(): Promise<Patient[]>;
  admitPatient(patientId: number, admissionData: { ward: string; bed: string; department: string }): Promise<Patient | undefined>;
  searchPatients(query: string): Promise<Patient[]>;
  
  // Appointment management
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  
  // Lab test management
  getLabTest(id: number): Promise<LabTest | undefined>;
  createLabTest(labTest: InsertLabTest): Promise<LabTest>;
  updateLabTest(id: number, labTest: Partial<InsertLabTest>): Promise<LabTest | undefined>;
  getLabTestsByPatient(patientId: number): Promise<LabTest[]>;
  getAllLabTests(): Promise<LabTest[]>;
  
  // Medication management
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  getAllMedications(): Promise<Medication[]>;
  searchMedications(query: string): Promise<Medication[]>;
  
  // Prescription management
  getPrescription(id: number): Promise<Prescription | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined>;
  getPrescriptionsByPatient(patientId: number): Promise<Prescription[]>;
  getAllPrescriptions(): Promise<Prescription[]>;
  
  // Billing management
  getBilling(id: number): Promise<Billing | undefined>;
  createBilling(billing: InsertBilling): Promise<Billing>;
  updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined>;
  getBillingByPatient(patientId: number): Promise<Billing[]>;
  getAllBilling(): Promise<Billing[]>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalPatients: number;
    activeAppointments: number;
    pendingLabTests: number;
    todayRevenue: number;
    bedOccupancy: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private patients: Map<number, Patient> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private labTests: Map<number, LabTest> = new Map();
  private medications: Map<number, Medication> = new Map();
  private prescriptions: Map<number, Prescription> = new Map();
  private billing: Map<number, Billing> = new Map();
  
  private currentUserId = 1;
  private currentPatientId = 1;
  private currentAppointmentId = 1;
  private currentLabTestId = 1;
  private currentMedicationId = 1;
  private currentPrescriptionId = 1;
  private currentBillingId = 1;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Create admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "$2b$10$example", // In production, hash the password
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@childhaven.com",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);
  }

  private generatePatientId(firstName: string, middleName: string, lastName: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Get first letters of names
    const firstInitial = firstName.charAt(0).toUpperCase();
    const middleInitial = middleName ? middleName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    // Count patients registered this month to get sequential number
    const currentMonth = `${year}${month}`;
    const patientsThisMonth = Array.from(this.patients.values()).filter(patient => {
      const patientDate = new Date(patient.registrationDate);
      const patientMonth = `${patientDate.getFullYear()}${String(patientDate.getMonth() + 1).padStart(2, '0')}`;
      return patientMonth === currentMonth;
    });
    
    const monthlySequence = String(patientsThisMonth.length + 1).padStart(3, '0');
    
    return `CMH-${year}${month}${firstInitial}${middleInitial}${lastInitial}${monthlySequence}`;
  }

  private generateAppointmentId(): string {
    const year = new Date().getFullYear();
    const id = String(this.currentAppointmentId).padStart(4, '0');
    return `APT-${year}-${id}`;
  }

  private generateTestId(): string {
    const year = new Date().getFullYear();
    const id = String(this.currentLabTestId).padStart(4, '0');
    return `LAB-${year}-${id}`;
  }

  private generateMedicationId(): string {
    const id = String(this.currentMedicationId).padStart(4, '0');
    return `MED-${id}`;
  }

  private generatePrescriptionId(): string {
    const year = new Date().getFullYear();
    const id = String(this.currentPrescriptionId).padStart(4, '0');
    return `RX-${year}-${id}`;
  }

  private generateBillId(): string {
    const year = new Date().getFullYear();
    const id = String(this.currentBillingId).padStart(4, '0');
    return `BILL-${year}-${id}`;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Patient methods
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(patient => patient.patientId === patientId);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    console.log("Creating patient with data:", insertPatient);
    
    const patientId = `CMH-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${insertPatient.firstName.charAt(0).toUpperCase()}${insertPatient.lastName.charAt(0).toUpperCase()}${String(this.currentPatientId).padStart(3, '0')}`;
    
    const patient: Patient = {
      id: this.currentPatientId,
      patientId: patientId,
      firstName: insertPatient.firstName,
      middleName: insertPatient.middleName || null,
      lastName: insertPatient.lastName,
      nationalId: insertPatient.nationalId || null,
      dateOfBirth: insertPatient.dateOfBirth,
      gender: insertPatient.gender,
      phone: insertPatient.phone,
      email: insertPatient.email || null,
      address: insertPatient.address,
      emergencyContactName: insertPatient.emergencyContactName,
      emergencyContactPhone: insertPatient.emergencyContactPhone,
      emergencyContactRelationship: insertPatient.emergencyContactRelationship || null,
      occupation: insertPatient.occupation || null,
      bloodType: insertPatient.bloodType || null,
      insuranceProvider: insertPatient.insuranceProvider || null,
      policyNumber: insertPatient.policyNumber || null,
      medicalHistory: insertPatient.medicalHistory || null,
      allergies: insertPatient.allergies || null,
      patientType: insertPatient.patientType,
      wardAssignment: insertPatient.wardAssignment || null,
      bedNumber: insertPatient.bedNumber || null,
      admissionDate: insertPatient.admissionDate || null,
      isActive: insertPatient.isActive !== undefined ? insertPatient.isActive : true,
      registrationDate: new Date(),
      updatedAt: new Date(),
    };
    
    this.patients.set(this.currentPatientId++, patient);
    console.log("Patient created successfully:", patient);
    return patient;
  }

  async updatePatient(id: number, updateData: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient: Patient = {
      ...patient,
      ...updateData,
      updatedAt: new Date(),
    };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values()).filter(patient => patient.isActive);
  }

  async getOutpatients(): Promise<Patient[]> {
    const patients = Array.from(this.patients.values());
    return patients.filter(patient => patient.isActive && patient.patientType === 'outpatient');
  }

  async getInpatients(): Promise<Patient[]> {
    const patients = Array.from(this.patients.values());
    return patients.filter(patient => patient.isActive && patient.patientType === 'inpatient');
  }

  async admitPatient(patientId: number, admissionData: { ward: string; bed: string; department: string }): Promise<Patient | undefined> {
    const patient = this.patients.get(patientId);
    if (!patient) return undefined;
    
    const updatedPatient: Patient = {
      ...patient,
      patientType: 'inpatient',
      wardAssignment: admissionData.ward,
      bedNumber: admissionData.bed,
      admissionDate: new Date(),
      updatedAt: new Date(),
    };
    this.patients.set(patientId, updatedPatient);
    return updatedPatient;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.patients.values()).filter(patient => 
      patient.isActive && (
        patient.firstName.toLowerCase().includes(lowerQuery) ||
        patient.lastName.toLowerCase().includes(lowerQuery) ||
        patient.patientId.toLowerCase().includes(lowerQuery) ||
        patient.phone.includes(query)
      )
    );
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const appointment: Appointment = {
      ...insertAppointment,
      id: this.currentAppointmentId,
      appointmentId: this.generateAppointmentId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.appointments.set(this.currentAppointmentId++, appointment);
    return appointment;
  }

  async updateAppointment(id: number, updateData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment: Appointment = {
      ...appointment,
      ...updateData,
      updatedAt: new Date(),
    };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(apt => apt.patientId === patientId);
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const targetDate = new Date(date);
    return Array.from(this.appointments.values()).filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.toDateString() === targetDate.toDateString();
    });
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  // Lab test methods
  async getLabTest(id: number): Promise<LabTest | undefined> {
    return this.labTests.get(id);
  }

  async createLabTest(insertLabTest: InsertLabTest): Promise<LabTest> {
    const labTest: LabTest = {
      ...insertLabTest,
      id: this.currentLabTestId,
      testId: this.generateTestId(),
      orderDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.labTests.set(this.currentLabTestId++, labTest);
    return labTest;
  }

  async updateLabTest(id: number, updateData: Partial<InsertLabTest>): Promise<LabTest | undefined> {
    const labTest = this.labTests.get(id);
    if (!labTest) return undefined;
    
    const updatedLabTest: LabTest = {
      ...labTest,
      ...updateData,
      updatedAt: new Date(),
    };
    this.labTests.set(id, updatedLabTest);
    return updatedLabTest;
  }

  async getLabTestsByPatient(patientId: number): Promise<LabTest[]> {
    return Array.from(this.labTests.values()).filter(test => test.patientId === patientId);
  }

  async getAllLabTests(): Promise<LabTest[]> {
    return Array.from(this.labTests.values());
  }

  // Medication methods
  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const medication: Medication = {
      ...insertMedication,
      id: this.currentMedicationId,
      medicationId: this.generateMedicationId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.medications.set(this.currentMedicationId++, medication);
    return medication;
  }

  async updateMedication(id: number, updateData: Partial<InsertMedication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;
    
    const updatedMedication: Medication = {
      ...medication,
      ...updateData,
      updatedAt: new Date(),
    };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  async getAllMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(med => med.isActive);
  }

  async searchMedications(query: string): Promise<Medication[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.medications.values()).filter(med => 
      med.isActive && (
        med.name.toLowerCase().includes(lowerQuery) ||
        med.genericName?.toLowerCase().includes(lowerQuery) ||
        med.category.toLowerCase().includes(lowerQuery)
      )
    );
  }

  // Prescription methods
  async getPrescription(id: number): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const prescription: Prescription = {
      ...insertPrescription,
      id: this.currentPrescriptionId,
      prescriptionId: this.generatePrescriptionId(),
      dateIssued: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.prescriptions.set(this.currentPrescriptionId++, prescription);
    return prescription;
  }

  async updatePrescription(id: number, updateData: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return undefined;
    
    const updatedPrescription: Prescription = {
      ...prescription,
      ...updateData,
      updatedAt: new Date(),
    };
    this.prescriptions.set(id, updatedPrescription);
    return updatedPrescription;
  }

  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(rx => rx.patientId === patientId);
  }

  async getAllPrescriptions(): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values());
  }

  // Billing methods
  async getBilling(id: number): Promise<Billing | undefined> {
    return this.billing.get(id);
  }

  async createBilling(insertBilling: InsertBilling): Promise<Billing> {
    const billing: Billing = {
      ...insertBilling,
      id: this.currentBillingId,
      billId: this.generateBillId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.billing.set(this.currentBillingId++, billing);
    return billing;
  }

  async updateBilling(id: number, updateData: Partial<InsertBilling>): Promise<Billing | undefined> {
    const billing = this.billing.get(id);
    if (!billing) return undefined;
    
    const updatedBilling: Billing = {
      ...billing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.billing.set(id, updatedBilling);
    return updatedBilling;
  }

  async getBillingByPatient(patientId: number): Promise<Billing[]> {
    return Array.from(this.billing.values()).filter(bill => bill.patientId === patientId);
  }

  async getAllBilling(): Promise<Billing[]> {
    return Array.from(this.billing.values());
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    totalPatients: number;
    activeAppointments: number;
    pendingLabTests: number;
    todayRevenue: number;
    bedOccupancy: number;
  }> {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const activeAppointments = Array.from(this.appointments.values()).filter(apt => 
      apt.status === 'scheduled' && new Date(apt.appointmentDate) >= todayStart
    ).length;
    
    const pendingLabTests = Array.from(this.labTests.values()).filter(test => 
      test.status === 'ordered' || test.status === 'collected' || test.status === 'processing'
    ).length;
    
    const todayBilling = Array.from(this.billing.values()).filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate >= todayStart && bill.paymentStatus === 'paid';
    });
    
    const todayRevenue = todayBilling.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    
    return {
      totalPatients: this.patients.size,
      activeAppointments,
      pendingLabTests,
      todayRevenue,
      bedOccupancy: 89, // Mock bed occupancy percentage
    };
  }
}

import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Keep all other methods from MemStorage for now
  async getPatient(id: number): Promise<Patient | undefined> {
    return undefined;
  }

  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    return undefined;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    throw new Error("Not implemented");
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    return undefined;
  }

  async getAllPatients(): Promise<Patient[]> {
    return [];
  }

  async getOutpatients(): Promise<Patient[]> {
    return [];
  }

  async getInpatients(): Promise<Patient[]> {
    return [];
  }

  async admitPatient(patientId: number, admissionData: { ward: string; bed: string; department: string }): Promise<Patient | undefined> {
    return undefined;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return [];
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return undefined;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    throw new Error("Not implemented");
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    return undefined;
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return [];
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return [];
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return [];
  }

  async getLabTest(id: number): Promise<LabTest | undefined> {
    return undefined;
  }

  async createLabTest(labTest: InsertLabTest): Promise<LabTest> {
    throw new Error("Not implemented");
  }

  async updateLabTest(id: number, labTest: Partial<InsertLabTest>): Promise<LabTest | undefined> {
    return undefined;
  }

  async getLabTestsByPatient(patientId: number): Promise<LabTest[]> {
    return [];
  }

  async getAllLabTests(): Promise<LabTest[]> {
    return [];
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    return undefined;
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    throw new Error("Not implemented");
  }

  async updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined> {
    return undefined;
  }

  async getAllMedications(): Promise<Medication[]> {
    return [];
  }

  async searchMedications(query: string): Promise<Medication[]> {
    return [];
  }

  async getPrescription(id: number): Promise<Prescription | undefined> {
    return undefined;
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    throw new Error("Not implemented");
  }

  async updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    return undefined;
  }

  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return [];
  }

  async getAllPrescriptions(): Promise<Prescription[]> {
    return [];
  }

  async getBilling(id: number): Promise<Billing | undefined> {
    return undefined;
  }

  async createBilling(billing: InsertBilling): Promise<Billing> {
    throw new Error("Not implemented");
  }

  async updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined> {
    return undefined;
  }

  async getBillingByPatient(patientId: number): Promise<Billing[]> {
    return [];
  }

  async getAllBilling(): Promise<Billing[]> {
    return [];
  }

  async getDashboardStats(): Promise<{
    totalPatients: number;
    activeAppointments: number;
    pendingLabTests: number;
    todayRevenue: number;
    bedOccupancy: number;
  }> {
    return {
      totalPatients: 0,
      activeAppointments: 0,
      pendingLabTests: 0,
      todayRevenue: 0,
      bedOccupancy: 0,
    };
  }
}

export const storage = new MemStorage();
