
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PenTool, Calendar, FileCheck } from 'lucide-react';

interface CustomerAcceptanceData {
  customerSignature: string;
  customerName: string;
  customerTitle: string;
  customerDate: string;
  companySignature: string;
  companyRepresentative: string;
  companyTitle: string;
  companyDate: string;
  acceptanceNotes: string;
}

interface CustomerAcceptanceSectionProps {
  acceptanceData: CustomerAcceptanceData;
  onAcceptanceChange: (field: keyof CustomerAcceptanceData, value: string) => void;
}

export const CustomerAcceptanceSection: React.FC<CustomerAcceptanceSectionProps> = ({
  acceptanceData,
  onAcceptanceChange
}) => {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <FileCheck className="h-5 w-5" />
          Customer Acceptance & Signatures
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Agreement Statement */}
          <div className="p-4 bg-white rounded-lg border-2 border-green-200">
            <h3 className="font-bold text-green-800 mb-2">Agreement Statement</h3>
            <p className="text-sm text-gray-700">
              By signing below, both parties acknowledge and agree to the terms, conditions, 
              and specifications outlined in this proposal. This agreement is legally binding 
              upon signature and constitutes acceptance of all proposal terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Acceptance */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Customer Acceptance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={acceptanceData.customerName}
                    onChange={(e) => onAcceptanceChange('customerName', e.target.value)}
                    placeholder="Full name of authorized signatory"
                  />
                </div>
                <div>
                  <Label>Title/Position</Label>
                  <Input
                    value={acceptanceData.customerTitle}
                    onChange={(e) => onAcceptanceChange('customerTitle', e.target.value)}
                    placeholder="CEO, Project Manager, etc."
                  />
                </div>
                <div>
                  <Label>Digital Signature</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <PenTool className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Signature will be added during acceptance</p>
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Date of Acceptance
                  </Label>
                  <Input
                    type="date"
                    value={acceptanceData.customerDate}
                    onChange={(e) => onAcceptanceChange('customerDate', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Company Acceptance */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Company Representative
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Representative Name</Label>
                  <Input
                    value={acceptanceData.companyRepresentative}
                    onChange={(e) => onAcceptanceChange('companyRepresentative', e.target.value)}
                    placeholder="Smart Universe representative"
                  />
                </div>
                <div>
                  <Label>Title/Position</Label>
                  <Input
                    value={acceptanceData.companyTitle}
                    onChange={(e) => onAcceptanceChange('companyTitle', e.target.value)}
                    placeholder="Sales Manager, Project Director, etc."
                  />
                </div>
                <div>
                  <Label>Digital Signature</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <PenTool className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Signature placeholder</p>
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Date Signed
                  </Label>
                  <Input
                    type="date"
                    value={acceptanceData.companyDate}
                    onChange={(e) => onAcceptanceChange('companyDate', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acceptance Notes */}
          <div>
            <Label>Acceptance Notes & Special Conditions</Label>
            <Textarea
              value={acceptanceData.acceptanceNotes}
              onChange={(e) => onAcceptanceChange('acceptanceNotes', e.target.value)}
              placeholder="Any special conditions, modifications, or notes regarding this acceptance..."
              rows={4}
              className="bg-white"
            />
          </div>

          {/* Legal Disclaimer */}
          <div className="p-3 bg-gray-100 rounded text-xs text-gray-600">
            <strong>Legal Notice:</strong> This document serves as a binding agreement. 
            Digital signatures are legally recognized. Please review all terms carefully 
            before signing. For questions, contact our legal department.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
