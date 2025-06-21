
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';

interface PaymentTermsFormProps {
  projectDurationDays: string;
  paymentTerms: string;
  onProjectDurationChange: (value: string) => void;
  onPaymentTermsChange: (value: string) => void;
}

export const PaymentTermsForm: React.FC<PaymentTermsFormProps> = ({
  projectDurationDays,
  paymentTerms,
  onProjectDurationChange,
  onPaymentTermsChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Terms & Duration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="project_duration_days">Project Duration (Days)</Label>
            <Input
              id="project_duration_days"
              type="number"
              value={projectDurationDays}
              onChange={(e) => onProjectDurationChange(e.target.value)}
              placeholder="e.g., 90"
              min="1"
            />
          </div>
          <div>
            <Label htmlFor="payment_terms">Payment Terms</Label>
            <Textarea
              id="payment_terms"
              value={paymentTerms}
              onChange={(e) => onPaymentTermsChange(e.target.value)}
              placeholder="• 30% advance payment upon contract signing
• 50% payment upon project milestone completion
• 20% final payment upon project delivery and acceptance"
              rows={5}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
