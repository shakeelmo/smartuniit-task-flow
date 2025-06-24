
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import QuotationSection from './QuotationSection';

interface LineItem {
  id: string;
  service: string;
  description: string;
  partNumber?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
}

interface Section {
  id: string;
  title: string;
  lineItems: LineItem[];
}

interface QuotationSectionsManagerProps {
  sections: Section[];
  setSections: (sections: Section[]) => void;
  showUnitColumn: boolean;
  setShowUnitColumn: (show: boolean) => void;
}

const predefinedSectionTitles = [
  'Civil Infrastructure / البنية التحتية المدنية',
  'Power Infrastructure / البنية التحتية للطاقة',
  'Structured Cabling & Networking / الكابلات المنظمة والشبكات',
  'Security & Monitoring / الأمان والمراقبة',
  'Professional Services & Integration / الخدمات المهنية والتكامل',
  'Hardware & Equipment / الأجهزة والمعدات',
  'Software & Licensing / البرمجيات والتراخيص',
  'Installation & Configuration / التركيب والتكوين',
  'Testing & Commissioning / الاختبار والتشغيل',
  'Training & Support / التدريب والدعم',
  'Maintenance & Warranty / الصيانة والضمان',
  'Project Management / إدارة المشروع'
];

const QuotationSectionsManager = ({
  sections,
  setSections,
  showUnitColumn,
  setShowUnitColumn
}: QuotationSectionsManagerProps) => {
  const [selectedSectionTitle, setSelectedSectionTitle] = useState('');

  const addSection = (title?: string) => {
    const sectionTitle = title || selectedSectionTitle || `Section ${sections.length + 1}`;
    const newSection: Section = {
      id: Date.now().toString(),
      title: sectionTitle,
      lineItems: [{
        id: Date.now().toString(),
        service: '',
        description: '',
        partNumber: '',
        quantity: 1,
        unit: '',
        unitPrice: 0
      }]
    };
    setSections([...sections, newSection]);
    setSelectedSectionTitle('');
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, title } : section
    ));
  };

  const addLineItemToSection = (sectionId: string) => {
    const newLineItem: LineItem = {
      id: Date.now().toString(),
      service: '',
      description: '',
      partNumber: '',
      quantity: 1,
      unit: '',
      unitPrice: 0
    };

    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, lineItems: [...section.lineItems, newLineItem] }
        : section
    ));
  };

  const updateLineItemInSection = (sectionId: string, itemId: string, field: keyof LineItem, value: any) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            lineItems: section.lineItems.map(item =>
              item.id === itemId ? { ...item, [field]: value } : item
            )
          }
        : section
    ));
  };

  const removeLineItemFromSection = (sectionId: string, itemId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            lineItems: section.lineItems.length > 1 
              ? section.lineItems.filter(item => item.id !== itemId)
              : section.lineItems
          }
        : section
    ));
  };

  return (
    <div className="space-y-6">
      {/* Section Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-4">
          <Settings className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Section Settings:</span>
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
        <div className="flex items-center space-x-2">
          <Select value={selectedSectionTitle} onValueChange={setSelectedSectionTitle}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select section type..." />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
              {predefinedSectionTitles.map((title) => (
                <SelectItem key={title} value={title} className="cursor-pointer hover:bg-gray-100">
                  {title}
                </SelectItem>
              ))}
              <SelectItem value="CUSTOM" className="font-semibold text-smart-orange cursor-pointer hover:bg-orange-50">
                + Custom Section
              </SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => addSection()} 
            className="bg-smart-orange hover:bg-smart-orange/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <QuotationSection
            key={section.id}
            id={section.id}
            title={section.title}
            lineItems={section.lineItems}
            onTitleChange={updateSectionTitle}
            onAddLineItem={addLineItemToSection}
            onUpdateLineItem={updateLineItemInSection}
            onRemoveLineItem={removeLineItemFromSection}
            onRemoveSection={removeSection}
            showUnitColumn={showUnitColumn}
            setShowUnitColumn={setShowUnitColumn}
            canRemove={sections.length > 1}
          />
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-4">No sections added yet</p>
          <Button onClick={() => addSection('General Services')} className="bg-smart-orange hover:bg-smart-orange/90">
            <Plus className="h-4 w-4 mr-2" />
            Add First Section
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuotationSectionsManager;
