/**
 * seed_demo_user.mjs
 *
 * Creates a demo user account in Supabase with realistic data across
 * every table: user_goals, documents, extracted_skills, career_guidance,
 * skill_history, and courses.
 *
 * Run:  node scripts/seed_demo_user.mjs
 *
 * Requires the project .env to be present (reads env vars via dotenv).
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

// ─── Load .env manually (no dotenv package needed — pure Node.js) ────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, "../.env")
const envLines = readFileSync(envPath, "utf-8").split("\n")
for (const line of envLines) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  const val = trimmed.slice(eqIdx + 1).trim()
  if (!process.env[key]) process.env[key] = val
}

// ─── Supabase admin client ────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── Demo credentials ─────────────────────────────────────────────────────────
const DEMO_EMAIL    = "demo@skillsync.app"
const DEMO_PASSWORD = "SkillSync@Demo2026"
const DEMO_NAME     = "Alex Rivera"

// ─── Helpers ─────────────────────────────────────────────────────────────────
function abort(msg, err) {
  console.error(`\n❌  ${msg}`)
  if (err) console.error(err)
  process.exit(1)
}

// ─── Step 1 — create / reuse the auth user ───────────────────────────────────
async function upsertUser() {
  console.log("👤  Checking for existing demo user …")

  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) abort("Could not list users", listErr)

  const existing = listData.users.find(u => u.email === DEMO_EMAIL)
  if (existing) {
    console.log(`   ↩  Found existing user: ${existing.id}`)
    // Make sure password is current
    await supabase.auth.admin.updateUserById(existing.id, { password: DEMO_PASSWORD })
    return existing.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: DEMO_NAME },
  })
  if (error) abort("Could not create demo user", error)
  console.log(`   ✅  Created user: ${data.user.id}`)
  return data.user.id
}

// ─── Step 2 — wipe existing demo data (idempotent re-runs) ───────────────────
async function wipeExisting(userId) {
  console.log("🗑   Wiping existing demo data …")
  await supabase.from("courses").delete().eq("user_id", userId)
  await supabase.from("skill_history").delete().eq("user_id", userId)
  await supabase.from("career_guidance").delete().eq("user_id", userId)
  await supabase.from("extracted_skills").delete().eq("user_id", userId)
  await supabase.from("documents").delete().eq("user_id", userId)
  await supabase.from("user_goals").delete().eq("user_id", userId)
  console.log("   ✅  Wiped")
}

// ─── Step 3 — user_goals ─────────────────────────────────────────────────────
async function seedUserGoal(userId) {
  console.log("🎯  Seeding user_goals …")
  const { error } = await supabase.from("user_goals").insert({
    user_id:              userId,
    education_level:      "undergraduate",
    current_study:        "Computer Science",
    study_year:           "3rd Year",
    career_goal:          "Full-Stack Software Engineer",
    top_priority:         "Land a software engineering internship at a top tech company",
    is_public:            true,
    onboarding_completed: true,
  })
  if (error) abort("user_goals insert failed", error)
  console.log("   ✅  Done")
}

// ─── Step 4 — documents + extracted_skills ───────────────────────────────────
async function seedDocumentsAndSkills(userId) {
  console.log("📄  Seeding documents + extracted_skills …")

  const docs = [
    {
      filename: "Alex_Rivera_Resume_2025.txt",
      file_url: "https://uhgejyqqwefbpwxvnjqi.supabase.co/storage/v1/object/public/coursework/demo/resume.txt",
      status:   "COMPLETED",
      upload_date: new Date("2026-01-10T09:15:00Z").toISOString(),
      skills: [
        { skill_name: "React",          category: "Frontend",         skill_type: "technical",     confidence_score: 0.96, evidence_text: "Built 4 production React apps with hooks and context API" },
        { skill_name: "TypeScript",     category: "Programming",      skill_type: "technical",     confidence_score: 0.94, evidence_text: "All projects use strict TypeScript with typed API contracts" },
        { skill_name: "Node.js",        category: "Backend",          skill_type: "technical",     confidence_score: 0.92, evidence_text: "REST APIs and GraphQL services built with Node + Express" },
        { skill_name: "PostgreSQL",     category: "Databases",        skill_type: "technical",     confidence_score: 0.88, evidence_text: "Designed normalised schemas, wrote complex queries and migrations" },
        { skill_name: "Git & GitHub",   category: "DevOps",           skill_type: "technical",     confidence_score: 0.95, evidence_text: "Feature-branch workflow, PR reviews, GitHub Actions CI" },
        { skill_name: "Problem Solving",category: "Core Skills",      skill_type: "soft",          confidence_score: 0.90, evidence_text: "Led debugging sessions reducing incident resolution time by 40%" },
        { skill_name: "Communication",  category: "Soft Skills",      skill_type: "soft",          confidence_score: 0.87, evidence_text: "Presented technical findings to non-technical stakeholders" },
        { skill_name: "Agile / Scrum",  category: "Methodology",      skill_type: "transferable",  confidence_score: 0.85, evidence_text: "Participated in 2-week sprints with daily stand-ups" },
      ],
    },
    {
      filename: "CS_Transcript_2025.txt",
      file_url: "https://uhgejyqqwefbpwxvnjqi.supabase.co/storage/v1/object/public/coursework/demo/transcript.txt",
      status:   "COMPLETED",
      upload_date: new Date("2026-01-18T14:30:00Z").toISOString(),
      skills: [
        { skill_name: "Algorithms & Data Structures", category: "Computer Science",  skill_type: "technical",    confidence_score: 0.93, evidence_text: "A+ in Data Structures, top 5% of cohort" },
        { skill_name: "Python",                       category: "Programming",       skill_type: "technical",    confidence_score: 0.91, evidence_text: "Used Python for ML coursework and scripting projects" },
        { skill_name: "Machine Learning",             category: "AI / ML",           skill_type: "technical",    confidence_score: 0.82, evidence_text: "Coursework in supervised learning, CNNs, and NLP" },
        { skill_name: "Linux / Shell",                category: "Systems",           skill_type: "technical",    confidence_score: 0.80, evidence_text: "Systems programming course using C and Bash on Linux" },
        { skill_name: "Critical Thinking",            category: "Core Skills",       skill_type: "soft",         confidence_score: 0.89, evidence_text: "Dean's List for consistent academic performance" },
        { skill_name: "Research",                     category: "Academic",          skill_type: "transferable", confidence_score: 0.84, evidence_text: "Co-authored paper on distributed caching strategies" },
      ],
    },
    {
      filename: "Internship_Project_Report.txt",
      file_url: "https://uhgejyqqwefbpwxvnjqi.supabase.co/storage/v1/object/public/coursework/demo/report.txt",
      status:   "COMPLETED",
      upload_date: new Date("2026-02-02T11:00:00Z").toISOString(),
      skills: [
        { skill_name: "Next.js",        category: "Frontend",         skill_type: "technical",     confidence_score: 0.94, evidence_text: "Built company dashboard with Next.js 14 App Router" },
        { skill_name: "Tailwind CSS",   category: "Frontend",         skill_type: "technical",     confidence_score: 0.90, evidence_text: "Implemented full design system using Tailwind utility classes" },
        { skill_name: "Docker",         category: "DevOps",           skill_type: "technical",     confidence_score: 0.83, evidence_text: "Containerised the app for staging and production environments" },
        { skill_name: "REST API Design",category: "Backend",          skill_type: "technical",     confidence_score: 0.88, evidence_text: "Designed and documented REST endpoints following OpenAPI spec" },
        { skill_name: "Team Leadership",category: "Soft Skills",      skill_type: "soft",          confidence_score: 0.85, evidence_text: "Mentored 2 junior interns during the summer cohort" },
        { skill_name: "Project Management", category: "Methodology",  skill_type: "transferable",  confidence_score: 0.82, evidence_text: "Coordinated feature delivery across 3 teams using Jira" },
      ],
    },
  ]

  const insertedDocIds = []

  for (const doc of docs) {
    // Insert document
    const { data: docData, error: docErr } = await supabase
      .from("documents")
      .insert({
        user_id:     userId,
        filename:    doc.filename,
        file_url:    doc.file_url,
        status:      doc.status,
        upload_date: doc.upload_date,
      })
      .select("id")
      .single()

    if (docErr) abort(`document insert failed: ${doc.filename}`, docErr)
    const docId = docData.id
    insertedDocIds.push({ docId, uploadDate: doc.upload_date, skills: doc.skills })

    // Insert skills for this document
    const skillRows = doc.skills.map(s => ({
      user_id:          userId,
      document_id:      docId,
      skill_name:       s.skill_name,
      category:         s.category,
      skill_type:       s.skill_type,
      confidence_score: s.confidence_score,
      evidence_text:    s.evidence_text,
    }))

    const { error: skillErr } = await supabase.from("extracted_skills").insert(skillRows)
    if (skillErr) abort(`skills insert failed for ${doc.filename}`, skillErr)

    console.log(`   ✅  ${doc.filename} → ${doc.skills.length} skills`)
  }

  return insertedDocIds
}

// ─── Step 5 — skill_history (one snapshot per document) ──────────────────────
async function seedSkillHistory(userId, docSnapshots) {
  console.log("📈  Seeding skill_history …")

  // Running totals per snapshot
  let techCount = 0, softCount = 0, transCount = 0

  const snapshots = [
    {
      docId:       docSnapshots[0].docId,
      recordedAt:  docSnapshots[0].uploadDate,
      skills:      docSnapshots[0].skills,
      techDelta:   4, softDelta: 2, transDelta: 2,
      topCats:     ["Frontend", "Backend", "Soft Skills"],
    },
    {
      docId:       docSnapshots[1].docId,
      recordedAt:  docSnapshots[1].uploadDate,
      skills:      docSnapshots[1].skills,
      techDelta:   4, softDelta: 1, transDelta: 1,
      topCats:     ["Computer Science", "Programming", "AI / ML"],
    },
    {
      docId:       docSnapshots[2].docId,
      recordedAt:  docSnapshots[2].uploadDate,
      skills:      docSnapshots[2].skills,
      techDelta:   4, softDelta: 1, transDelta: 1,
      topCats:     ["Frontend", "DevOps", "Methodology"],
    },
  ]

  for (const s of snapshots) {
    techCount  += s.techDelta
    softCount  += s.softDelta
    transCount += s.transDelta

    const { error } = await supabase.from("skill_history").insert({
      user_id:     userId,
      document_id: s.docId,
      recorded_at: s.recordedAt,
      snapshot: {
        technical:    techCount,
        soft:         softCount,
        transferable: transCount,
        total:        techCount + softCount + transCount,
        topCategories: s.topCats,
      },
    })
    if (error) abort("skill_history insert failed", error)
  }

  console.log("   ✅  3 snapshots recorded")
}

// ─── Step 6 — career_guidance ─────────────────────────────────────────────────
async function seedCareerGuidance(userId) {
  console.log("🧠  Seeding career_guidance …")

  const { error } = await supabase.from("career_guidance").insert({
    user_id:        userId,
    career_goal:    "Full-Stack Software Engineer",
    readiness_score: 74,
    summary:        "Alex has a strong foundation in modern web development with hands-on React, TypeScript, and Node.js experience. The portfolio demonstrates real-world delivery capability. Key gaps are in system design, cloud infrastructure, and behavioural interview preparation.",
    strengths: [
      "Production-grade React & TypeScript proficiency",
      "End-to-end full-stack delivery across 3+ projects",
      "Strong academic grounding in algorithms and data structures",
      "Practical DevOps experience with Docker and CI/CD",
    ],
    gaps: [
      { skill: "System Design",         importance: "high",   suggestion: "Study distributed systems concepts — read 'Designing Data-Intensive Applications' and practice on Excalidraw" },
      { skill: "Cloud Platforms (AWS/GCP)", importance: "high", suggestion: "Complete AWS Solutions Architect Associate or Google Cloud Associate certification" },
      { skill: "GraphQL",               importance: "medium", suggestion: "Build a side project API with Apollo Server and integrate with a React client" },
      { skill: "Redis / Caching",       importance: "medium", suggestion: "Add Redis caching to an existing project and learn cache invalidation patterns" },
    ],
    recommendations: [
      "Apply to FAANG/top-tier internship programmes — your GPA and project depth are competitive",
      "Contribute to 1-2 open-source projects to build public GitHub activity",
      "Join a competitive programming platform (LeetCode / Codeforces) and solve 3 problems per week",
      "Complete the AWS Cloud Practitioner exam within 60 days",
      "Prepare STAR-format answers for 10 common behavioural interview questions",
    ],
    created_at: new Date("2026-02-05T08:00:00Z").toISOString(),
  })

  if (error) abort("career_guidance insert failed", error)
  console.log("   ✅  Done")
}

// ─── Step 7 — courses ─────────────────────────────────────────────────────────
async function seedCourses(userId) {
  console.log("📚  Seeding courses …")

  const courses = [
    {
      name:       "AWS Solutions Architect – Associate",
      provider:   "A Cloud Guru",
      url:        "https://acloudguru.com/course/aws-certified-solutions-architect-associate",
      status:     "enrolled",
      skill_tags: ["AWS", "Cloud", "System Design"],
      notes:      "Targeting the exam in April 2026. Watching 1 module per day.",
    },
    {
      name:       "Full-Stack Open 2025",
      provider:   "University of Helsinki",
      url:        "https://fullstackopen.com",
      status:     "completed",
      skill_tags: ["React", "Node.js", "GraphQL", "TypeScript"],
      notes:      "Completed all 13 parts including GraphQL and TypeScript modules.",
    },
    {
      name:       "Designing Data-Intensive Applications (Book)",
      provider:   "O'Reilly",
      url:        "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/",
      status:     "enrolled",
      skill_tags: ["System Design", "Databases", "Distributed Systems"],
      notes:      "On chapter 7 — Transaction Isolation Levels.",
    },
    {
      name:       "LeetCode 75 Study Plan",
      provider:   "LeetCode",
      url:        "https://leetcode.com/studyplan/leetcode-75/",
      status:     "enrolled",
      skill_tags: ["Algorithms", "Data Structures", "Problem Solving"],
      notes:      "Doing 3 problems per week. Currently at 42/75.",
    },
    {
      name:       "Docker & Kubernetes: The Complete Guide",
      provider:   "Udemy – Stephen Grider",
      url:        "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
      status:     "planned",
      skill_tags: ["Docker", "Kubernetes", "DevOps"],
      notes:      "Queued after AWS cert.",
    },
    {
      name:       "CS50's Introduction to AI with Python",
      provider:   "Harvard / edX",
      url:        "https://cs50.harvard.edu/ai/",
      status:     "completed",
      skill_tags: ["Machine Learning", "Python", "AI"],
      notes:      "Finished all problem sets. Grade: 100%.",
    },
  ]

  const rows = courses.map(c => ({
    user_id:    userId,
    name:       c.name,
    provider:   c.provider,
    url:        c.url,
    status:     c.status,
    skill_tags: c.skill_tags,
    notes:      c.notes,
  }))

  const { error } = await supabase.from("courses").insert(rows)
  if (error) abort("courses insert failed", error)
  console.log(`   ✅  ${rows.length} courses added`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🌱  SkillSync Demo User Seed Script")
  console.log("════════════════════════════════════\n")

  const userId = await upsertUser()
  await wipeExisting(userId)
  await seedUserGoal(userId)
  const docSnapshots = await seedDocumentsAndSkills(userId)
  await seedSkillHistory(userId, docSnapshots)
  await seedCareerGuidance(userId)
  await seedCourses(userId)

  console.log("\n════════════════════════════════════")
  console.log("✅  Seed complete!\n")
  console.log("  📧  Email    :", DEMO_EMAIL)
  console.log("  🔑  Password :", DEMO_PASSWORD)
  console.log("  👤  Name     :", DEMO_NAME)
  console.log("  🆔  User ID  :", userId)
  console.log("\nLog in at: http://localhost:3000/auth/login")
  console.log("════════════════════════════════════\n")
}

main().catch(err => {
  console.error("Unexpected error:", err)
  process.exit(1)
})
