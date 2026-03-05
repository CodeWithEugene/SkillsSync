import { keccak256, bytesToHex } from "viem"
import type { ExtractedSkill } from "@/lib/db"

/**
 * Normalized skill entry for canonical hashing (same fields, stable order).
 * Only fields that contribute to the attestation; no id, userId, evidenceText.
 */
export type SkillEntry = {
  skillName: string
  category: string | null
  skillType: "technical" | "soft" | "transferable"
  confidenceScore: number | null
}

function skillToEntry(s: ExtractedSkill): SkillEntry {
  return {
    skillName: s.skillName,
    category: s.category ?? null,
    skillType: s.skillType ?? "technical",
    confidenceScore: s.confidenceScore != null ? roundConfidence(s.confidenceScore) : null,
  }
}

/** Round to 2 decimal places for deterministic serialization */
function roundConfidence(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Build a canonical JSON string from skills (sorted by skillName for stability).
 * Same input always produces the same string.
 */
function canonicalSkillsPayload(skills: SkillEntry[]): string {
  const sorted = [...skills].sort((a, b) => a.skillName.localeCompare(b.skillName))
  return JSON.stringify(sorted)
}

/**
 * Compute the profile hash used on-chain (keccak256 of canonical UTF-8 payload).
 * Must match between API (verification) and frontend (submission).
 */
export function computeSkillsProfileHash(skills: ExtractedSkill[]): `0x${string}` {
  const entries = skills.map(skillToEntry)
  const canonical = canonicalSkillsPayload(entries)
  const utf8Bytes = new TextEncoder().encode(canonical)
  return keccak256(bytesToHex(utf8Bytes))
}
