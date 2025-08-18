
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key from environment variables
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client with admin privileges for the edge function
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "http://localhost:8080",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Email template types
export type EmailType = 
  | "profile_completion" 
  | "inactivity_reminder" 
  | "weekly_summary";

// Email request structure
interface EmailRequest {
  type: EmailType;
  email: string;
  name: string;
  data?: Record<string, any>;
}

// Sanitize HTML content to prevent XSS attacks
function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Replace placeholders in a string with actual values
function replacePlaceholders(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (data[key] !== undefined) {
      // Sanitize the replacement value to prevent XSS
      const value = String(data[key]);
      return sanitizeHtml(value);
    }
    return match;
  });
}

// Get email template from the database
async function getEmailTemplate(type: EmailType): Promise<{ subject: string; html: string } | null> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('subject, html_content')
    .eq('type', type)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Error fetching email template:', error);
    return null;
  }

  return {
    subject: data.subject,
    html: data.html_content
  };
}

// Generate HTML content based on email type
async function generateEmailContent(type: EmailType, name: string, data?: Record<string, any>) {
  // Default values
  const placeholders = {
    name,
    appUrl: data?.appUrl || 'https://your-app-url.com',
    ...data
  };
  
  // Try to get template from database
  const template = await getEmailTemplate(type);
  
  if (template) {
    return {
      subject: replacePlaceholders(template.subject, placeholders),
      html: replacePlaceholders(template.html, placeholders),
    };
  }
  
  // Fallback templates if database template is not available
  switch (type) {
    case "profile_completion":
      return {
        subject: "Complete Your HealthZone Profile",
        html: `
          <h1>Hello ${name},</h1>
          <p>Your HealthZone profile is not complete yet. Taking a few minutes to complete it will help us provide you with better insights.</p>
          <p><a href="${placeholders.appUrl}/profile" style="padding: 12px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Complete Profile</a></p>
          <p>Thank you,<br>The HealthZone Team</p>
        `,
      };
    case "inactivity_reminder":
      return {
        subject: "We Miss You at HealthZone",
        html: `
          <h1>Hello ${name},</h1>
          <p>We noticed you haven't logged any activities on HealthZone recently. Regular tracking helps you stay on top of your health goals.</p>
          <p><a href="${placeholders.appUrl}/dashboard" style="padding: 12px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Visit Dashboard</a></p>
          <p>Thank you,<br>The HealthZone Team</p>
        `,
      };
    case "weekly_summary":
      return {
        subject: "Your Weekly HealthZone Summary",
        html: `
          <h1>Hello ${name},</h1>
          <p>Here's your weekly summary from HealthZone:</p>
          
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="margin-top: 0;">Your Activity This Week</h2>
            <p>Weight tracking: ${placeholders.weighIns || 0} entries</p>
            <p>Fasting days: ${placeholders.fastingDays || 0} days</p>
            <p>Exercise sessions: ${placeholders.exercises || 0} sessions</p>
          </div>
          
          <p><a href="${placeholders.appUrl}/dashboard" style="padding: 12px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">View Full Report</a></p>
          <p>Thank you for using HealthZone,<br>The HealthZone Team</p>
        `,
      };
    default:
      return {
        subject: "HealthZone Notification",
        html: `
          <h1>Hello ${name},</h1>
          <p>Thank you for using HealthZone.</p>
          <p>The HealthZone Team</p>
        `,
      };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { type, email, name, data }: EmailRequest = await req.json();

    console.log(`Processing email request of type: ${type} for ${email}`);

    // Generate the email content based on the type
    const emailContent = await generateEmailContent(type, name, data);

    // Send the email
    const fromEmail = Deno.env.get("FROM_EMAIL") || "HealthZone <noreply@yourdomain.com>";
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Return success response
    return new Response(JSON.stringify({ success: true, id: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Start the server
serve(handler);
