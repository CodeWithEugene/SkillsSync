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
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
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
    onboardingCompleted: goal.onboarding_completed,
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
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
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return mapUserGoalFromDb(data)
}
