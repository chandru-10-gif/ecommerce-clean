import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xmxnuldsclrelnytwpse.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteG51bGRzY2xyZWxueXR3cHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNTgyMDgsImV4cCI6MjA5NjYzNDIwOH0.FHwvFCWtvp7tmv35drujISlcS1cqCv3DRbgsWV3r8_k"



export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);