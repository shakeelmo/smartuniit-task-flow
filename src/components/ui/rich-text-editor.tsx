
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4
}) => {
  const addBulletPoint = () => {
    const lines = value.split('\n');
    const lastLine = lines[lines.length - 1];
    if (lastLine.trim() === '') {
      lines[lines.length - 1] = '• ';
    } else {
      lines.push('• ');
    }
    onChange(lines.join('\n'));
  };

  const addNumberedPoint = () => {
    const lines = value.split('\n');
    const lastLine = lines[lines.length - 1];
    const numberedLines = lines.filter(line => /^\d+\.\s/.test(line.trim()));
    const nextNumber = numberedLines.length + 1;
    
    if (lastLine.trim() === '') {
      lines[lines.length - 1] = `${nextNumber}. `;
    } else {
      lines.push(`${nextNumber}. `);
    }
    onChange(lines.join('\n'));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 border-b pb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBulletPoint}
          className="flex items-center gap-1"
        >
          <List className="h-3 w-3" />
          Bullet
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNumberedPoint}
          className="flex items-center gap-1"
        >
          <ListOrdered className="h-3 w-3" />
          Numbered
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="font-mono text-sm"
      />
    </div>
  );
};
