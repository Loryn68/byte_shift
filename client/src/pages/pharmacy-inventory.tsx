import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Pill, Package, AlertTriangle, Plus, Minus, Edit, TrendingDown, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const pharmacyInventory = [
  // ANALGESICS, NSAIDS & ANTIPYRETICS - Updated with exact prices from price list
  { id: 1, name: "Paracetamol 500mg", category: "Analgesics", stock: 500, unit: "tablets", price: 5, reorderLevel: 100, supplier: "Pharmaceutical Ltd" },
  { id: 2, name: "Tramadol 50mg", category: "Analgesics", stock: 200, unit: "tablets", price: 100, reorderLevel: 50, supplier: "MedSupply Co" },
  { id: 3, name: "Etoricoxib 90mg", category: "Analgesics", stock: 150, unit: "tablets", price: 30, reorderLevel: 30, supplier: "Global Pharma" },
  { id: 4, name: "Ibuprofen 400mg", category: "Analgesics", stock: 300, unit: "tablets", price: 5, reorderLevel: 75, supplier: "HealthCare Inc" },
  { id: 5, name: "Diclofenac 100mg", category: "Analgesics", stock: 250, unit: "tablets", price: 10, reorderLevel: 60, supplier: "MedSupply Co" },
  { id: 6, name: "Diclofenac 50mg", category: "Analgesics", stock: 200, unit: "tablets", price: 5, reorderLevel: 50, supplier: "MedSupply Co" },
  { id: 7, name: "Meloxicam 7.5mg", category: "Analgesics", stock: 180, unit: "tablets", price: 20, reorderLevel: 40, supplier: "Pharmaceutical Ltd" },
  { id: 8, name: "Doloact MR", category: "Analgesics", stock: 100, unit: "tablets", price: 30, reorderLevel: 25, supplier: "Specialty Meds" },
  { id: 9, name: "Buscopan 10mg", category: "Analgesics", stock: 200, unit: "tablets", price: 35, reorderLevel: 50, supplier: "Global Pharma" },
  { id: 10, name: "Buscopan plus 500/10mg", category: "Analgesics", stock: 150, unit: "tablets", price: 85, reorderLevel: 35, supplier: "Global Pharma" },
  { id: 11, name: "Hyoscine Butylbromide 10mg", category: "Analgesics", stock: 120, unit: "tablets", price: 10, reorderLevel: 30, supplier: "MedSupply Co" },
  { id: 12, name: "Aceclofenac/Paracetamol", category: "Analgesics", stock: 100, unit: "tablets", price: 35, reorderLevel: 25, supplier: "Pain Relief Co" },

  // ANTIPSYCHOTICS - Updated with exact prices
  { id: 13, name: "Risperidone 2mg", category: "Antipsychotics", stock: 120, unit: "tablets", price: 80, reorderLevel: 25, supplier: "Mental Health Pharma" },
  { id: 14, name: "Risperidone 1mg", category: "Antipsychotics", stock: 150, unit: "tablets", price: 60, reorderLevel: 30, supplier: "Mental Health Pharma" },
  { id: 15, name: "Quetiapine 50mg", category: "Antipsychotics", stock: 100, unit: "tablets", price: 50, reorderLevel: 20, supplier: "Specialty Meds" },
  { id: 16, name: "Quetiapine 100mg", category: "Antipsychotics", stock: 80, unit: "tablets", price: 70, reorderLevel: 15, supplier: "Specialty Meds" },
  { id: 17, name: "Quetiapine 150mg", category: "Antipsychotics", stock: 60, unit: "tablets", price: 100, reorderLevel: 12, supplier: "Specialty Meds" },
  { id: 18, name: "Quetiapine 200mg", category: "Antipsychotics", stock: 70, unit: "tablets", price: 90, reorderLevel: 15, supplier: "Specialty Meds" },
  { id: 19, name: "Quetiapine 300mg", category: "Antipsychotics", stock: 50, unit: "tablets", price: 120, reorderLevel: 10, supplier: "Specialty Meds" },
  { id: 20, name: "Quetiapine SR 100mg", category: "Antipsychotics", stock: 45, unit: "tablets", price: 110, reorderLevel: 10, supplier: "Specialty Meds" },
  { id: 21, name: "Quetiapine SR 200mg", category: "Antipsychotics", stock: 40, unit: "tablets", price: 150, reorderLevel: 8, supplier: "Specialty Meds" },
  { id: 22, name: "Olanzapine 5mg", category: "Antipsychotics", stock: 90, unit: "tablets", price: 40, reorderLevel: 20, supplier: "Mental Health Pharma" },
  { id: 23, name: "Olanzapine 10mg", category: "Antipsychotics", stock: 75, unit: "tablets", price: 50, reorderLevel: 15, supplier: "Mental Health Pharma" },
  { id: 24, name: "Aripiprazole 10mg", category: "Antipsychotics", stock: 60, unit: "tablets", price: 60, reorderLevel: 12, supplier: "Specialty Meds" },
  { id: 25, name: "Aripiprazole 15mg", category: "Antipsychotics", stock: 55, unit: "tablets", price: 60, reorderLevel: 10, supplier: "Specialty Meds" },
  { id: 26, name: "Aripiprazole 30mg", category: "Antipsychotics", stock: 40, unit: "tablets", price: 115, reorderLevel: 8, supplier: "Specialty Meds" },
  { id: 27, name: "Haloperidol 5mg", category: "Antipsychotics", stock: 100, unit: "tablets", price: 10, reorderLevel: 25, supplier: "Generic Pharma" },
  { id: 28, name: "Chlorpromazine 100mg", category: "Antipsychotics", stock: 80, unit: "tablets", price: 15, reorderLevel: 20, supplier: "Generic Pharma" },
  { id: 29, name: "Chlorpromazine 25mg", category: "Antipsychotics", stock: 120, unit: "tablets", price: 10, reorderLevel: 30, supplier: "Generic Pharma" },
  { id: 30, name: "Clozapine 100mg", category: "Antipsychotics", stock: 50, unit: "tablets", price: 120, reorderLevel: 10, supplier: "Specialty Meds" },

  // MOOD STABILIZERS - Updated with exact prices
  { id: 31, name: "Lamotrigine 100mg", category: "Mood Stabilizers", stock: 80, unit: "tablets", price: 80, reorderLevel: 15, supplier: "Neuro Pharma" },
  { id: 32, name: "Lamotrigine 25mg", category: "Mood Stabilizers", stock: 100, unit: "tablets", price: 50, reorderLevel: 20, supplier: "Neuro Pharma" },
  { id: 33, name: "Sodium Valproate 200mg", category: "Mood Stabilizers", stock: 150, unit: "tablets", price: 25, reorderLevel: 30, supplier: "Neuro Pharma" },
  { id: 34, name: "Sodium Valproate 500mg", category: "Mood Stabilizers", stock: 120, unit: "tablets", price: 70, reorderLevel: 25, supplier: "Neuro Pharma" },
  { id: 35, name: "Carbamazepine 200mg", category: "Mood Stabilizers", stock: 100, unit: "tablets", price: 10, reorderLevel: 20, supplier: "Neuro Pharma" },
  { id: 36, name: "Lithium Carbonate 400mg", category: "Mood Stabilizers", stock: 60, unit: "tablets", price: 80, reorderLevel: 12, supplier: "Specialty Meds" },

  // ANTIDEPRESSANTS AND CNS DRUGS - Updated with exact prices
  { id: 37, name: "Mirtazapine 15mg", category: "Antidepressants", stock: 80, unit: "tablets", price: 85, reorderLevel: 15, supplier: "Mental Health Pharma" },
  { id: 38, name: "Mirtazapine 30mg", category: "Antidepressants", stock: 70, unit: "tablets", price: 100, reorderLevel: 12, supplier: "Mental Health Pharma" },
  { id: 39, name: "Sertraline 50mg", category: "Antidepressants", stock: 120, unit: "tablets", price: 75, reorderLevel: 25, supplier: "Mental Health Pharma" },
  { id: 40, name: "Fluoxetine 20mg", category: "Antidepressants", stock: 100, unit: "tablets", price: 40, reorderLevel: 20, supplier: "Mental Health Pharma" },
  { id: 41, name: "Imipramine 25mg", category: "Antidepressants", stock: 90, unit: "tablets", price: 30, reorderLevel: 18, supplier: "Generic Pharma" },
  { id: 42, name: "Amitriptyline 25mg", category: "Antidepressants", stock: 150, unit: "tablets", price: 10, reorderLevel: 30, supplier: "Generic Pharma" },
  { id: 43, name: "Escitalopram 10mg", category: "Antidepressants", stock: 90, unit: "tablets", price: 115, reorderLevel: 18, supplier: "Mental Health Pharma" },
  { id: 44, name: "Escitalopram 5mg", category: "Antidepressants", stock: 80, unit: "tablets", price: 90, reorderLevel: 15, supplier: "Mental Health Pharma" },
  { id: 45, name: "Escitalopram 20mg", category: "Antidepressants", stock: 60, unit: "tablets", price: 110, reorderLevel: 12, supplier: "Mental Health Pharma" },
  { id: 46, name: "Citalopram 20mg", category: "Antidepressants", stock: 70, unit: "tablets", price: 80, reorderLevel: 15, supplier: "Mental Health Pharma" },
  { id: 47, name: "Procyclidine 5mg", category: "CNS Drugs", stock: 80, unit: "tablets", price: 10, reorderLevel: 15, supplier: "Neuro Pharma" },
  { id: 48, name: "Alprazolam 0.5mg", category: "CNS Drugs", stock: 80, unit: "tablets", price: 60, reorderLevel: 15, supplier: "Controlled Substances" },
  { id: 49, name: "Alprazolam 0.25mg", category: "CNS Drugs", stock: 100, unit: "tablets", price: 40, reorderLevel: 20, supplier: "Controlled Substances" },
  { id: 50, name: "Benzhexol 5mg", category: "CNS Drugs", stock: 70, unit: "tablets", price: 20, reorderLevel: 15, supplier: "Neuro Pharma" },
  { id: 51, name: "Diazepam 5mg", category: "CNS Drugs", stock: 150, unit: "tablets", price: 10, reorderLevel: 30, supplier: "Controlled Substances" },
  { id: 52, name: "Levetiracetam 500mg", category: "CNS Drugs", stock: 60, unit: "tablets", price: 95, reorderLevel: 12, supplier: "Neuro Pharma" },
  { id: 53, name: "Levetiracetam 250mg", category: "CNS Drugs", stock: 80, unit: "tablets", price: 80, reorderLevel: 15, supplier: "Neuro Pharma" },
  { id: 54, name: "Donepezil 5mg", category: "CNS Drugs", stock: 40, unit: "tablets", price: 45, reorderLevel: 8, supplier: "Specialty Meds" },
  { id: 55, name: "Donepezil 10mg", category: "CNS Drugs", stock: 35, unit: "tablets", price: 70, reorderLevel: 7, supplier: "Specialty Meds" },
  { id: 56, name: "Phenobarbital 30mg", category: "CNS Drugs", stock: 120, unit: "tablets", price: 5, reorderLevel: 30, supplier: "Neuro Pharma" },
  { id: 57, name: "Melatonin 10mg", category: "CNS Drugs", stock: 60, unit: "tablets", price: 30, reorderLevel: 12, supplier: "Sleep Aids" },
  { id: 58, name: "Melatonin 3mg", category: "CNS Drugs", stock: 80, unit: "tablets", price: 45, reorderLevel: 15, supplier: "Sleep Aids" },

  // GASTROINTESTINAL - Updated with exact prices
  { id: 59, name: "Bisacodyl 5mg", category: "Gastrointestinal", stock: 300, unit: "tablets", price: 10, reorderLevel: 75, supplier: "Generic Pharma" },
  { id: 60, name: "Loperamide 2mg", category: "Gastrointestinal", stock: 200, unit: "capsules", price: 10, reorderLevel: 50, supplier: "HealthCare Inc" },
  { id: 61, name: "Albendazole 400mg", category: "Gastrointestinal", stock: 150, unit: "tablets", price: 50, reorderLevel: 35, supplier: "Generic Pharma" },
  { id: 62, name: "Albendazole Suspension 200mg/5ml", category: "Gastrointestinal", stock: 80, unit: "bottles", price: 50, reorderLevel: 20, supplier: "Generic Pharma" },
  { id: 63, name: "Mebendazole 100mg", category: "Gastrointestinal", stock: 120, unit: "tablets", price: 30, reorderLevel: 30, supplier: "Generic Pharma" },
  { id: 64, name: "Mebendazole Syrup 30ml", category: "Gastrointestinal", stock: 60, unit: "bottles", price: 50, reorderLevel: 15, supplier: "Generic Pharma" },
  { id: 65, name: "Omeprazole 20mg", category: "Gastrointestinal", stock: 200, unit: "capsules", price: 15, reorderLevel: 50, supplier: "HealthCare Inc" },
  { id: 66, name: "Esomeprazole 20mg", category: "Gastrointestinal", stock: 150, unit: "tablets", price: 15, reorderLevel: 35, supplier: "HealthCare Inc" },
  { id: 67, name: "Esomeprazole 40mg", category: "Gastrointestinal", stock: 120, unit: "tablets", price: 30, reorderLevel: 25, supplier: "HealthCare Inc" },
  { id: 68, name: "Alugel Suspension 100ml", category: "Gastrointestinal", stock: 100, unit: "bottles", price: 150, reorderLevel: 25, supplier: "Antacid Co" },
  { id: 69, name: "Gastrogel Antacid 100ml", category: "Gastrointestinal", stock: 90, unit: "bottles", price: 150, reorderLevel: 20, supplier: "Antacid Co" },

  // ANTIHYPERTENSIVES - Updated with exact prices
  { id: 70, name: "Atenolol 50mg", category: "Antihypertensives", stock: 200, unit: "tablets", price: 10, reorderLevel: 50, supplier: "Cardio Pharma" },
  { id: 71, name: "Carvedilol 6.25mg", category: "Antihypertensives", stock: 150, unit: "tablets", price: 30, reorderLevel: 35, supplier: "Cardio Pharma" },
  { id: 72, name: "Amlodipine 5mg", category: "Antihypertensives", stock: 250, unit: "tablets", price: 10, reorderLevel: 60, supplier: "Cardio Pharma" },
  { id: 73, name: "Amlodipine 10mg", category: "Antihypertensives", stock: 180, unit: "tablets", price: 15, reorderLevel: 40, supplier: "Cardio Pharma" },
  { id: 74, name: "Enalapril 5mg", category: "Antihypertensives", stock: 150, unit: "tablets", price: 10, reorderLevel: 35, supplier: "Cardio Pharma" },
  { id: 75, name: "Losartan 50mg", category: "Antihypertensives", stock: 200, unit: "tablets", price: 10, reorderLevel: 50, supplier: "Cardio Pharma" },
  { id: 76, name: "Losartan H 50/12.5mg", category: "Antihypertensives", stock: 150, unit: "tablets", price: 15, reorderLevel: 35, supplier: "Cardio Pharma" },
  { id: 77, name: "Furosemide 40mg", category: "Antihypertensives", stock: 180, unit: "tablets", price: 5, reorderLevel: 45, supplier: "Generic Pharma" },
  { id: 78, name: "Propranolol 40mg", category: "Antihypertensives", stock: 120, unit: "tablets", price: 10, reorderLevel: 30, supplier: "Cardio Pharma" },
  { id: 79, name: "Nifedipine 20mg", category: "Antihypertensives", stock: 100, unit: "tablets", price: 5, reorderLevel: 25, supplier: "Cardio Pharma" },

  // ANTIDIABETICS - Updated with exact prices
  { id: 80, name: "Metformin 1000mg", category: "Antidiabetics", stock: 300, unit: "tablets", price: 20, reorderLevel: 75, supplier: "Diabetes Care" },
  { id: 81, name: "Metformin 850mg", category: "Antidiabetics", stock: 250, unit: "tablets", price: 20, reorderLevel: 60, supplier: "Diabetes Care" },
  { id: 82, name: "Metformin 500mg", category: "Antidiabetics", stock: 400, unit: "tablets", price: 10, reorderLevel: 100, supplier: "Diabetes Care" },
  { id: 83, name: "Glibenclamide 5mg", category: "Antidiabetics", stock: 200, unit: "tablets", price: 10, reorderLevel: 50, supplier: "Diabetes Care" },
  { id: 84, name: "Gliclazide MR 60mg", category: "Antidiabetics", stock: 150, unit: "tablets", price: 40, reorderLevel: 35, supplier: "Diabetes Care" },

  // ANTI-INFECTIVES - Updated with exact prices
  { id: 85, name: "Metronidazole 400mg", category: "Anti-infectives", stock: 250, unit: "tablets", price: 10, reorderLevel: 60, supplier: "Antibiotics Inc" },
  { id: 86, name: "Doxycycline 100mg", category: "Anti-infectives", stock: 150, unit: "tablets", price: 20, reorderLevel: 35, supplier: "Antibiotics Inc" },
  { id: 87, name: "Co-Trimoxazole 960mg", category: "Anti-infectives", stock: 200, unit: "tablets", price: 15, reorderLevel: 50, supplier: "Antibiotics Inc" },
  { id: 88, name: "Amoxicillin 500mg", category: "Anti-infectives", stock: 300, unit: "capsules", price: 15, reorderLevel: 75, supplier: "Antibiotics Inc" },
  { id: 89, name: "Amoxicillin 250mg", category: "Anti-infectives", stock: 200, unit: "capsules", price: 10, reorderLevel: 50, supplier: "Antibiotics Inc" },
  { id: 90, name: "Ciprofloxacin 500mg", category: "Anti-infectives", stock: 200, unit: "tablets", price: 300, reorderLevel: 50, supplier: "Antibiotics Inc" },
  { id: 91, name: "Ciprofloxacin 250mg", category: "Anti-infectives", stock: 150, unit: "tablets", price: 100, reorderLevel: 35, supplier: "Antibiotics Inc" },
  { id: 92, name: "Azithromycin 500mg", category: "Anti-infectives", stock: 100, unit: "tablets", price: 150, reorderLevel: 25, supplier: "Specialty Antibiotics" },
  { id: 93, name: "Erythromycin 500mg", category: "Anti-infectives", stock: 120, unit: "tablets", price: 20, reorderLevel: 30, supplier: "Antibiotics Inc" },
  { id: 94, name: "Flucloxacillin 500mg", category: "Anti-infectives", stock: 100, unit: "capsules", price: 20, reorderLevel: 25, supplier: "Antibiotics Inc" },
  { id: 95, name: "Flucloxacillin 250mg", category: "Anti-infectives", stock: 150, unit: "capsules", price: 10, reorderLevel: 35, supplier: "Antibiotics Inc" },

  // RESPIRATORY/ANTIHISTAMINES - Updated with exact prices
  { id: 96, name: "Cetirizine 10mg", category: "Antihistamines", stock: 300, unit: "tablets", price: 10, reorderLevel: 75, supplier: "Allergy Care" },
  { id: 97, name: "Chlorpheniramine 4mg", category: "Antihistamines", stock: 250, unit: "tablets", price: 5, reorderLevel: 60, supplier: "Generic Pharma" },
  { id: 98, name: "Salbutamol 4mg", category: "Respiratory", stock: 150, unit: "tablets", price: 5, reorderLevel: 35, supplier: "Respiratory Care" },
  { id: 99, name: "Loratadine 10mg", category: "Antihistamines", stock: 200, unit: "tablets", price: 20, reorderLevel: 50, supplier: "Allergy Care" },
  { id: 100, name: "Montelukast 10mg", category: "Respiratory", stock: 80, unit: "tablets", price: 40, reorderLevel: 20, supplier: "Respiratory Care" },

  // PEDIATRIC PREPARATIONS - Updated with exact prices
  { id: 101, name: "Amoxiclav Syrup 228.5mg/5ml 100ml", category: "Pediatric", stock: 80, unit: "bottles", price: 300, reorderLevel: 20, supplier: "Pediatric Pharma" },
  { id: 102, name: "Amoxiclav Syrup 457mg 100ml", category: "Pediatric", stock: 60, unit: "bottles", price: 350, reorderLevel: 15, supplier: "Pediatric Pharma" },
  { id: 103, name: "Calpol Suspension 60ml", category: "Pediatric", stock: 150, unit: "bottles", price: 300, reorderLevel: 35, supplier: "Pediatric Pharma" },
  { id: 104, name: "Calpol Suspension 100ml", category: "Pediatric", stock: 120, unit: "bottles", price: 350, reorderLevel: 30, supplier: "Pediatric Pharma" },
  { id: 105, name: "Ibuprofen Suspension 60ml", category: "Pediatric", stock: 100, unit: "bottles", price: 60, reorderLevel: 25, supplier: "Pediatric Pharma" },
  { id: 106, name: "Cetirizine Syrup 60ml", category: "Pediatric", stock: 120, unit: "bottles", price: 80, reorderLevel: 30, supplier: "Pediatric Pharma" },
  { id: 107, name: "Chlorpheniramine Syrup 60ml", category: "Pediatric", stock: 100, unit: "bottles", price: 100, reorderLevel: 25, supplier: "Pediatric Pharma" },
  { id: 108, name: "Amoxicillin Suspension 125mg/5ml 100ml", category: "Pediatric", stock: 80, unit: "bottles", price: 150, reorderLevel: 20, supplier: "Pediatric Pharma" },

  // INJECTIONS - Updated with exact prices
  { id: 109, name: "Diazepam 5mg/ml injection", category: "Injections", stock: 50, unit: "ampoules", price: 700, reorderLevel: 10, supplier: "Injectable Solutions" },
  { id: 110, name: "Hydrocortisone 100mg injection", category: "Injections", stock: 30, unit: "vials", price: 200, reorderLevel: 6, supplier: "Steroid Injectables" },
  { id: 111, name: "Diclofenac injection 75mg", category: "Injections", stock: 60, unit: "ampoules", price: 200, reorderLevel: 12, supplier: "Injectable Solutions" },
  { id: 112, name: "Midazolam 5mg/ml injection", category: "Injections", stock: 40, unit: "ampoules", price: 500, reorderLevel: 8, supplier: "Injectable Solutions" },
  { id: 113, name: "Benzylpenicillin 5M.U injection", category: "Injections", stock: 50, unit: "vials", price: 50, reorderLevel: 10, supplier: "Injectable Solutions" },
  { id: 114, name: "Flucloxacillin 500mg injection", category: "Injections", stock: 40, unit: "vials", price: 300, reorderLevel: 8, supplier: "Injectable Solutions" },

  // TOPICALS - Updated with exact prices
  { id: 115, name: "Hydrocortisone cream 1% 15g", category: "Topicals", stock: 100, unit: "tubes", price: 80, reorderLevel: 25, supplier: "Dermatology Care" },
  { id: 116, name: "Clotrimazole cream 20g", category: "Topicals", stock: 120, unit: "tubes", price: 70, reorderLevel: 30, supplier: "Dermatology Care" },
  { id: 117, name: "Diclofenac gel 1% 20g", category: "Topicals", stock: 80, unit: "tubes", price: 100, reorderLevel: 20, supplier: "Pain Relief Topicals" },
  { id: 118, name: "Whitefield's Ointment 20g", category: "Topicals", stock: 90, unit: "tubes", price: 120, reorderLevel: 20, supplier: "Dermatology Care" },

  // VITAMINS/SUPPLEMENTS - Updated with exact prices
  { id: 119, name: "Multivitamin tablets (Euvitan)", category: "Vitamins", stock: 200, unit: "tablets", price: 20, reorderLevel: 50, supplier: "Nutrition Plus" },
  { id: 120, name: "Folic acid 5mg", category: "Vitamins", stock: 150, unit: "tablets", price: 5, reorderLevel: 35, supplier: "Nutrition Plus" },
  { id: 121, name: "Vitamin C tablets", category: "Vitamins", stock: 300, unit: "tablets", price: 10, reorderLevel: 75, supplier: "Nutrition Plus" },
  { id: 122, name: "Seven Seas Capsules", category: "Vitamins", stock: 100, unit: "capsules", price: 35, reorderLevel: 25, supplier: "Nutrition Plus" },
  { id: 123, name: "Centrum Advance", category: "Vitamins", stock: 80, unit: "tablets", price: 40, reorderLevel: 20, supplier: "Nutrition Plus" },

  // ADDITIONAL SPECIALIZED MEDICATIONS
  { id: 124, name: "Acamprosate Calcium 333mg", category: "Addiction Treatment", stock: 60, unit: "tablets", price: 350, reorderLevel: 12, supplier: "Addiction Therapy Co" },
  { id: 125, name: "Naltrexone 50mg", category: "Addiction Treatment", stock: 40, unit: "tablets", price: 400, reorderLevel: 8, supplier: "Addiction Therapy Co" },
  { id: 126, name: "Bupropion 150mg", category: "Antidepressants", stock: 50, unit: "tablets", price: 150, reorderLevel: 10, supplier: "Mental Health Pharma" },
  { id: 127, name: "Duloxetine 20mg", category: "Antidepressants", stock: 60, unit: "tablets", price: 75, reorderLevel: 12, supplier: "Mental Health Pharma" },
  { id: 128, name: "Duloxetine 60mg", category: "Antidepressants", stock: 50, unit: "tablets", price: 90, reorderLevel: 10, supplier: "Mental Health Pharma" },
  { id: 129, name: "Pregabalin 75mg", category: "CNS Drugs", stock: 70, unit: "capsules", price: 45, reorderLevel: 15, supplier: "Neuro Pharma" },
  { id: 130, name: "Methylphenidate 10mg", category: "CNS Drugs", stock: 40, unit: "tablets", price: 80, reorderLevel: 8, supplier: "ADHD Specialists" },
  { id: 131, name: "Concerta 18mg", category: "CNS Drugs", stock: 30, unit: "tablets", price: 130, reorderLevel: 6, supplier: "ADHD Specialists" },
  { id: 132, name: "Lurasidone 40mg", category: "Antipsychotics", stock: 35, unit: "tablets", price: 130, reorderLevel: 7, supplier: "Specialty Meds" }
];

export default function PharmacyInventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showStockModal, setShowStockModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [stockAdjustment, setStockAdjustment] = useState({ quantity: 0, type: "add", reason: "" });
  const [supplierEdit, setSupplierEdit] = useState({ supplier: "", notes: "" });
  const [priceEdit, setPriceEdit] = useState({ price: 0, reason: "" });

  // Filter medications
  const filteredMedications = useMemo(() => {
    return pharmacyInventory.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || med.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Get unique categories
  const categories = Array.from(new Set(pharmacyInventory.map(med => med.category)));

  // Get low stock medications
  const lowStockMedications = pharmacyInventory.filter(med => med.stock <= med.reorderLevel);

  // Stock adjustment mutation
  const adjustStockMutation = useMutation({
    mutationFn: async (adjustmentData: any) => {
      // This would integrate with your backend
      return await apiRequest("PUT", `/api/medications/${adjustmentData.medicationId}/stock`, adjustmentData);
    },
    onSuccess: () => {
      toast({
        title: "Stock Updated",
        description: "Medication stock has been adjusted successfully.",
      });
      setShowStockModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
    },
  });

  // Supplier update mutation
  const updateSupplierMutation = useMutation({
    mutationFn: async (supplierData: any) => {
      return await apiRequest("PUT", `/api/medications/${supplierData.medicationId}/supplier`, supplierData);
    },
    onSuccess: () => {
      toast({
        title: "Supplier Updated",
        description: "Medication supplier has been updated successfully.",
      });
      setShowSupplierModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
    },
  });

  // Price update mutation
  const updatePriceMutation = useMutation({
    mutationFn: async (priceData: any) => {
      return await apiRequest("PUT", `/api/medications/${priceData.medicationId}/price`, priceData);
    },
    onSuccess: () => {
      toast({
        title: "Price Updated",
        description: "Medication price has been updated successfully.",
      });
      setShowPriceModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
    },
  });

  const handleStockAdjustment = (medication: any) => {
    setSelectedMedication(medication);
    setShowStockModal(true);
  };

  const handleSupplierEdit = (medication: any) => {
    setSelectedMedication(medication);
    setSupplierEdit({ supplier: medication.supplier, notes: "" });
    setShowSupplierModal(true);
  };

  const handlePriceEdit = (medication: any) => {
    setSelectedMedication(medication);
    setPriceEdit({ price: medication.price, reason: "" });
    setShowPriceModal(true);
  };

  const submitStockAdjustment = () => {
    if (!selectedMedication) return;
    adjustStockMutation.mutate({
      medicationId: selectedMedication.id,
      ...stockAdjustment
    });
  };

  const submitSupplierUpdate = () => {
    if (!selectedMedication) return;
    updateSupplierMutation.mutate({
      medicationId: selectedMedication.id,
      ...supplierEdit
    });
  };

  const submitPriceUpdate = () => {
    if (!selectedMedication) return;
    updatePriceMutation.mutate({
      medicationId: selectedMedication.id,
      ...priceEdit
    });
  };

  const getStockStatus = (medication: any) => {
    if (medication.stock <= medication.reorderLevel) return "low";
    if (medication.stock <= medication.reorderLevel * 2) return "medium";
    return "good";
  };

  const getStockBadgeColor = (status: string) => {
    switch (status) {
      case "low": return "destructive";
      case "medium": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            Pharmacy Inventory
          </h1>
          <p className="text-gray-600">Child Mental Haven medication stock management</p>
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Medications</CardTitle>
            <Pill className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{pharmacyInventory.length}</div>
            <p className="text-xs text-blue-600">Different medications</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              KShs {pharmacyInventory.reduce((sum, med) => sum + (med.stock * med.price), 0).toLocaleString()}
            </div>
            <p className="text-xs text-green-600">Current inventory value</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{lowStockMedications.length}</div>
            <p className="text-xs text-orange-600">Need reordering</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Categories</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{categories.length}</div>
            <p className="text-xs text-purple-600">Medication categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Medication Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Inventory</CardTitle>
          <CardDescription>
            Complete list of available medications with stock levels and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Unit Price (KShs)</TableHead>
                <TableHead>Total Value (KShs)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedications.map((medication) => {
                const stockStatus = getStockStatus(medication);
                return (
                  <TableRow key={medication.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{medication.name}</div>
                        <div className="text-sm text-gray-500">{medication.unit}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{medication.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${stockStatus === 'low' ? 'text-red-600' : ''}`}>
                          {medication.stock}
                        </span>
                        {stockStatus === 'low' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="text-xs text-gray-500">
                        Reorder at: {medication.reorderLevel}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="cursor-pointer hover:text-blue-600" onClick={() => handlePriceEdit(medication)}>
                        KShs {medication.price.toFixed(2)}
                        <Edit className="h-3 w-3 inline ml-1" />
                      </div>
                    </TableCell>
                    <TableCell>{(medication.stock * medication.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStockBadgeColor(stockStatus)}>
                        {stockStatus === 'low' ? 'Low Stock' : stockStatus === 'medium' ? 'Medium' : 'In Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm cursor-pointer hover:text-blue-600" onClick={() => handleSupplierEdit(medication)}>
                        {medication.supplier}
                        <Edit className="h-3 w-3 inline ml-1" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStockAdjustment(medication)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Stock
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePriceEdit(medication)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Price
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSupplierEdit(medication)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Supplier
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockMedications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockMedications.map(med => (
                <div key={med.id} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="font-medium">{med.name}</span>
                  <span className="text-orange-600">
                    Stock: {med.stock} {med.unit} (Reorder: {med.reorderLevel})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Adjustment Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock - {selectedMedication?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Stock: {selectedMedication?.stock} {selectedMedication?.unit}</Label>
            </div>
            <div>
              <Label>Adjustment Type</Label>
              <Select value={stockAdjustment.type} onValueChange={(value) => setStockAdjustment({...stockAdjustment, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock</SelectItem>
                  <SelectItem value="subtract">Remove Stock</SelectItem>
                  <SelectItem value="set">Set Stock Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={stockAdjustment.quantity}
                onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: parseInt(e.target.value) || 0})}
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Input
                value={stockAdjustment.reason}
                onChange={(e) => setStockAdjustment({...stockAdjustment, reason: e.target.value})}
                placeholder="Reason for adjustment"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowStockModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitStockAdjustment} disabled={adjustStockMutation.isPending}>
                {adjustStockMutation.isPending ? "Updating..." : "Update Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supplier Edit Modal */}
      <Dialog open={showSupplierModal} onOpenChange={setShowSupplierModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Supplier - {selectedMedication?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Supplier: {selectedMedication?.supplier}</Label>
            </div>
            <div>
              <Label>New Supplier Name</Label>
              <Input
                value={supplierEdit.supplier}
                onChange={(e) => setSupplierEdit({...supplierEdit, supplier: e.target.value})}
                placeholder="Enter new supplier name"
              />
            </div>
            <div>
              <Label>Notes/Reason for Change</Label>
              <Input
                value={supplierEdit.notes}
                onChange={(e) => setSupplierEdit({...supplierEdit, notes: e.target.value})}
                placeholder="Reason for supplier change"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSupplierModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitSupplierUpdate} disabled={updateSupplierMutation.isPending}>
                {updateSupplierMutation.isPending ? "Updating..." : "Update Supplier"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Price Edit Modal */}
      <Dialog open={showPriceModal} onOpenChange={setShowPriceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Price - {selectedMedication?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Price: KShs {selectedMedication?.price?.toFixed(2)}</Label>
            </div>
            <div>
              <Label>New Unit Price (KShs)</Label>
              <Input
                type="number"
                step="0.01"
                value={priceEdit.price}
                onChange={(e) => setPriceEdit({...priceEdit, price: parseFloat(e.target.value) || 0})}
                placeholder="Enter new price"
              />
            </div>
            <div>
              <Label>Reason for Price Change</Label>
              <Input
                value={priceEdit.reason}
                onChange={(e) => setPriceEdit({...priceEdit, reason: e.target.value})}
                placeholder="Reason for price adjustment"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPriceModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitPriceUpdate} disabled={updatePriceMutation.isPending}>
                {updatePriceMutation.isPending ? "Updating..." : "Update Price"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}