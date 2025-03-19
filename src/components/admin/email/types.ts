
// Template interface
export interface EmailTemplate {
  id: string;
  type: EmailType;
  subject: string;
  html_content: string;
  is_active: boolean;
  created_at: string;
}

// Template form values
export interface TemplateFormValues {
  id?: string;
  subject: string;
  html_content: string;
}

// Re-export the EmailType to avoid importing from multiple places
export type { EmailType } from '@/lib/services/emailService';
