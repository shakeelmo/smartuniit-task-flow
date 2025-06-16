
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, Settings } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface LineItem {
  id: string;
  service: string;
  description: string;
  partNumber?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
}

interface LineItemsTableProps {
  lineItems: LineItem[];
  updateLineItem: (id: string, field: keyof LineItem, value: any) => void;
  removeLineItem: (id: string) => void;
  showUnitColumn: boolean;
  setShowUnitColumn: (show: boolean) => void;
}

const LineItemsTable = ({ 
  lineItems, 
  updateLineItem, 
  removeLineItem, 
  showUnitColumn, 
  setShowUnitColumn 
}: LineItemsTableProps) => {
  const [customServices, setCustomServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState('');
  const [showAddService, setShowAddService] = useState<string | null>(null);

  const predefinedServices = [
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

  const allServices = [...predefinedServices, ...customServices];

  const handleAddCustomService = (itemId: string) => {
    if (newServiceInput.trim()) {
      const newService = newServiceInput.trim();
      if (!allServices.includes(newService)) {
        setCustomServices(prev => [...prev, newService]);
      }
      updateLineItem(itemId, 'service', newService);
      setNewServiceInput('');
      setShowAddService(null);
    }
  };

  const handleServiceChange = (itemId: string, value: string) => {
    if (value === 'ADD_CUSTOM') {
      setShowAddService(itemId);
      return;
    }
    updateLineItem(itemId, 'service', value);
  };

  return (
    <div className="space-y-4">
      {/* Column Settings */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-4">
          <Settings className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Table Settings:</span>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-unit"
              checked={showUnitColumn}
              onCheckedChange={(checked) => setShowUnitColumn(checked as boolean)}
            />
            <label htmlFor="show-unit" className="text-sm text-gray-600">
              Show Unit Column / إظهار عمود الوحدة
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 border-b border-gray-200 min-w-[200px]">
                Service / الخدمة
              </th>
              <th className="text-left p-3 border-b border-gray-200 min-w-[120px]">
                Part Number / رقم الجزء
              </th>
              <th className="text-left p-3 border-b border-gray-200 min-w-[250px]">
                Description / الوصف
              </th>
              <th className="text-left p-3 border-b border-gray-200 w-24">
                Qty / الكمية
              </th>
              {showUnitColumn && (
                <th className="text-left p-3 border-b border-gray-200 w-24">
                  Unit / الوحدة
                </th>
              )}
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
                  {showAddService === item.id ? (
                    <div className="space-y-2">
                      <Input
                        value={newServiceInput}
                        onChange={(e) => setNewServiceInput(e.target.value)}
                        placeholder="Enter custom service name..."
                        className="text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddCustomService(item.id);
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddCustomService(item.id)}
                          className="bg-smart-orange hover:bg-smart-orange/90"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowAddService(null);
                            setNewServiceInput('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={item.service}
                      onChange={(e) => handleServiceChange(item.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                    >
                      <option value="">Select service...</option>
                      {allServices.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                      <option value="ADD_CUSTOM" className="font-semibold text-smart-orange">
                        + Add Custom Service
                      </option>
                    </select>
                  )}
                </td>
                <td className="p-3">
                  <Input
                    value={item.partNumber || ''}
                    onChange={(e) => updateLineItem(item.id, 'partNumber', e.target.value)}
                    placeholder="Optional part number..."
                    className="text-sm"
                  />
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
                {showUnitColumn && (
                  <td className="p-3">
                    <select
                      value={item.unit || ''}
                      onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                    >
                      <option value="">Select unit...</option>
                      <option value="Each">Each / كل</option>
                      <option value="Hour">Hour / ساعة</option>
                      <option value="Day">Day / يوم</option>
                      <option value="Week">Week / أسبوع</option>
                      <option value="Month">Month / شهر</option>
                      <option value="Year">Year / سنة</option>
                      <option value="Project">Project / مشروع</option>
                      <option value="License">License / رخصة</option>
                      <option value="User">User / مستخدم</option>
                      <option value="Page">Page / صفحة</option>
                      <option value="Design">Design / تصميم</option>
                      <option value="Feature">Feature / ميزة</option>
                      <option value="Aisles">Aisles / ممرات</option>
                      <option value="m">m / متر</option>
                      <option value="Units">Units / وحدات</option>
                      <option value="Job">Job / وظيفة</option>
                      <option value="Sets">Sets / مجموعات</option>
                      <option value="Doors">Doors / أبواب</option>
                      <option value="Cams">Cams / كاميرات</option>
                      <option value="Sensors">Sensors / مجسات</option>
                      <option value="Racks">Racks / رفوف</option>
                    </select>
                  </td>
                )}
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
        
        {customServices.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Custom Services Added / الخدمات المخصصة المضافة:
            </h4>
            <div className="flex flex-wrap gap-2">
              {customServices.map((service, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineItemsTable;
