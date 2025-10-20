import express from "express";
import {supabase} from "../supabaseClient.js";

const resultRouter = express.Router();

// GET /api/results/:id
resultRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  console.log('📥 Received Patient_id:', id);

  try {
    // Fetch patient by ID - Supabase will handle the type conversion
    const { data: patient, error: patientError } = await supabase
      .from("Patient")
      .select("Patient_id, Name, InferenceGeneSymbol")
      .eq("Patient_id", id)  // ✅ Just use id as string, Supabase handles conversion
      .single();

    if (patientError) {
      console.log('❌ Supabase error:', patientError);
      return res.status(404).json({ 
        error: "Patient not found",
        details: patientError.message 
      });
    }

    if (!patient) {
      console.log('❌ No patient returned');
      return res.status(404).json({ error: "Patient not found" });
    }

    console.log('✅ Patient found:', patient);

    // Find all diseases with the same inference gene symbol
    const { data: diseases, error: diseaseError } = await supabase
      .from("Disease")
      .select("DiseaseID, DiseaseName, InferenceGeneSymbol")
      .eq("InferenceGeneSymbol", patient.InferenceGeneSymbol);

    if (diseaseError) {
      console.log('❌ Disease query error:', diseaseError);
      throw diseaseError;
    }
    
    if (!diseases || diseases.length === 0) {
      console.log('⚠️ No diseases found for gene:', patient.InferenceGeneSymbol);
      return res.json({
        patient,
        results: [{ DiseaseID: null, DiseaseName: "No disease risk", InferenceGeneSymbol: null }],
      });
    }
    
    console.log('✅ Diseases found:', diseases.length);
    res.json({
      patient,
      results: diseases,
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

export {resultRouter} ;
