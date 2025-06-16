
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Edit2, Check, X, Trash2 } from 'lucide-react';
import LineItemsTable from './LineItemsTable';

interface LineItem {
  id: string;
  service: string;
  description: string;
  partNumber?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
}

interface QuotationSectionProps {
  id: string;
  title: string;
  lineItems: LineItem[];
  onTitleChange: (id: string, title: string) => void;
  onAddLineItem: (sectionId: string) => void;
  onUpdateLineItem: (sectionId: string, itemId: string, field: keyof LineItem, value: any) => void;
  onRemoveLineItem: (sectionId: string, itemId: string) => void;
  onRemoveSection: (sectionId: string) => void;
  showUnitColumn: boolean;
  setShowUnitColumn: (show: boolean) => void;
  canRemove: boolean;
}

const QuotationSection = ({
  id,
  title,
  lineItems,
  onTitleChange,
  onAddLineItem,
  onUpdateLineItem,
  onRemoveLineItem,
  onRemoveSection,
  showUnitColumn,
  setShowUnitColumn,
  canRemove
}: QuotationSectionProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleSaveTitle = () => {
    onTitleChange(id, editTitle);
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(title);
    setIsEditingTitle(false);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          {isEditingTitle ? (
            <div className="flex items-center space-x-2 flex-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-semibold"
                placeholder="Enter section title..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveTitle();
                  }
                }}
              />
              <Button size="sm" onClick={handleSaveTitle} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingTitle(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => onAddLineItem(id)} 
            variant="outline" 
            size="sm"
            className="bg-smart-orange/10 hover:bg-smart-orange/20 border-smart-orange text-smart-orange"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
          {canRemove && (
            <Button
              onClick={() => onRemoveSection(id)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <LineItemsTable
        lineItems={lineItems}
        updateLineItem={(itemId, field, value) => onUpdateLineItem(id, itemId, field, value)}
        removeLineItem={(itemId) => onRemoveLineItem(id, itemId)}
        showUnitColumn={showUnitColumn}
        setShowUnitColumn={setShowUnitColumn}
      />
    </div>
  );
};

export default QuotationSection;
