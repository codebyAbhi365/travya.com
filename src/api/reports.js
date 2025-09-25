import { supabase } from "../lib/supabase";

export async function createReport({ areaName, description, latitude, longitude, reporterName, reporterPhone, radius_km, status_color }) {
  if (!areaName || !description) throw new Error("areaName and description are required");
  const payload = {
    area_name: areaName,
    description,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    reporter_name: reporterName ?? null,
    reporter_phone: reporterPhone ?? null,
    radius_km: typeof radius_km === "number" ? radius_km : (radius_km ? Number(radius_km) : null),
    status_color: status_color ?? null,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("reports").insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listReports() {
  const { data, error } = await supabase
    .from("reports")
    .select("id, area_name, description, latitude, longitude, reporter_name, reporter_phone, radius_km, status_color, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data || [];
}


