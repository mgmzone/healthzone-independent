import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Apple, Scale, Clock, Dumbbell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

// One-time "you're set up, here's what to log first" card that renders on
// the dashboard for a user who just finished onboarding. Dismiss persists
// per-user via localStorage so refresh doesn't bring it back.

interface WelcomeCardProps {
  hasAnyLoggedData: boolean;
}

const dismissKey = (userId: string) => `healthzone-welcome-dismissed-${userId}`;

const WelcomeCard: React.FC<WelcomeCardProps> = ({ hasAnyLoggedData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(() => {
    if (!user?.id) return true;
    try {
      return localStorage.getItem(dismissKey(user.id)) === '1';
    } catch {
      return false;
    }
  });

  // Hide once the user has logged anything — they clearly know the app now.
  // Also auto-dismiss so we don't keep the flag around in storage for years.
  if (hasAnyLoggedData && !dismissed && user?.id) {
    try {
      localStorage.setItem(dismissKey(user.id), '1');
    } catch {
      /* noop */
    }
    return null;
  }

  if (dismissed || !user?.id) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(dismissKey(user.id), '1');
    } catch {
      /* noop */
    }
    setDismissed(true);
  };

  const actions = [
    { icon: Scale, label: 'Log weight', route: '/weight' },
    { icon: Apple, label: 'Log a meal', route: '/nutrition' },
    { icon: Clock, label: 'Start a fast', route: '/fasting' },
    { icon: Dumbbell, label: 'Log exercise', route: '/exercise' },
  ];

  return (
    <Card className="mb-6 border-primary/40 bg-primary/5 relative">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss welcome card"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-1">You&rsquo;re set up. Start logging.</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your dashboard wakes up once there&rsquo;s data to show. Pick one to start &mdash; the streaks and forecasts come alive after a few days of logs.
        </p>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Button
                key={a.route}
                size="sm"
                variant="outline"
                onClick={() => navigate(a.route)}
              >
                <Icon className="mr-1.5 h-4 w-4" />
                {a.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
