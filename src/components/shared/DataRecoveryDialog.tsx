
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useDataProtection } from '@/hooks/useDataProtection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Database, AlertTriangle } from 'lucide-react';

interface DataRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'quotation' | 'proposal';
  onDataRecovered: (data: any) => void;
}

export const DataRecoveryDialog: React.FC<DataRecoveryDialogProps> = ({
  open,
  onOpenChange,
  type,
  onDataRecovered
}) => {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { getBackups, recoverFromBackup } = useDataProtection(type);

  useEffect(() => {
    if (open) {
      loadBackups();
    }
  }, [open]);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const backupData = await getBackups();
      setBackups(backupData);
    } catch (error) {
      console.error('Failed to load backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (backupId: string) => {
    const recoveredData = await recoverFromBackup(backupId);
    if (recoveredData) {
      onDataRecovered(recoveredData);
      onOpenChange(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Recovery - {type === 'quotation' ? 'Quotations' : 'Proposals'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {backups.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No backups available for recovery</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Backups are created automatically when you save your work
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {backups.map((backup) => (
                  <Card key={backup.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {backup.data?.number || backup.data?.title || 'Unnamed Item'}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getOperationColor(backup.operation)}>
                            {backup.operation}
                          </Badge>
                          <Badge variant="outline">
                            v{backup.version}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTimestamp(backup.timestamp)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {type === 'quotation' && backup.data && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Customer:</span>
                              <p className="text-gray-600">
                                {backup.data.customer?.companyName || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Total:</span>
                              <p className="text-gray-600">
                                {backup.data.currency || 'SAR'} {backup.data.total?.toLocaleString() || '0'}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Line Items:</span>
                              <p className="text-gray-600">
                                {backup.data.lineItems?.length || 0} items
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Valid Until:</span>
                              <p className="text-gray-600">
                                {backup.data.validUntil ? 
                                  new Date(backup.data.validUntil).toLocaleDateString() : 
                                  'Not specified'
                                }
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => handleRecover(backup.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Recover This Version
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
