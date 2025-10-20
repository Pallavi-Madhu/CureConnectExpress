import os
from dotenv import load_dotenv
import pandas as pd
from supabase import create_client, Client

# --- Load environment variables ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_API")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing SUPABASE_URL or SUPABASE_API environment variables.")

# --- Initialize Supabase client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Load dataset ---
df = pd.read_csv("/home/kirubha/Downloads/CTD_chemicals_diseases.csv", low_memory=False)

# --- Select only relevant columns ---
columns_needed = ["DiseaseName", "DiseaseID", "InferenceGeneSymbol", "InferenceScore"]
df = df[columns_needed].dropna(subset=["DiseaseName", "DiseaseID", "InferenceGeneSymbol", "InferenceScore"])

# --- Keep only unique InferenceGeneSymbol values ---
df_unique = df.drop_duplicates(subset=["InferenceGeneSymbol"]).head(50)

# --- Prepare data as list of dicts for Supabase ---
records = df_unique.to_dict(orient="records")

# --- Insert into Supabase table ---
try:
    response = supabase.table("Disease").insert(records).execute()
    print("✅ Successfully inserted records into Disease table.")
    print(f"Inserted: {len(records)} unique rows (based on InferenceGeneSymbol)")
except Exception as e:
    print("❌ Error inserting data:", e)
