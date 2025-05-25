// Child Mental Haven - Patient Workflow System
// Based on Kranium HIMS patient flow model

import { apiRequest } from "./queryClient";

export interface PatientEpisode {
  id: number;
  patientId: number;
  episodeNumber: string;
  episodeType: 'outpatient' | 'inpatient' | 'emergency';
  status: 'registered' | 'in-queue' | 'in-consultation' | 'treatment' | 'billing' | 'completed';
  registrationDate: string;
  consultationFee: number;
  feesPaid: boolean;
  doctorId?: number;
  consultationNotes?: string;
  prescriptions: any[];
  labTests: any[];
  services: any[];
}

export interface PatientWorkflow {
  patient: any;
  currentEpisode: PatientEpisode;
  status: 'registration' | 'payment' | 'queue' | 'consultation' | 'services' | 'discharge';
  nextStep: string;
  availableActions: string[];
}

class WorkflowManager {
  // Step 1: Register Patient and Create Episode
  async registerPatientWithEpisode(patientData: any, episodeType: 'outpatient' | 'inpatient' | 'emergency' = 'outpatient') {
    try {
      // Create patient first
      const patient = await apiRequest("POST", "/api/patients", patientData);
      
      // Create episode for this encounter
      const episode = await this.createEpisode(patient.id, episodeType);
      
      // Create initial consultation billing
      await this.createConsultationBilling(patient.id, episode.episodeNumber);
      
      return {
        patient,
        episode,
        status: 'registration',
        nextStep: 'Payment of consultation fee required',
        availableActions: ['pay-consultation-fee', 'view-patient-details']
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error}`);
    }
  }

  // Step 2: Create Episode for Patient Encounter
  async createEpisode(patientId: number, episodeType: 'outpatient' | 'inpatient' | 'emergency') {
    const episodeNumber = this.generateEpisodeNumber(episodeType);
    
    const episodeData = {
      patientId,
      episodeNumber,
      episodeType,
      status: 'registered',
      registrationDate: new Date().toISOString(),
      consultationFee: episodeType === 'emergency' ? 50 : 30, // Emergency consultation costs more
      feesPaid: false,
      prescriptions: [],
      labTests: [],
      services: []
    };

    // Store episode in local storage for now (will move to Firebase)
    const episodes = this.getStoredEpisodes();
    episodes.push({ ...episodeData, id: episodes.length + 1 });
    localStorage.setItem('patient-episodes', JSON.stringify(episodes));
    
    return episodeData;
  }

  // Step 3: Handle Consultation Fee Payment
  async payConsultationFee(episodeNumber: string, paymentMethod: string, transactionRef?: string) {
    try {
      const episodes = this.getStoredEpisodes();
      const episodeIndex = episodes.findIndex(e => e.episodeNumber === episodeNumber);
      
      if (episodeIndex === -1) {
        throw new Error('Episode not found');
      }

      const episode = episodes[episodeIndex];
      
      // Create payment billing record
      const billingData = {
        patientId: episode.patientId,
        serviceType: "Consultation Fee",
        serviceDescription: `${episode.episodeType.toUpperCase()} consultation fee - Episode: ${episodeNumber}`,
        amount: episode.consultationFee.toString(),
        discount: "0.00",
        totalAmount: episode.consultationFee.toString(),
        paymentStatus: "paid",
        paymentMethod,
        transactionReference: transactionRef || "",
        episodeNumber,
        notes: `Consultation fee payment for ${episode.episodeType} visit`
      };

      await apiRequest("POST", "/api/billing", billingData);

      // Update episode status
      episodes[episodeIndex].feesPaid = true;
      episodes[episodeIndex].status = 'in-queue';
      localStorage.setItem('patient-episodes', JSON.stringify(episodes));

      return {
        success: true,
        message: 'Payment successful. Patient added to consultation queue.',
        nextStep: 'Patient in queue for doctor consultation',
        availableActions: ['view-queue-position', 'call-for-consultation']
      };
    } catch (error) {
      throw new Error(`Payment failed: ${error}`);
    }
  }

  // Step 4: Add Patient to Outpatient Queue
  async addToOutpatientQueue(episodeNumber: string) {
    const episodes = this.getStoredEpisodes();
    const episode = episodes.find(e => e.episodeNumber === episodeNumber && e.feesPaid);
    
    if (!episode) {
      throw new Error('Episode not found or consultation fee not paid');
    }

    // Add to queue (stored in local storage for now)
    const queue = this.getOutpatientQueue();
    if (!queue.find(q => q.episodeNumber === episodeNumber)) {
      queue.push({
        episodeNumber,
        patientId: episode.patientId,
        queueTime: new Date().toISOString(),
        priority: episode.episodeType === 'emergency' ? 'high' : 'normal',
        status: 'waiting'
      });
      localStorage.setItem('outpatient-queue', JSON.stringify(queue));
    }

    return {
      queuePosition: queue.length,
      estimatedWaitTime: queue.length * 15, // 15 minutes per patient
      status: 'in-queue'
    };
  }

  // Step 5: Doctor Consultation
  async startConsultation(episodeNumber: string, doctorId: number) {
    const episodes = this.getStoredEpisodes();
    const episodeIndex = episodes.findIndex(e => e.episodeNumber === episodeNumber);
    
    if (episodeIndex === -1) {
      throw new Error('Episode not found');
    }

    // Update episode status
    episodes[episodeIndex].status = 'in-consultation';
    episodes[episodeIndex].doctorId = doctorId;
    localStorage.setItem('patient-episodes', JSON.stringify(episodes));

    // Remove from queue
    const queue = this.getOutpatientQueue();
    const updatedQueue = queue.filter(q => q.episodeNumber !== episodeNumber);
    localStorage.setItem('outpatient-queue', JSON.stringify(updatedQueue));

    return {
      status: 'in-consultation',
      availableActions: ['add-notes', 'prescribe-medication', 'order-lab-tests', 'refer-to-specialist', 'discharge']
    };
  }

  // Step 6: Add Services (Lab Tests, Prescriptions, etc.)
  async addServiceToEpisode(episodeNumber: string, serviceType: 'lab-test' | 'prescription' | 'radiology', serviceData: any) {
    const episodes = this.getStoredEpisodes();
    const episodeIndex = episodes.findIndex(e => e.episodeNumber === episodeNumber);
    
    if (episodeIndex === -1) {
      throw new Error('Episode not found');
    }

    const episode = episodes[episodeIndex];

    // Add service to episode
    switch (serviceType) {
      case 'lab-test':
        episode.labTests.push({
          ...serviceData,
          orderedAt: new Date().toISOString(),
          status: 'ordered'
        });
        
        // Create billing for lab test
        await apiRequest("POST", "/api/billing", {
          patientId: episode.patientId,
          serviceType: "Laboratory Test",
          serviceDescription: serviceData.testName,
          amount: serviceData.cost || "25.00",
          discount: "0.00",
          totalAmount: serviceData.cost || "25.00",
          paymentStatus: "pending",
          episodeNumber,
          notes: `Lab test ordered during consultation - Episode: ${episodeNumber}`
        });
        break;

      case 'prescription':
        episode.prescriptions.push({
          ...serviceData,
          prescribedAt: new Date().toISOString(),
          status: 'prescribed'
        });
        
        // Create billing for medication
        await apiRequest("POST", "/api/billing", {
          patientId: episode.patientId,
          serviceType: "Pharmacy",
          serviceDescription: `${serviceData.medicationName} - ${serviceData.dosage}`,
          amount: serviceData.cost || "15.00",
          discount: "0.00", 
          totalAmount: serviceData.cost || "15.00",
          paymentStatus: "pending",
          episodeNumber,
          notes: `Medication prescribed during consultation - Episode: ${episodeNumber}`
        });
        break;
    }

    episodes[episodeIndex] = episode;
    localStorage.setItem('patient-episodes', JSON.stringify(episodes));

    return {
      success: true,
      message: `${serviceType} added to episode successfully`,
      episode: episodes[episodeIndex]
    };
  }

  // Step 7: Complete Episode
  async completeEpisode(episodeNumber: string, dischargeNotes?: string) {
    const episodes = this.getStoredEpisodes();
    const episodeIndex = episodes.findIndex(e => e.episodeNumber === episodeNumber);
    
    if (episodeIndex === -1) {
      throw new Error('Episode not found');
    }

    episodes[episodeIndex].status = 'completed';
    episodes[episodeIndex].consultationNotes = dischargeNotes;
    episodes[episodeIndex].completedAt = new Date().toISOString();
    
    localStorage.setItem('patient-episodes', JSON.stringify(episodes));

    return {
      success: true,
      message: 'Episode completed successfully',
      episode: episodes[episodeIndex]
    };
  }

  // Utility Functions
  generateEpisodeNumber(episodeType: string): string {
    const prefix = episodeType === 'inpatient' ? 'IP' : episodeType === 'emergency' ? 'EM' : 'OP';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  }

  createConsultationBilling(patientId: number, episodeNumber: string) {
    const consultationFee = episodeNumber.startsWith('EM') ? 50 : 30;
    
    return apiRequest("POST", "/api/billing", {
      patientId,
      serviceType: "Consultation",
      serviceDescription: `Medical consultation - Episode: ${episodeNumber}`,
      amount: consultationFee.toString(),
      discount: "0.00",
      totalAmount: consultationFee.toString(),
      paymentStatus: "pending",
      paymentMethod: "",
      episodeNumber,
      notes: `Initial consultation billing for episode ${episodeNumber}`
    });
  }

  getStoredEpisodes(): PatientEpisode[] {
    const stored = localStorage.getItem('patient-episodes');
    return stored ? JSON.parse(stored) : [];
  }

  getOutpatientQueue(): any[] {
    const stored = localStorage.getItem('outpatient-queue');
    return stored ? JSON.parse(stored) : [];
  }

  // Get Patient Workflow Status
  async getPatientWorkflow(patientId: number): Promise<PatientWorkflow | null> {
    const episodes = this.getStoredEpisodes();
    const currentEpisode = episodes.find(e => e.patientId === patientId && e.status !== 'completed');
    
    if (!currentEpisode) {
      return null;
    }

    const patient = await apiRequest("GET", `/api/patients/${patientId}`);
    
    let status: PatientWorkflow['status'];
    let nextStep: string;
    let availableActions: string[] = [];

    switch (currentEpisode.status) {
      case 'registered':
        status = 'payment';
        nextStep = 'Pay consultation fee to proceed';
        availableActions = ['pay-consultation-fee'];
        break;
      case 'in-queue':
        status = 'queue';
        nextStep = 'Waiting for doctor consultation';
        availableActions = ['view-queue-position'];
        break;
      case 'in-consultation':
        status = 'consultation';
        nextStep = 'Doctor consultation in progress';
        availableActions = ['add-notes', 'prescribe-medication', 'order-lab-tests', 'discharge'];
        break;
      case 'treatment':
        status = 'services';
        nextStep = 'Complete prescribed services';
        availableActions = ['pay-services', 'collect-medication', 'lab-tests'];
        break;
      default:
        status = 'discharge';
        nextStep = 'Episode completed';
        availableActions = ['generate-summary'];
    }

    return {
      patient,
      currentEpisode,
      status,
      nextStep,
      availableActions
    };
  }
}

export const workflowManager = new WorkflowManager();