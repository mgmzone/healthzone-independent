
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key from environment variables
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

// Generate HTML content based on email type
function generateEmailContent(type: EmailType, name: string, data?: Record<string, any>) {
  switch (type) {
    case "profile_completion":
      return {
        subject: "Complete Your HealthTrack Profile",
        html: `
          <h1>Hello ${name},</h1>
          <p>Your HealthTrack profile is not complete yet. Taking a few minutes to complete it will help us provide you with better insights.</p>
          <p><a href="${data?.appUrl || 'https://your-app-url.com'}/profile" style="padding: 12px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Complete Profile</a></p>
          <p>Thank you,<br>The HealthTrack Team</p>
        `,
      };
    case "inactivity_reminder":
      return {
        subject: "We Miss You at HealthTrack",
        html: `
          <h1>Hello ${name},</h1>
          <p>We noticed you haven't logged any activities on HealthTrack recently. Regular tracking helps you stay on top of your health goals.</p>
          <p><a href="${data?.appUrl || 'https://your-app-url.com'}/dashboard" style="padding: 12px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Visit Dashboard</a></p>
          <p>Thank you,<br>The HealthTrack Team</p>
        `,
      };
    case "weekly_summary":
      const { weighIns, fastingDays, exercises } = data || { weighIns: [], fastingDays: 0, exercises: [] };
      
      return {
        subject: "Your Weekly HealthTrack Summary",
        html: `
          <h1>Hello ${name},</h1>
          <p>Here's your weekly summary from HealthTrack:</p>
          
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="margin-top: 0;">Your Activity This Week</h2>
            <p>Weight tracking: ${weighIns?.length || 0} entries</p>
            <p>Fasting days: ${fastingDays || 0} days</p>
            <p>Exercise sessions: ${exercises?.length || 0} sessions</p>
          </div>
          
          <p><a href="${data?.appUrl || 'https://your-app-url.com'}/dashboard" style="padding: 12px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">View Full Report</a></p>
          <p>Thank you for using HealthTrack,<br>The HealthTrack Team</p>
        `,
      };
    default:
      return {
        subject: "HealthTrack Notification",
        html: `
          <h1>Hello ${name},</h1>
          <p>Thank you for using HealthTrack.</p>
          <p>The HealthTrack Team</p>
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
    const emailContent = generateEmailContent(type, name, data);

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "HealthTrack <onboarding@resend.dev>", // Update with your verified domain
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
