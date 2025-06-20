
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, Loader2, CheckCircle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isAutoSaving: boolean;
  lastAutoSave: Date | null;
  hasUnsavedChanges: boolean;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isAutoSaving,
  lastAutoSave,
  hasUnsavedChanges
}) => {
  const getStatus = () => {
    if (isAutoSaving) {
      return {
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
        text: 'Auto-saving...',
        variant: 'secondary' as const,
        className: 'bg-blue-100 text-blue-800'
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: <CloudOff className="h-3 w-3" />,
        text: 'Unsaved changes',
        variant: 'secondary' as const,
        className: 'bg-orange-100 text-orange-800'
      };
    }

    if (lastAutoSave) {
      return {
        icon: <CheckCircle className="h-3 w-3" />,
        text: `Saved ${formatLastSave(lastAutoSave)}`,
        variant: 'secondary' as const,
        className: 'bg-green-100 text-green-800'
      };
    }

    return {
      icon: <Cloud className="h-3 w-3" />,
      text: 'Ready to save',
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800'
    };
  };

  const formatLastSave = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const status = getStatus();

  return (
    <Badge 
      variant={status.variant}
      className={`flex items-center gap-1 text-xs ${status.className}`}
    >
      {status.icon}
      {status.text}
    </Badge>
  );
};
