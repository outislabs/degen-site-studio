import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface Props {
  allowed: boolean;
  requiredPlan: string;
  children?: ReactNode;
  message?: string;
}

const PlanGate = ({ allowed, requiredPlan, children, message }: Props) => {
  const navigate = useNavigate();

  if (allowed) return <>{children}</>;

  return (
    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
      <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <h3 className="text-sm font-semibold text-foreground mb-1">
        {requiredPlan}+ Plan Required
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {message || `Upgrade to ${requiredPlan} or higher to unlock this feature.`}
      </p>
      <Button size="sm" onClick={() => navigate('/pricing')} className="bg-primary text-primary-foreground hover:bg-primary/90">
        View Plans
      </Button>
    </div>
  );
};

export default PlanGate;
