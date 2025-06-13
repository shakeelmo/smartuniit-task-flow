
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Minus } from 'lucide-react';

interface LineItem {
  id: string;
  service: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface LineItemsTableProps {
  lineItems: LineItem[];
  updateLineItem: (id: string, field: keyof LineItem, value: any) => void;
  removeLineItem: (id: string) => void;
}

const LineItemsTable = ({ lineItems, updateLineItem, removeLineItem }: LineItemsTableProps) => {
  const services = [
    'Web Development / تطوير المواقع',
    'Mobile App Development / تطوير التطبيقات',
    'Digital Marketing / التسويق الرقمي',
    'IT Consulting / الاستشارات التقنية',
    'Cloud Services / الخدمات السحابية',
    'Network Setup / إعداد الشبكات',
    'Database Management / إدارة قواعد البيانات',
    'UI/UX Design / تصميم واجهات المستخدم'
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3 border-b border-gray-200 min-w-[200px]">
              Service / الخدمة
            </th>
            <th className="text-left p-3 border-b border-gray-200 min-w-[250px]">
              Description / الوصف
            </th>
            <th className="text-left p-3 border-b border-gray-200 w-24">
              Qty / الكمية
            </th>
            <th className="text-left p-3 border-b border-gray-200 w-32">
              Unit Price (SAR) / سعر الوحدة
            </th>
            <th className="text-left p-3 border-b border-gray-200 w-32">
              Total / المجموع
            </th>
            <th className="w-12 p-3 border-b border-gray-200"></th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, index) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="p-3">
                <select
                  value={item.service}
                  onChange={(e) => updateLineItem(item.id, 'service', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select service...</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-3">
                <Textarea
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  placeholder="Enter description..."
                  rows={2}
                  className="text-sm"
                />
              </td>
              <td className="p-3">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  min="1"
                  className="text-center"
                />
              </td>
              <td className="p-3">
                <Input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </td>
              <td className="p-3 font-medium">
                ﷼ {(item.quantity * item.unitPrice).toLocaleString()}
              </td>
              <td className="p-3">
                {lineItems.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(item.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LineItemsTable;
