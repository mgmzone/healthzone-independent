import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { isProfileComplete } from '@/lib/auth';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useDailyGoalsData } from '@/hooks/useDailyGoalsData';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  UserCircle,
  CheckCircle,
  Calendar,
  ArrowRight,
  Info,
  Target,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Step state machine — each step shows as one of:
//   pending  → dimmed, button disabled until previous steps done
//   active   → accented border, primary button
//   done     → green check, button hidden
// The state derives entirely from profile + periods + goals — no local flags,
// so a user who did Step 2 on a different device sees the right thing here.
type StepState = 'pending' | 'active' | 'done';

interface StepProps {
  state: StepState;
  icon: React.ComponentType<{ className?: string }>;
  number: number;
  title: string;
  description: string;
  cta: string;
  onAction: () => void;
  secondaryCta?: string;
  onSecondaryAction?: () => void;
  secondaryDisabled?: boolean;
}

const StepCard: React.FC<StepProps> = ({
  state,
  icon: Icon,
  number,
  title,
  description,
  cta,
  onAction,
  secondaryCta,
  onSecondaryAction,
  secondaryDisabled,
}) => (
  <Card
    className={cn(
      state === 'done' && 'border-green-500',
      state === 'active' && 'border-primary',
      state === 'pending' && 'opacity-50'
    )}
  >
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          {state === 'done' ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : (
            <Icon className="h-8 w-8 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">
            Step {number}: {title}
          </h2>
          <p className="text-muted-foreground mb-4">{description}</p>
          {state === 'active' && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Button onClick={onAction} size="lg">
                {cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {secondaryCta && onSecondaryAction && (
                <Button
                  onClick={onSecondaryAction}
                  size="lg"
                  variant="outline"
                  disabled={secondaryDisabled}
                >
                  {secondaryCta}
                </Button>
              )}
            </div>
          )}
          {state === 'pending' && (
            <Button disabled size="lg" className="mt-2">
              {cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const GettingStarted = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { periods, isLoading: periodsLoading, addPeriod } = usePeriodsData();
  const { activeGoals, isLoading: goalsLoading } = useDailyGoalsData();

  const profileComplete = isProfileComplete(profile);
  const hasPeriod = periods.length > 0;
  const hasGoals = activeGoals.length > 0;

  // Quick-start: create a weight-loss period with the user's profile values
  // and no deadline. For users who don't want to commit to a weekly rate
  // and a target date — the forecast will project a completion date from
  // their actual pace once weigh-ins accumulate.
  const handleStartWithoutDeadline = () => {
    if (!profile?.currentWeight || !profile?.targetWeight) return;
    addPeriod({
      type: 'weightLoss',
      startWeight: profile.currentWeight,
      targetWeight: profile.targetWeight,
      startDate: new Date(),
      endDate: undefined,
      fastingSchedule: '16:8',
      weightLossPerWeek: 0.5,
    });
  };
  const canStartWithoutDeadline =
    !!profile?.currentWeight &&
    !!profile?.targetWeight &&
    profile.currentWeight > profile.targetWeight;

  const step1State: StepState = profileComplete ? 'done' : 'active';
  const step2State: StepState = !profileComplete
    ? 'pending'
    : hasPeriod
    ? 'done'
    : 'active';
  const step3State: StepState = !profileComplete || !hasPeriod
    ? 'pending'
    : hasGoals
    ? 'done'
    : 'active';

  const allDone = profileComplete && hasPeriod && hasGoals;

  // While periods/goals hooks warm up we don't know the real state, so we
  // render a spinner rather than flash a stale checklist.
  if (periodsLoading || goalsLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 mt-16 flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 mt-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Getting Started</h1>
          <p className="text-muted-foreground mb-6">
            Three quick steps to get HealthZone useful for you. You can skip or
            come back any time — nothing here is permanent.
          </p>

          {!allDone && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Finish each step to unlock the next. The whole setup takes about
                three minutes.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <StepCard
              state={step1State}
              icon={UserCircle}
              number={1}
              title="Complete your profile"
              description="Starting weight, target weight, height, birth date, and your time zone — so forecasts, reminders, and fasting windows work right."
              cta="Complete profile"
              onAction={() => navigate('/profile')}
            />

            <StepCard
              state={step2State}
              icon={Calendar}
              number={2}
              title="Create your first period"
              description="A period is a weight-loss or maintenance phase. Set a target weight and a finish date, or start open-ended and let the forecast project one from your actual pace. You can change this any time."
              cta="Create first period"
              onAction={() => navigate('/periods?create=1')}
              secondaryCta="Start without a deadline"
              onSecondaryAction={handleStartWithoutDeadline}
              secondaryDisabled={!canStartWithoutDeadline}
            />

            <StepCard
              state={step3State}
              icon={Target}
              number={3}
              title="Set your daily compliance goals (optional but recommended)"
              description="Custom daily rules that matter for you — hydration targets, supplements, anti-inflammatory eating, medical restrictions. Streak-tracked alongside your weight and fasting data."
              cta="Set up daily goals"
              onAction={() => navigate('/nutrition?tab=goals')}
            />
          </div>

          {allDone && (
            <Card className="mt-8 border-green-500 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mt-1" />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">You're all set</h2>
                    <p className="text-muted-foreground mb-4">
                      Your dashboard is live. Log your first meal, weigh-in, or fasting
                      window — the streaks and forecasts wake up once you have a few days
                      of data.
                    </p>
                    <Button size="lg" onClick={() => navigate('/dashboard')}>
                      Go to dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GettingStarted;
