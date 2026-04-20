import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface CheckEmailCardProps {
  email: string;
  onUseDifferentEmail: () => void;
}

const CheckEmailCard: React.FC<CheckEmailCardProps> = ({ email, onUseDifferentEmail }) => {
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      toast({
        title: 'Email sent',
        description: `A new confirmation link is on its way to ${email}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Could not resend',
        description: err?.message || 'Please try again in a minute.',
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Check your email</CardTitle>
        <CardDescription className="text-center">
          We sent a confirmation link to<br />
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            The email comes from <strong>HealthZone &lt;healthzone@mgm.zone&gt;</strong>. If you don't see it
            in a few minutes, check your <strong>Junk</strong> or <strong>Spam</strong> folder — Outlook
            and MSN accounts especially tend to route new senders there. Marking it as "not junk" will
            help future HealthZone emails land in your inbox.
          </AlertDescription>
        </Alert>

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Once you click the link, you'll be taken to the app and can finish setting up your profile.</p>
          <p>The link expires in 24 hours.</p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleResend} disabled={resending} variant="outline">
            {resending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              'Resend confirmation email'
            )}
          </Button>
          <Button onClick={onUseDifferentEmail} variant="ghost">
            Use a different email address
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckEmailCard;
