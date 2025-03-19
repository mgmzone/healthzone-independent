
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/lib/types";

export type EmailType = 
  | "profile_completion" 
  | "inactivity_reminder" 
  | "weekly_summary";

export interface EmailRequest {
  type: EmailType;
  email: string;
  name: string;
  data?: Record<string, any>;
}

/**
 * Sends an email to a user using the Supabase Edge Function
 */
export async function sendEmail(request: EmailRequest): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`Sending ${request.type} email to ${request.email}`);
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: request
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, message: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Exception in sendEmail:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error sending email' 
    };
  }
}

/**
 * Updates the email preferences for a user
 */
export async function updateEmailPreferences(
  userId: string, 
  preferences: { 
    weeklyEmails?: boolean; 
    systemEmails?: boolean;
  }
): Promise<{ success: boolean; message?: string }> {
  try {
    const updates: Record<string, boolean> = {};
    
    if (preferences.weeklyEmails !== undefined) {
      updates.weekly_summary_emails = preferences.weeklyEmails;
    }
    
    if (preferences.systemEmails !== undefined) {
      updates.system_notification_emails = preferences.systemEmails;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating email preferences:', error);
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception in updateEmailPreferences:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error updating email preferences' 
    };
  }
}

/**
 * Gets the email preferences for a user
 */
export async function getEmailPreferences(userId: string): Promise<{ 
  weeklyEmails: boolean; 
  systemEmails: boolean;
  success: boolean; 
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('weekly_summary_emails, system_notification_emails')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting email preferences:', error);
      return { success: false, weeklyEmails: false, systemEmails: false };
    }

    return { 
      success: true, 
      weeklyEmails: data.weekly_summary_emails || false, 
      systemEmails: data.system_notification_emails || false
    };
  } catch (error) {
    console.error('Exception in getEmailPreferences:', error);
    return { success: false, weeklyEmails: false, systemEmails: false };
  }
}

/**
 * Creates a scheduled function to send profile completion reminders
 * This helper is for illustration - would be triggered by a cron job
 */
export async function sendProfileCompletionReminders(): Promise<void> {
  try {
    // Get all users who haven't completed their profiles and have opted into system emails
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, system_notification_emails')
      .or('birth_date.is.null,gender.is.null,height.is.null,target_weight.is.null')
      .eq('system_notification_emails', true);

    if (error) {
      console.error('Error fetching incomplete profiles:', error);
      return;
    }

    // Fetch email addresses from auth.users (needs to be done in an edge function with admin rights)
    // For now, we'll use a mock implementation
    const appUrl = window.location.origin;

    for (const profile of profiles) {
      // In a real implementation, you would look up the email from auth.users
      // For now we'll use a helper function to get the user's email
      const userEmail = await getUserEmail(profile.id);
      
      if (userEmail) {
        await sendEmail({
          type: 'profile_completion',
          email: userEmail,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'there',
          data: { appUrl }
        });
      }
    }
  } catch (error) {
    console.error('Error sending profile completion reminders:', error);
  }
}

// Helper function to get a user's email from their ID
// In a real implementation, this would be done in an edge function with admin rights
async function getUserEmail(userId: string): Promise<string | null> {
  try {
    // This will only work if the email is also stored in the profiles table
    // For security reasons, you can't directly query auth.users from the client
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      console.error('Error getting session:', error);
      return null;
    }
    
    if (data.session.user.id === userId) {
      return data.session.user.email;
    }
    
    // If the user is not the current user, we would need an admin function
    // For now, return null
    return null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}
