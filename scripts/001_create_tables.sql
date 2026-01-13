-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROCESSING',
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create extracted_skills table
CREATE TABLE IF NOT EXISTS extracted_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT,
  confidence_score NUMERIC,
  evidence_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents table
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for extracted_skills table
CREATE POLICY "Users can view their own skills"
  ON extracted_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills"
  ON extracted_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON extracted_skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON extracted_skills FOR DELETE
  USING (auth.uid() = user_id);
