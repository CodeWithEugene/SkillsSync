import { createClient } from "@/lib/supabase/server"

export type Document = {
  id: string
  userId: string
  filename: string
  fileUrl: string
  status: "PROCESSING" | "COMPLETED" | "FAILED"
  uploadDate: string
}

export type ExtractedSkill = {
  id: string
  userId: string
  documentId: string
  skillName: string
  category: string | null
  skillType: "technical" | "soft" | "transferable"
  confidenceScore: number | null
  evidenceText: string | null
  createdAt: string
}

export type UserGoal = {
  id: string
  userId: string
  currentStudy: string | null
  wantToStudy: string | null
  studyDuration: string | null
  careerGoal: string | null
  skillGoal: string | null
  educationLevel: string | null
  studyYear: string | null
  topPriority: string | null
  courses: string | null
  isPublic: boolean
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

export type CareerGuidance = {
  id: string
  userId: string
  careerGoal: string
  readinessScore: number
  summary: string
  strengths: string[]
  gaps: Array<{ skill: string; importance: string; suggestion: string }>
  recommendations: string[]
  createdAt: string
}

export type SkillHistory = {
  id: string
  userId: string
  documentId: string | null
  snapshot: {
    technical: number
    soft: number
    transferable: number
    total: number
    topCategories: string[]
  }
  recordedAt: string
}

function mapDocumentFromDb(doc: any): Document {
  return {
    id: doc.id,
    userId: doc.user_id,
    filename: doc.filename,
    fileUrl: doc.file_url,
    status: doc.status,
    uploadDate: doc.upload_date,
  }
}

function mapSkillFromDb(skill: any): ExtractedSkill {
  return {
    id: skill.id,
    userId: skill.user_id,
    documentId: skill.document_id,
    skillName: skill.skill_name,
    category: skill.category,
    skillType: skill.skill_type ?? "technical",
    confidenceScore: skill.confidence_score,
    evidenceText: skill.evidence_text,
    createdAt: skill.created_at,
  }
}

function mapUserGoalFromDb(goal: any): UserGoal {
  return {
    id: goal.id,
    userId: goal.user_id,
    currentStudy: goal.current_study,
    wantToStudy: goal.want_to_study,
    studyDuration: goal.study_duration,
    careerGoal: goal.career_goal,
    skillGoal: goal.skill_goal,
    educationLevel: goal.education_level,
    studyYear: goal.study_year,
    topPriority: goal.top_priority,
    courses: goal.courses,
    isPublic: goal.is_public ?? false,
    onboardingCompleted: goal.onboarding_completed,
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
  }
}

function mapCareerGuidanceFromDb(row: any): CareerGuidance {
  return {
    id: row.id,
    userId: row.user_id,
    careerGoal: row.career_goal,
    readinessScore: row.readiness_score,
    summary: row.summary,
    strengths: row.strengths ?? [],
    gaps: row.gaps ?? [],
    recommendations: row.recommendations ?? [],
    createdAt: row.created_at,
  }
}

function mapSkillHistoryFromDb(row: any): SkillHistory {
  return {
    id: row.id,
    userId: row.user_id,
    documentId: row.document_id,
    snapshot: row.snapshot,
    recordedAt: row.recorded_at,
  }
}

export async function createDocument(userId: string, filename: string, fileUrl: string): Promise<Document> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      filename,
      file_url: fileUrl,
      status: "PROCESSING",
    })
    .select()
    .single()

  if (error) throw error
  return mapDocumentFromDb(data)
}

export async function getDocuments(userId: string): Promise<Document[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("upload_date", { ascending: false })

  if (error) throw error
  return (data || []).map(mapDocumentFromDb)
}

export async function updateDocumentStatus(
  documentId: string,
  status: "PROCESSING" | "COMPLETED" | "FAILED",
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("documents").update({ status }).eq("id", documentId)

  if (error) throw error
}

export async function createExtractedSkill(
  userId: string,
  documentId: string,
  skillName: string,
  category: string | null = null,
  confidenceScore: number | null = null,
  evidenceText: string | null = null,
  skillType: "technical" | "soft" | "transferable" = "technical",
): Promise<ExtractedSkill> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("extracted_skills")
    .insert({
      user_id: userId,
      document_id: documentId,
      skill_name: skillName,
      category,
      confidence_score: confidenceScore,
      evidence_text: evidenceText,
      skill_type: skillType,
    })
    .select()
    .single()

  if (error) throw error
  return mapSkillFromDb(data)
}

export async function getExtractedSkills(userId: string): Promise<ExtractedSkill[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("extracted_skills")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data || []).map(mapSkillFromDb)
}

export async function getExtractedSkillsByDocument(documentId: string): Promise<ExtractedSkill[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("extracted_skills")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data || []).map(mapSkillFromDb)
}

export async function getUserGoal(userId: string): Promise<UserGoal | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("user_goals").select("*").eq("user_id", userId).single()

  if (error) {
    if (error.code === "PGRST116") return null // Not found
    throw error
  }
  return data ? mapUserGoalFromDb(data) : null
}

export async function createUserGoal(
  userId: string,
  goalData: {
    currentStudy?: string
    wantToStudy?: string
    studyDuration?: string
    careerGoal?: string
    skillGoal?: string
    educationLevel?: string
    studyYear?: string
    topPriority?: string
    courses?: string
  },
): Promise<UserGoal> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_goals")
    .insert({
      user_id: userId,
      current_study: goalData.currentStudy,
      want_to_study: goalData.wantToStudy,
      study_duration: goalData.studyDuration,
      career_goal: goalData.careerGoal,
      skill_goal: goalData.skillGoal,
      education_level: goalData.educationLevel,
      study_year: goalData.studyYear,
      top_priority: goalData.topPriority,
      courses: goalData.courses,
      onboarding_completed: true,
    })
    .select()
    .single()

  if (error) throw error
  return mapUserGoalFromDb(data)
}

export async function updateUserGoal(
  userId: string,
  goalData: {
    currentStudy?: string
    wantToStudy?: string
    studyDuration?: string
    careerGoal?: string
    skillGoal?: string
    educationLevel?: string
    studyYear?: string
    topPriority?: string
    courses?: string
  },
): Promise<UserGoal> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_goals")
    .update({
      current_study: goalData.currentStudy,
      want_to_study: goalData.wantToStudy,
      study_duration: goalData.studyDuration,
      career_goal: goalData.careerGoal,
      skill_goal: goalData.skillGoal,
      education_level: goalData.educationLevel,
      study_year: goalData.studyYear,
      top_priority: goalData.topPriority,
      courses: goalData.courses,
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return mapUserGoalFromDb(data)
}

// ── Career Guidance ───────────────────────────────────────────────────────────

export async function getCareerGuidance(userId: string): Promise<CareerGuidance | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("career_guidance")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data ? mapCareerGuidanceFromDb(data) : null
}

export async function upsertCareerGuidance(
  userId: string,
  guidance: {
    careerGoal: string
    readinessScore: number
    summary: string
    strengths: string[]
    gaps: Array<{ skill: string; importance: string; suggestion: string }>
    recommendations: string[]
  },
): Promise<CareerGuidance> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("career_guidance")
    .upsert(
      {
        user_id: userId,
        career_goal: guidance.careerGoal,
        readiness_score: guidance.readinessScore,
        summary: guidance.summary,
        strengths: guidance.strengths,
        gaps: guidance.gaps,
        recommendations: guidance.recommendations,
      },
      { onConflict: "user_id" },
    )
    .select()
    .single()

  if (error) throw error
  return mapCareerGuidanceFromDb(data)
}

// ── Skill History ─────────────────────────────────────────────────────────────

export async function addSkillHistorySnapshot(
  userId: string,
  documentId: string,
  snapshot: SkillHistory["snapshot"],
): Promise<SkillHistory> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("skill_history")
    .insert({ user_id: userId, document_id: documentId, snapshot })
    .select()
    .single()

  if (error) throw error
  return mapSkillHistoryFromDb(data)
}

export async function getSkillHistory(userId: string): Promise<SkillHistory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("skill_history")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapSkillHistoryFromDb)
}

// ── Public Profile ────────────────────────────────────────────────────────────

export async function toggleProfilePublic(userId: string, isPublic: boolean): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("user_goals")
    .update({ is_public: isPublic })
    .eq("user_id", userId)
  if (error) throw error
}

export type PublicProfile = {
  userId: string
  careerGoal: string | null
  skillGoal: string | null
  currentStudy: string | null
  skills: Array<{ skillName: string; category: string | null; skillType: string }>
  guidance: CareerGuidance | null
}

export async function getPublicUserProfile(userId: string): Promise<PublicProfile | null> {
  // Uses admin client so RLS does not block public reads.
  // We only expose data when is_public = true.
  const { createAdminClient } = await import("@/lib/supabase/admin")
  const admin = createAdminClient()

  const { data: goal, error: goalError } = await admin
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_public", true)
    .maybeSingle()

  if (goalError || !goal) return null

  const { data: skillRows } = await admin
    .from("extracted_skills")
    .select("skill_name, category, skill_type")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const { data: guidanceRow } = await admin
    .from("career_guidance")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  return {
    userId,
    careerGoal: goal.career_goal,
    skillGoal: goal.skill_goal,
    currentStudy: goal.current_study,
    skills: (skillRows ?? []).map((s: any) => ({
      skillName: s.skill_name,
      category: s.category,
      skillType: s.skill_type ?? "technical",
    })),
    guidance: guidanceRow ? mapCareerGuidanceFromDb(guidanceRow) : null,
  }
}

// ── Courses ───────────────────────────────────────────────────────────────────

export type Course = {
  id: string
  userId: string
  name: string
  provider: string | null
  url: string | null
  status: "planned" | "enrolled" | "completed"
  skillTags: string[]
  notes: string | null
  createdAt: string
  updatedAt: string
}

function mapCourseFromDb(row: any): Course {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    provider: row.provider,
    url: row.url,
    status: row.status,
    skillTags: row.skill_tags ?? [],
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getCourses(userId: string): Promise<Course[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapCourseFromDb)
}

export async function createCourse(
  userId: string,
  params: { name: string; provider?: string; url?: string; status?: Course["status"]; skillTags?: string[]; notes?: string },
): Promise<Course> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("courses")
    .insert({
      user_id: userId,
      name: params.name,
      provider: params.provider ?? null,
      url: params.url ?? null,
      status: params.status ?? "planned",
      skill_tags: params.skillTags ?? [],
      notes: params.notes ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return mapCourseFromDb(data)
}

export async function updateCourse(
  courseId: string,
  userId: string,
  updates: Partial<{ name: string; provider: string; url: string; status: Course["status"]; skillTags: string[]; notes: string }>,
): Promise<Course> {
  const supabase = await createClient()
  const dbUpdates: any = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.provider !== undefined) dbUpdates.provider = updates.provider
  if (updates.url !== undefined) dbUpdates.url = updates.url
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.skillTags !== undefined) dbUpdates.skill_tags = updates.skillTags
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes

  const { data, error } = await supabase
    .from("courses")
    .update(dbUpdates)
    .eq("id", courseId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return mapCourseFromDb(data)
}

export async function deleteCourse(courseId: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .eq("user_id", userId)

  if (error) throw error
}
