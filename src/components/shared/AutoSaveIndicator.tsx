
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  hasError?: boolean;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isAutoSaving,
  lastSaved,
  hasError = false
}) => {
  const getStatusContent = () => {
    if (hasError) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Save Failed
        </Badge>
      );
    }

    if (isAutoSaving) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-blue-300 text-blue-700">
          <Clock className="h-3 w-3 animate-spin" />
          Saving...
        </Badge>
      );
    }

    if (lastSaved) {
      const timeAgo = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      const getTimeString = () => {
        if (timeAgo < 60) return 'Just now';
        if (timeAgo < 3600) return `${Math.floor(timeAgo / 60)}m ago`;
        return `${Math.floor(timeAgo / 3600)}h ago`;
      };

      return (
        <Badge variant="outline" className="flex items-center gap-1 border-green-300 text-green-700">
          <CheckCircle className="h-3 w-3" />
          Saved {getTimeString()}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Not saved
      </Badge>
    );
  };

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 font-medium">Status:</span>
          {getStatusContent()}
        </div>
        {lastSaved && (
          <div className="mt-1 text-xs text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
