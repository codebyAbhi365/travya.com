import { supabase } from "../lib/supabase";

export async function listTourists() {
  const { data, error } = await supabase
    .from("tourists")
    .select("id, created_at, fullname, email, phoneno, nationality, checkindate, checkoutdate, photo, documentno, documenttype, registrationpoint, verified")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getTouristByPassport(documentNo) {
  const cleaned = String(documentNo || "").trim();
  if (!cleaned) throw new Error("documentNo required");
  let { data, error } = await supabase
    .from("tourists")
    .select("id, created_at, fullname, email, phoneno, nationality, photo, documenttype, documentno, registrationpoint, checkindate, checkoutdate, verified")
    .ilike("documentno", cleaned)
    .maybeSingle();
  if (error) {
    const fb = await supabase
      .from("tourists")
      .select("id, created_at, fullname, email, phoneno, nationality, photo, documenttype, documentno, registrationpoint, checkindate, checkoutdate, verified")
      .eq("documentno", cleaned)
      .maybeSingle();
    if (fb.error) {
      const batch = await supabase
        .from("tourists")
        .select("id, created_at, fullname, email, phoneno, nationality, photo, documenttype, documentno, registrationpoint, checkindate, checkoutdate, verified")
        .limit(500);
      if (batch.error) throw new Error(batch.error.message);
      const norm = (s) => String(s || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const target = norm(cleaned);
      const found = (batch.data || []).find((r) => norm(r.documentno) === target);
      if (!found) throw new Error("No tourist found for this passport");
      data = found;
    } else {
      data = fb.data;
    }
  }
  if (!data) throw new Error("No tourist found for this passport");
  return data;
}

export async function verifyTourist({ id, documentNo }) {
  const idStr = id != null ? String(id) : null;
  const doc = documentNo != null ? String(documentNo) : "";
  if (!idStr && !doc) throw new Error("id or documentNo is required");
  if (idStr) {
    const { data, error } = await supabase.functions.invoke('verify-tourist', { body: { id: idStr } });
    if (error) throw new Error(error.message || 'Verify failed');
    return data?.tourist || data;
  }
  let find = await supabase
    .from("tourists")
    .select("id, fullname, documentno, verified")
    .ilike("documentno", doc)
    .limit(1)
    .maybeSingle();
  if (find.error) {
    const fb = await supabase
      .from("tourists")
      .select("id, fullname, documentno, verified")
      .eq("documentno", doc)
      .limit(1)
      .maybeSingle();
    if (fb.error) {
      const batch = await supabase
        .from("tourists")
        .select("id, fullname, documentno, verified")
        .limit(500);
      if (batch.error) throw new Error(batch.error.message);
      const norm = (s) => String(s || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const target = norm(doc);
      const targetRow = (batch.data || []).find((r) => norm(r.documentno) === target);
      if (!targetRow) throw new Error("No tourist found for this passport");
      find = { data: targetRow };
    } else {
      find = fb;
    }
  }
  if (!find.data) throw new Error("No tourist found for this passport");
  const { data, error } = await supabase.functions.invoke('verify-tourist', { body: { id: find.data.id, documentNo: doc } });
  if (error) throw new Error(error.message || 'Verify failed');
  return data?.tourist || data;
}

export async function registerTourist({ formData, photoFile, documentPhotoFile }) {
  if (!formData) throw new Error("formData required");
  const existing = await supabase.from("tourists").select("id").eq("email", formData.email).maybeSingle();
  if (existing?.data?.id) throw new Error("A tourist with this email is already registered");

  let photoUrl = null;
  let documentPhotoUrl = null;
  if (photoFile) {
    const path = `photos/${Date.now()}_${photoFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("tourist-assets")
      .upload(path, photoFile, { contentType: photoFile.type, upsert: false });
    if (uploadError) throw new Error("Photo upload failed: " + uploadError.message);
    const { data: publicUrl } = supabase.storage.from("tourist-assets").getPublicUrl(uploadData.path);
    photoUrl = publicUrl.publicUrl;
  }
  if (documentPhotoFile) {
    const path = `documents/${Date.now()}_${documentPhotoFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("tourist-assets")
      .upload(path, documentPhotoFile, { contentType: documentPhotoFile.type, upsert: false });
    if (uploadError) throw new Error("Document photo upload failed: " + uploadError.message);
    const { data: publicUrl } = supabase.storage.from("tourist-assets").getPublicUrl(uploadData.path);
    documentPhotoUrl = publicUrl.publicUrl;
  }

  const row = {
    fullname: formData.fullName,
    email: formData.email,
    phoneno: formData.phoneNo,
    nationality: formData.nationality,
    photo: photoUrl,
    documenttype: formData.documentType,
    documentno: formData.documentNo,
    documentphoto: documentPhotoUrl,
    registrationpoint: formData.registrationPoint,
    checkindate: String(formData.checkInDate).slice(0, 10),
    checkoutdate: String(formData.checkOutDate).slice(0, 10),
    emergencycontacts: formData.emergencyContacts,
    travelitinerary: formData.travelItinerary,
    verified: false,
  };

  let insertRes = await supabase.from("tourists").insert([row]).select().single();
  if (insertRes.error && String(insertRes.error.message || "").includes("verified")) {
    const { verified, ...noVerified } = row;
    insertRes = await supabase.from("tourists").insert([noVerified]).select().single();
  }
  if (insertRes.error) throw new Error(insertRes.error.message);
  return insertRes.data;
}


