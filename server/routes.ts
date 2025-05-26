import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertAppointmentSchema, insertLabTestSchema, insertMedicationSchema, insertPrescriptionSchema, insertBillingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create patient" });
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
      const validatedData = insertBillingSchema.partial().parse(req.body);
      const billing = await storage.updateBilling(id, validatedData);
      
      if (!billing) {
        return res.status(404).json({ message: "Billing record not found" });
      }
      
      res.json(billing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update billing record" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
