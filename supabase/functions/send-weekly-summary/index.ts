
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key from environment variables
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client with admin privileges for the edge function
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Interface to model activity summary data
interface UserActivitySummary {
  userId: string;
  email: string;
  name: string;
  weighIns: number;
  fastingDays: number;
  exercises: number;
}

// Generate HTML for the weekly summary email
function generateWeeklySummaryEmail(name: string, data: {
  weighIns: number;
  fastingDays: number;
  exercises: number;
  appUrl: string;
}) {
  return {
    subject: "Your Weekly HealthTrack Summary",
    html: `
      <h1>Hello ${name},</h1>
      <p>Here's your weekly summary from HealthTrack:</p>
      
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="margin-top: 0;">Your Activity This Week</h2>
        <p>Weight tracking: ${data.weighIns} entries</p>
        <p>Fasting days: ${data.fastingDays} days</p>
        <p>Exercise sessions: ${data.exercises} sessions</p>
      </div>
      
      <p><a href="${data.appUrl}/dashboard" style="padding: 12px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">View Full Report</a></p>
      <p>Thank you for using HealthTrack,<br>The HealthTrack Team</p>
    `,
  };
}

// Get the URL of the app (for email links)
function getAppUrl(): string {
  const appUrl = Deno.env.get("APP_URL") || "";
  if (appUrl) return appUrl;
  
  // Fallback: Extract project URL from SUPABASE_URL
  // Remove the specific project reference and use the domain
  const supabaseUrlParts = supabaseUrl.split(".");
  if (supabaseUrlParts.length >= 2) {
    return `https://${supabaseUrlParts[0].replace("https://", "")}.vercel.app`;
  }
  
  return "https://your-app-url.com";
}

// Main handler for the edge function
const handler = async (_req: Request): Promise<Response> => {
  try {
    console.log("Starting weekly summary email job");
    
    // 1. Get users who have opted into weekly summary emails
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("weekly_summary_emails", true);

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }

    console.log(`Found ${profiles.length} users with weekly email preferences enabled`);
    
    // Prepare for batch processing
    const userSummaries: UserActivitySummary[] = [];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString();
    
    // 2. For each user, fetch their email and activity data
    for (const profile of profiles) {
      try {
        // Get user email from auth.users
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(profile.id);
        
        if (userError || !user.user) {
          console.error(`Error fetching user ${profile.id}: ${userError?.message}`);
          continue;
        }
        
        // Get weekly activity data
        const [weighInsResult, fastingLogsResult, exerciseLogsResult] = await Promise.all([
          // Weight logs
          supabase
            .from("weigh_ins")
            .select("id")
            .eq("user_id", profile.id)
            .gte("created_at", oneWeekAgoStr),
          
          // Fasting logs
          supabase
            .from("fasting_logs")
            .select("id")
            .eq("user_id", profile.id)
            .gte("created_at", oneWeekAgoStr),
          
          // Exercise logs
          supabase
            .from("exercise_logs")
            .select("id")
            .eq("user_id", profile.id)
            .gte("created_at", oneWeekAgoStr)
        ]);

        userSummaries.push({
          userId: profile.id,
          email: user.user.email || "",
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "there",
          weighIns: weighInsResult.data?.length || 0,
          fastingDays: fastingLogsResult.data?.length || 0,
          exercises: exerciseLogsResult.data?.length || 0
        });
      } catch (error) {
        console.error(`Error processing user ${profile.id}:`, error);
      }
    }
    
    // 3. Send emails to each user
    console.log(`Preparing to send ${userSummaries.length} summary emails`);
    const appUrl = getAppUrl();
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const summary of userSummaries) {
      try {
        // Skip if no email
        if (!summary.email) {
          console.warn(`No email found for user ${summary.userId}`);
          continue;
        }
        
        // Generate and send email
        const emailContent = generateWeeklySummaryEmail(summary.name, {
          weighIns: summary.weighIns,
          fastingDays: summary.fastingDays,
          exercises: summary.exercises,
          appUrl
        });
        
        const emailResponse = await resend.emails.send({
          from: "HealthTrack <onboarding@resend.dev>", // Update with your verified domain
          to: [summary.email],
          subject: emailContent.subject,
          html: emailContent.html,
        });
        
        console.log(`Sent weekly summary to ${summary.email} (${summary.userId})`);
        successCount++;
      } catch (error) {
        console.error(`Error sending email to ${summary.email}:`, error);
        errorCount++;
      }
    }
    
    // 4. Return results
    return new Response(
      JSON.stringify({
        success: true,
        message: `Weekly summary complete. Sent ${successCount} emails with ${errorCount} errors.`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in weekly summary job:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Start the server
serve(handler);
