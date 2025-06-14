import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertAppointmentSchema, insertLabTestSchema, insertMedicationSchema, insertPrescriptionSchema, insertBillingSchema, insertTherapySessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // For demo purposes, create a simple admin user check
      if (username === "admin" && password === "admin123") {
        const adminUser = {
          id: 1,
          username: "admin",
          firstName: "System",
          lastName: "Administrator",
          email: "admin@childmentalhaven.org",
          role: "admin"
        };
        return res.json({ user: adminUser });
      }

      return res.status(401).json({ message: "Invalid credentials. Contact your administrator for access." });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In production, verify password hash
      if (password !== "admin123") {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Patient routes
  app.get("/api/patients", async (req, res) => {
    try {
      const { search } = req.query;
      let patients;
      
      if (search) {
        patients = await storage.searchPatients(search as string);
      } else {
        patients = await storage.getAllPatients();
      }
      
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.get("/api/patients/outpatients", async (req, res) => {
    try {
      const patients = await storage.getOutpatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch outpatients" });
    }
  });

  app.get("/api/patients/inpatients", async (req, res) => {
    try {
      const patients = await storage.getInpatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inpatients" });
    }
  });

  app.post("/api/patients/:id/admit", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const admissionData = req.body;
      
      const patient = await storage.admitPatient(patientId, admissionData);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to admit patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      console.log("Received patient data:", req.body);
      
      // Remove fields that shouldn't be in the validation
      const { registerFor, patientCategory, paymentOption, referralSource, ...patientData } = req.body;
      
      // Create patient data with required defaults
      const cleanPatientData = {
        firstName: patientData.firstName,
        middleName: patientData.middleName || null,
        lastName: patientData.lastName,
        nationalId: patientData.nationalId || null,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        phone: patientData.phone,
        email: patientData.email || null,
        address: patientData.address,
        emergencyContactName: patientData.emergencyContactName,
        emergencyContactPhone: patientData.emergencyContactPhone,
        emergencyContactRelationship: patientData.emergencyContactRelationship || null,
        occupation: patientData.occupation || null,
        bloodType: patientData.bloodType || null,
        insuranceProvider: patientData.insuranceProvider || null,
        policyNumber: patientData.policyNumber || null,
        medicalHistory: patientData.medicalHistory || null,
        allergies: patientData.allergies || null,
        patientType: patientData.patientType || "outpatient",
        wardAssignment: patientData.wardAssignment || null,
        bedNumber: patientData.bedNumber || null,
        admissionDate: patientData.admissionDate || null,
        isActive: patientData.isActive !== undefined ? patientData.isActive : true,
      };
      
      console.log("Clean patient data:", cleanPatientData);
      const patient = await storage.createPatient(cleanPatientData);
      console.log("Patient created successfully:", patient);
      res.status(201).json({
        message: "Registration successful",
        patientId: patient.patientId || patient.id,
        patient
      });
    } catch (error: any) {
      console.error("=== PATIENT CREATION ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      
      res.status(500).json({
        message: "Registration not successful",
        error: error?.message || "Unknown error"
      });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(id, validatedData);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const { date, patientId } = req.query;
      let appointments;
      
      if (date) {
        appointments = await storage.getAppointmentsByDate(date as string);
      } else if (patientId) {
        appointments = await storage.getAppointmentsByPatient(parseInt(patientId as string));
      } else {
        appointments = await storage.getAllAppointments();
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, validatedData);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Consultation notes endpoint
  app.post("/api/consultations", async (req, res) => {
    try {
      // For now, we'll store consultation notes in memory or localStorage
      // In a real implementation, this would be saved to a database
      console.log("Consultation notes received:", req.body);
      res.status(201).json({ 
        message: "Consultation notes saved successfully",
        id: Date.now() // Simple ID generation
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to save consultation notes" });
    }
  });

  // Therapy sessions endpoints
  app.post("/api/therapy-sessions", async (req, res) => {
    try {
      const validatedData = insertTherapySessionSchema.parse(req.body);
      const session = await storage.createTherapySession(validatedData);
      console.log("Therapy session saved:", session);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating therapy session:", error);
      res.status(400).json({ message: "Invalid therapy session data" });
    }
  });

  app.get("/api/therapy-sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllTherapySessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching therapy sessions:", error);
      res.status(500).json({ message: "Failed to fetch therapy sessions" });
    }
  });

  app.get("/api/therapy-sessions/patient/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      const sessions = await storage.getTherapySessionsByPatient(patientId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching patient therapy sessions:", error);
      res.status(500).json({ message: "Failed to fetch patient therapy sessions" });
    }
  });

  // Laboratory routes
  app.get("/api/lab-tests", async (req, res) => {
    try {
      const { patientId } = req.query;
      let labTests;
      
      if (patientId) {
        labTests = await storage.getLabTestsByPatient(parseInt(patientId as string));
      } else {
        labTests = await storage.getAllLabTests();
      }
      
      res.json(labTests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lab tests" });
    }
  });

  app.post("/api/lab-tests", async (req, res) => {
    try {
      const validatedData = insertLabTestSchema.parse(req.body);
      const labTest = await storage.createLabTest(validatedData);
      res.status(201).json(labTest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lab test" });
    }
  });

  app.put("/api/lab-tests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLabTestSchema.partial().parse(req.body);
      const labTest = await storage.updateLabTest(id, validatedData);
      
      if (!labTest) {
        return res.status(404).json({ message: "Lab test not found" });
      }
      
      res.json(labTest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update lab test" });
    }
  });

  // Medication routes
  app.get("/api/medications", async (req, res) => {
    try {
      const { search } = req.query;
      let medications;
      
      if (search) {
        medications = await storage.searchMedications(search as string);
      } else {
        medications = await storage.getAllMedications();
      }
      
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const validatedData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(validatedData);
      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create medication" });
    }
  });

  // Prescription routes
  app.get("/api/prescriptions", async (req, res) => {
    try {
      const { patientId } = req.query;
      let prescriptions;
      
      if (patientId) {
        prescriptions = await storage.getPrescriptionsByPatient(parseInt(patientId as string));
      } else {
        prescriptions = await storage.getAllPrescriptions();
      }
      
      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  app.post("/api/prescriptions", async (req, res) => {
    try {
      const validatedData = insertPrescriptionSchema.parse(req.body);
      const prescription = await storage.createPrescription(validatedData);
      res.status(201).json(prescription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create prescription" });
    }
  });

  // Billing routes
  app.get("/api/billing", async (req, res) => {
    try {
      const { patientId } = req.query;
      let billing;
      
      if (patientId) {
        billing = await storage.getBillingByPatient(parseInt(patientId as string));
      } else {
        billing = await storage.getAllBilling();
      }
      
      res.json(billing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch billing records" });
    }
  });

  app.post("/api/billing", async (req, res) => {
    try {
      console.log("Received billing data:", req.body);
      const validatedData = insertBillingSchema.parse(req.body);
      const billing = await storage.createBilling(validatedData);
      res.status(201).json(billing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error details:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Server error:", error);
      res.status(500).json({ message: "Failed to create billing record" });
    }
  });

  app.put("/api/billing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Updating billing record:", id, "with data:", req.body);
      
      // Convert paymentDate string to Date object if present
      if (req.body.paymentDate && typeof req.body.paymentDate === 'string') {
        req.body.paymentDate = new Date(req.body.paymentDate);
      }
      
      const validatedData = insertBillingSchema.partial().parse(req.body);
      const billing = await storage.updateBilling(id, validatedData);
      
      if (!billing) {
        return res.status(404).json({ message: "Billing record not found" });
      }
      
      res.json(billing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Billing update validation error:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Billing update server error:", error);
      res.status(500).json({ message: "Failed to update billing record" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
