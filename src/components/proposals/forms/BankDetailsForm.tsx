
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  swift_code: string;
  branch: string;
}

interface BankDetailsFormProps {
  bankDetails: BankDetails;
  onBankDetailsChange: (field: keyof BankDetails, value: string) => void;
}

export const BankDetailsForm: React.FC<BankDetailsFormProps> = ({
  bankDetails,
  onBankDetailsChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Banking Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Bank Name</Label>
            <Input
              value={bankDetails.bank_name}
              onChange={(e) => onBankDetailsChange('bank_name', e.target.value)}
              placeholder="e.g., Saudi National Bank"
            />
          </div>
          <div>
            <Label>Account Name</Label>
            <Input
              value={bankDetails.account_name}
              onChange={(e) => onBankDetailsChange('account_name', e.target.value)}
              placeholder="Company account holder name"
            />
          </div>
          <div>
            <Label>Account Number</Label>
            <Input
              value={bankDetails.account_number}
              onChange={(e) => onBankDetailsChange('account_number', e.target.value)}
              placeholder="Account number"
            />
          </div>
          <div>
            <Label>IBAN</Label>
            <Input
              value={bankDetails.iban}
              onChange={(e) => onBankDetailsChange('iban', e.target.value)}
              placeholder="SA** **** **** **** ****"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
