import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeftRight } from 'lucide-react';

const Trade = () => {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ArrowLeftRight className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground font-display">
              Trading Terminal
            </h1>
            <p className="text-sm text-muted-foreground">
              Coming Soon
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 overflow-hidden min-h-[520px] flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Trading terminal is under maintenance.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Trade;
