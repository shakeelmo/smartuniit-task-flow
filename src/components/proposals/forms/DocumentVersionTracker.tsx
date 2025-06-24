
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, History, Calendar, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface VersionEntry {
  version: string;
  date: string;
  author: string;
  changes: string;
}

interface DocumentVersionTrackerProps {
  currentVersion: string;
  lastUpdated: string;
  versionHistory: VersionEntry[];
  onVersionUpdate: (newVersion: string, changes: string) => void;
}

export const DocumentVersionTracker: React.FC<DocumentVersionTrackerProps> = ({
  currentVersion,
  lastUpdated,
  versionHistory,
  onVersionUpdate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [changes, setChanges] = useState('');

  const handleAddVersion = () => {
    if (newVersion && changes) {
      onVersionUpdate(newVersion, changes);
      setNewVersion('');
      setChanges('');
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Document Version
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-green-300">
                  <Plus className="h-3 w-3 mr-1" />
                  Update Version
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Document Version</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">New Version Number</label>
                    <Input
                      value={newVersion}
                      onChange={(e) => setNewVersion(e.target.value)}
                      placeholder="e.g., 1.3"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Changes Made</label>
                    <Textarea
                      value={changes}
                      onChange={(e) => setChanges(e.target.value)}
                      placeholder="Describe what was changed in this version..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddVersion}>
                      Update Version
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800 font-bold">
                Version {currentVersion}
              </Badge>
              <span className="text-sm text-gray-600">
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
              </span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  <History className="h-4 w-4 mr-1" />
                  View History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Version History</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {versionHistory.map((entry, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">v{entry.version}</Badge>
                        <span className="text-sm text-gray-500">{entry.date}</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.author}
                        </span>
                      </div>
                      <p className="text-sm">{entry.changes}</p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
