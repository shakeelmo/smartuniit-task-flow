
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ChevronRight } from 'lucide-react';

interface TOCSection {
  id: string;
  title: string;
  subsections?: { id: string; title: string }[];
}

interface TableOfContentsProps {
  sections: TOCSection[];
  activeSection?: string;
  onSectionClick: (sectionId: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  sections,
  activeSection,
  onSectionClick
}) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Table of Contents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {sections.map((section, index) => (
          <div key={section.id} className="space-y-1">
            <Button
              variant={activeSection === section.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onSectionClick(section.id)}
              className={`w-full justify-start text-left font-medium ${
                activeSection === section.id 
                  ? "bg-blue-600 text-white" 
                  : "text-blue-700 hover:bg-blue-100"
              }`}
            >
              <span className="mr-2 text-xs font-bold">{index + 1}.</span>
              {section.title}
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Button>
            
            {section.subsections && (
              <div className="ml-6 space-y-1">
                {section.subsections.map((subsection, subIndex) => (
                  <Button
                    key={subsection.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSectionClick(subsection.id)}
                    className="w-full justify-start text-left text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <span className="mr-2 text-xs">{index + 1}.{subIndex + 1}</span>
                    {subsection.title}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
