import { CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface WorkflowGuideProps {
  steps: WorkflowStep[];
}

export function WorkflowGuide({ steps }: WorkflowGuideProps) {
  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Your Journey Progress</h3>
          <span className="text-sm text-gray-500">
            {steps.filter(s => s.completed).length} of {steps.length} completed
          </span>
        </div>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-primary text-primary-foreground' 
                    : step.current 
                    ? 'bg-primary/10 text-primary ring-2 ring-primary ring-offset-2' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1 pb-4">
                  <p className={`font-medium ${
                    step.current ? 'text-primary' : step.completed ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`absolute left-4 top-8 w-0.5 h-full ${
                  step.completed ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}