-- Add AI-related columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS claude_api_key text,
  ADD COLUMN IF NOT EXISTS ai_prompt text;

-- Add AI-related columns to meal_logs
ALTER TABLE meal_logs
  ADD COLUMN IF NOT EXISTS ai_assessment text,
  ADD COLUMN IF NOT EXISTS ai_protein_estimate numeric;
