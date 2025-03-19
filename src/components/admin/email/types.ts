
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

// Import EmailType directly instead of re-exporting it
import { EmailType } from '@/lib/services/emailService';
export { EmailType };
