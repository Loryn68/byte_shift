import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and role management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("staff"), // admin, doctor, nurse, staff
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Patients table - central patient information
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(), // CMH-YYYYMMLLL### format
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  nationalId: text("national_id"),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender").notNull(), // male, female, other
  bloodType: text("blood_type"),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  emergencyContactName: text("emergency_contact_name").notNull(),
  emergencyContactPhone: text("emergency_contact_phone").notNull(),
  emergencyContactRelationship: text("emergency_contact_relationship"),
  occupation: text("occupation"),
  insuranceProvider: text("insurance_provider"),
  policyNumber: text("policy_number"),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  isActive: boolean("is_active").notNull().default(true),
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  appointmentId: text("appointment_id").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  department: text("department").notNull(),
  type: text("type").notNull(), // consultation, follow-up, emergency
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, no-show
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Laboratory tests table
export const labTests = pgTable("lab_tests", {
  id: serial("id").primaryKey(),
  testId: text("test_id").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  testName: text("test_name").notNull(),
  testType: text("test_type").notNull(), // blood, urine, imaging, etc.
  orderedBy: integer("ordered_by").notNull().references(() => users.id),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  sampleCollectedDate: timestamp("sample_collected_date"),
  resultDate: timestamp("result_date"),
  results: text("results"),
  normalRange: text("normal_range"),
  status: text("status").notNull().default("ordered"), // ordered, collected, processing, completed, cancelled
  urgency: text("urgency").notNull().default("routine"), // routine, urgent, stat
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Pharmacy/Medications table
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  medicationId: text("medication_id").notNull().unique(),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  dosageForm: text("dosage_form").notNull(), // tablet, capsule, liquid, injection
  strength: text("strength").notNull(),
  manufacturer: text("manufacturer"),
  category: text("category").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  reorderLevel: integer("reorder_level").notNull().default(10),
  expiryDate: date("expiry_date"),
  batchNumber: text("batch_number"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  prescriptionId: text("prescription_id").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  prescribedBy: integer("prescribed_by").notNull().references(() => users.id),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  duration: text("duration").notNull(),
  quantity: integer("quantity").notNull(),
  instructions: text("instructions"),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  dateIssued: timestamp("date_issued").notNull().defaultNow(),
  dateDispensed: timestamp("date_dispensed"),
  dispensedBy: integer("dispensed_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Billing table
export const billing = pgTable("billing", {
  id: serial("id").primaryKey(),
  billId: text("bill_id").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  serviceType: text("service_type").notNull(), // consultation, lab, pharmacy, procedure
  serviceDescription: text("service_description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, partial, cancelled
  paymentMethod: text("payment_method"), // cash, card, insurance, bank_transfer
  paymentDate: timestamp("payment_date"),
  insuranceClaimed: boolean("insurance_claimed").default(false),
  insuranceAmount: decimal("insurance_amount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  patientId: true,
  registrationDate: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  appointmentId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLabTestSchema = createInsertSchema(labTests).omit({
  id: true,
  testId: true,
  orderDate: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  medicationId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  prescriptionId: true,
  dateIssued: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillingSchema = createInsertSchema(billing).omit({
  id: true,
  billId: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type LabTest = typeof labTests.$inferSelect;
export type InsertLabTest = z.infer<typeof insertLabTestSchema>;

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type Billing = typeof billing.$inferSelect;
export type InsertBilling = z.infer<typeof insertBillingSchema>;
