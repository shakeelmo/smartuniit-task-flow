
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
    // Web & Software Development
    'Web Development / تطوير المواقع',
    'E-commerce Development / تطوير المتاجر الإلكترونية',
    'Mobile App Development (iOS/Android) / تطوير التطبيقات',
    'Custom Software Development / تطوير البرمجيات المخصصة',
    'API Development & Integration / تطوير وربط الواجهات البرمجية',
    'WordPress Development / تطوير مواقع ووردبريس',
    'React/Angular/Vue.js Development / تطوير التطبيقات الحديثة',
    
    // Design & UI/UX
    'UI/UX Design / تصميم واجهات المستخدم',
    'Graphic Design / التصميم الجرافيكي',
    'Logo & Brand Identity Design / تصميم الشعارات والهوية البصرية',
    'Website Redesign / إعادة تصميم المواقع',
    'Mobile App UI Design / تصميم واجهات التطبيقات',
    
    // Digital Marketing & SEO
    'Digital Marketing / التسويق الرقمي',
    'Search Engine Optimization (SEO) / تحسين محركات البحث',
    'Social Media Marketing / التسويق عبر وسائل التواصل',
    'Google Ads Management / إدارة إعلانات جوجل',
    'Content Marketing / تسويق المحتوى',
    'Email Marketing / التسويق الإلكتروني',
    
    // IT Infrastructure & Cloud
    'Cloud Services Setup / إعداد الخدمات السحابية',
    'AWS/Azure/Google Cloud Implementation / تطبيق الحلول السحابية',
    'Network Setup & Configuration / إعداد وتكوين الشبكات',
    'Server Management & Maintenance / إدارة وصيانة الخوادم',
    'IT Infrastructure Consulting / استشارات البنية التحتية',
    'Cybersecurity Solutions / حلول الأمن السيبراني',
    
    // Database & Analytics
    'Database Design & Management / تصميم وإدارة قواعد البيانات',
    'Data Analytics & Reporting / تحليل البيانات والتقارير',
    'Business Intelligence Solutions / حلول ذكاء الأعمال',
    'Data Migration Services / خدمات نقل البيانات',
    
    // Consulting & Training
    'IT Consulting / الاستشارات التقنية',
    'Digital Transformation Consulting / استشارات التحول الرقمي',
    'Technology Training / التدريب التقني',
    'Project Management / إدارة المشاريع',
    'Technical Support & Maintenance / الدعم الفني والصيانة',
    
    // E-commerce & CRM
    'CRM System Implementation / تطبيق أنظمة إدارة العملاء',
    'ERP System Development / تطوير أنظمة تخطيط الموارد',
    'Online Store Setup / إعداد المتاجر الإلكترونية',
    'Payment Gateway Integration / ربط بوابات الدفع',
    
    // Specialized Services
    'IoT Solutions / حلول إنترنت الأشياء',
    'AI & Machine Learning Solutions / حلول الذكاء الاصطناعي',
    'Blockchain Development / تطوير البلوك تشين',
    'DevOps & CI/CD Implementation / تطبيق DevOps',
    'Quality Assurance & Testing / ضمان الجودة والاختبار',
    'Technical Documentation / التوثيق التقني'
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
