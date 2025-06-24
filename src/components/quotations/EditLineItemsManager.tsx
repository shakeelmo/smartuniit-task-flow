
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface LineItem {
  id: string;
  service: string;
  description: string;
  partNumber?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
}

interface EditLineItemsManagerProps {
  lineItems: LineItem[];
  updateLineItem: (id: string, field: keyof LineItem, value: any) => void;
  removeLineItem: (id: string) => void;
  addLineItem: () => void;
  showUnitColumn: boolean;
  setShowUnitColumn: (show: boolean) => void;
}

const EditLineItemsManager = ({
  lineItems,
  updateLineItem,
  removeLineItem,
  addLineItem,
  showUnitColumn,
  setShowUnitColumn
}: EditLineItemsManagerProps) => {
  const [customServices, setCustomServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState('');
  const [showAddService, setShowAddService] = useState<string | null>(null);

  // Comprehensive service options matching the create quotation functionality
  const predefinedServices = [
    // Infrastructure & Construction
    'Civil Services / الخدمات المدنية',
    'Power Infrastructure / البنية التحتية للطاقة',
    'Electrical Installation / التركيبات الكهربائية',
    'HVAC Systems / أنظمة التكييف',
    'Plumbing Services / خدمات السباكة',
    'Fire Safety Systems / أنظمة السلامة من الحرائق',
    
    // IT & Technology
    'IT Solutions / حلول تقنية المعلومات',
    'Network Services / خدمات الشبكات',
    'Web Development / تطوير المواقع',
    'Software Development / تطوير البرمجيات',
    'Database Management / إدارة قواعد البيانات',
    'Cloud Services / الخدمات السحابية',
    'Cybersecurity / الأمن السيبراني',
    
    // Communication & Electronics
    'Telecommunications / الاتصالات',
    'Audio Visual Systems / الأنظمة السمعية والبصرية',
    'Security Systems / أنظمة الأمان',
    'Access Control / التحكم في الوصول',
    'CCTV Installation / تركيب كاميرات المراقبة',
    
    // Consulting & Management
    'Project Management / إدارة المشاريع',
    'Technical Consulting / الاستشارات التقنية',
    'System Integration / تكامل الأنظمة',
    'Maintenance Services / خدمات الصيانة',
    'Training Services / خدمات التدريب',
    
    // Specialized Services
    'Data Center Setup / إعداد مراكز البيانات',
    'Backup Solutions / حلول النسخ الاحتياطي',
    'Disaster Recovery / استعادة الكوارث',
    'Quality Assurance / ضمان الجودة',
    'Technical Support / الدعم الفني'
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Services / الخدمات ({lineItems.length})</h3>
        <div className="flex gap-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showUnitColumn}
              onChange={(e) => setShowUnitColumn(e.target.checked)}
              className="rounded"
            />
            <span>Show Unit Column</span>
          </label>
          <Button onClick={addLineItem} className="bg-smart-orange hover:bg-smart-orange/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {lineItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p>No services added yet. Click "Add Service" to add new services like:</p>
          <p className="mt-2 text-sm">• Civil Services • Power Infrastructure • IT Solutions • Network Services</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {lineItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border rounded-lg bg-white shadow-sm">
              <div className="col-span-1 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
              </div>
              
              <div className="col-span-3">
                <Label className="text-xs font-medium">Service Name / اسم الخدمة</Label>
                {showAddService === item.id ? (
                  <div className="space-y-2">
                    <Input
                      value={newServiceInput}
                      onChange={(e) => setNewServiceInput(e.target.value)}
                      placeholder="Enter custom service name..."
                      className="text-sm mt-1"
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
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-smart-orange focus:border-smart-orange mt-1"
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
              </div>

              <div className="col-span-3">
                <Label className="text-xs font-medium">Description / الوصف</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  placeholder="Detailed description of the service..."
                  rows={2}
                  className="text-sm mt-1"
                />
              </div>

              {showUnitColumn && (
                <div className="col-span-1">
                  <Label className="text-xs font-medium">Part#</Label>
                  <Input
                    value={item.partNumber || ''}
                    onChange={(e) => updateLineItem(item.id, 'partNumber', e.target.value)}
                    placeholder="Part#"
                    className="text-sm mt-1"
                  />
                </div>
              )}

              <div className={showUnitColumn ? "col-span-1" : "col-span-1"}>
                <Label className="text-xs font-medium">Qty / الكمية</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="text-sm mt-1"
                />
              </div>

              {showUnitColumn && (
                <div className="col-span-1">
                  <Label className="text-xs font-medium">Unit / الوحدة</Label>
                  <select
                    value={item.unit || ''}
                    onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-smart-orange focus:border-smart-orange mt-1"
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
                    <option value="sqm">sqm / متر مربع</option>
                    <option value="Units">Units / وحدات</option>
                    <option value="Job">Job / وظيفة</option>
                    <option value="Sets">Sets / مجموعات</option>
                    <option value="Doors">Doors / أبواب</option>
                    <option value="Cams">Cams / كاميرات</option>
                    <option value="Sensors">Sensors / مجسات</option>
                    <option value="Racks">Racks / رفوف</option>
                  </select>
                </div>
              )}

              <div className={showUnitColumn ? "col-span-1" : "col-span-1"}>
                <Label className="text-xs font-medium">Price / السعر</Label>
                <Input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="text-sm mt-1"
                />
              </div>

              <div className="col-span-1 flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLineItem(item.id)}
                  className="text-red-600 hover:text-red-700 w-full"
                  disabled={lineItems.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lineItems.length > 0 && (
        <div className="text-center py-4 border-t">
          <Button onClick={addLineItem} variant="outline" className="bg-smart-orange text-white hover:bg-smart-orange/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Service
          </Button>
        </div>
      )}

      {customServices.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
  );
};

export default EditLineItemsManager;
