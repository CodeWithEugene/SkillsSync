/**
 * Query layer for the offline O*NET database (tables populated by
 * `pnpm onet:import`). All reads go through Supabase so RLS-anon policies
 * apply — these tables are reference data, readable by everyone.
 */
import { createClient } from "@/lib/supabase/server"

export type OnetOccupation = {
  socCode: string
  title: string
  description: string | null
}

export type OnetRequiredSkill = {
  elementId: string
  elementName: string
  importance: number          // O*NET 1.0–5.0 (Scale ID = IM)
  level: number | null        // O*NET 1.0–7.0 (Scale ID = LV), if present
  description: string | null  // From content_model_reference
}

const DEFAULT_IMPORTANCE_THRESHOLD = 3.0

function mapOccupationFromDb(row: any): OnetOccupation {
  return {
    socCode: row.soc_code,
    title: row.title,
    description: row.description,
  }
}

/**
 * Fuzzy keyword search on occupation title + description.
 * Used by the onboarding picker to resolve "Software Engineer" → 15-1252.00.
 * Falls back to ILIKE if pg_trgm similarity isn't available.
 */
export async function searchOccupations(query: string, limit = 10): Promise<OnetOccupation[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("onet_occupations")
    .select("*")
    .or(`title.ilike.%${trimmed}%,description.ilike.%${trimmed}%`)
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(mapOccupationFromDb)
}

export async function getOccupationByCode(socCode: string): Promise<OnetOccupation | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("onet_occupations")
    .select("*")
    .eq("soc_code", socCode)
    .maybeSingle()

  if (error) throw error
  return data ? mapOccupationFromDb(data) : null
}

/**
 * Required skills for an occupation. Filters to Importance scale (Scale ID = IM)
 * with data_value >= threshold (default 3.0 of 5.0 ≈ "important").
 * Joins Level scale (LV) and content-model description so the UI can show
 * "Programming — Importance 4.5/5, typical level 6/7, definition: …".
 */
export async function getRequiredSkillsForOccupation(
  socCode: string,
  minImportance: number = DEFAULT_IMPORTANCE_THRESHOLD,
): Promise<OnetRequiredSkill[]> {
  const supabase = await createClient()

  const { data: skillRows, error } = await supabase
    .from("onet_skills")
    .select("element_id, element_name, scale_id, data_value")
    .eq("soc_code", socCode)

  if (error) throw error
  if (!skillRows || skillRows.length === 0) return []

  // Group by element_id: one IM row + (optionally) one LV row per skill
  type Row = { element_id: string; element_name: string; scale_id: string; data_value: number }
  const byElement = new Map<string, { name: string; im: number | null; lv: number | null }>()
  for (const row of skillRows as Row[]) {
    const entry = byElement.get(row.element_id) ?? { name: row.element_name, im: null, lv: null }
    if (row.scale_id === "IM") entry.im = Number(row.data_value)
    else if (row.scale_id === "LV") entry.lv = Number(row.data_value)
    byElement.set(row.element_id, entry)
  }

  // Look up descriptions for the elements that pass the threshold
  const passing = [...byElement.entries()].filter(
    ([, v]) => v.im != null && v.im >= minImportance,
  )
  const elementIds = passing.map(([id]) => id)

  let descriptions = new Map<string, string | null>()
  if (elementIds.length > 0) {
    const { data: cmRows, error: cmError } = await supabase
      .from("onet_content_model")
      .select("element_id, description")
      .in("element_id", elementIds)
    if (cmError) throw cmError
    descriptions = new Map((cmRows ?? []).map((r: any) => [r.element_id, r.description ?? null]))
  }

  return passing
    .map(([elementId, v]) => ({
      elementId,
      elementName: v.name,
      importance: v.im as number,
      level: v.lv,
      description: descriptions.get(elementId) ?? null,
    }))
    .sort((a, b) => b.importance - a.importance)
}
