
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { useFollowUps } from '@/hooks/useFollowUps';
import { FollowUp } from '@/types/customer';

export const FollowUpsList: React.FC = () => {
  const { followUps, loading, updateFollowUp, deleteFollowUp } = useFollowUps();

  const handleComplete = async (followUp: FollowUp) => {
    await updateFollowUp(followUp.id, {
      status: 'completed',
      completed_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = async (followUp: FollowUp) => {
    if (window.confirm('Are you sure you want to delete this follow-up?')) {
      await deleteFollowUp(followUp.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const isOverdue = (followUpDate: string, status: string) => {
    if (status === 'completed') return false;
    const today = new Date();
    const followUpDateObj = new Date(followUpDate);
    return followUpDateObj < today;
  };

  // Update overdue status
  React.useEffect(() => {
    followUps.forEach(followUp => {
      if (isOverdue(followUp.follow_up_date, followUp.status) && followUp.status !== 'overdue') {
        updateFollowUp(followUp.id, { status: 'overdue' });
      }
    });
  }, [followUps, updateFollowUp]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const sortedFollowUps = [...followUps].sort((a, b) => {
    // Sort by status first (overdue, pending, completed), then by date
    const statusOrder = { overdue: 0, pending: 1, completed: 2 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    return new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedFollowUps.map((followUp) => (
        <Card key={followUp.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(followUp.status)}
                  {followUp.customer?.customer_name || 'Unknown Customer'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {followUp.customer?.company_name && `${followUp.customer.company_name} • `}
                  Follow-up: {followUp.follow_up_type}
                </p>
              </div>
              <Badge className={getStatusColor(followUp.status)}>
                {followUp.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Due: {new Date(followUp.follow_up_date).toLocaleDateString()}
                  {isOverdue(followUp.follow_up_date, followUp.status) && 
                    followUp.status !== 'completed' && (
                    <span className="text-red-600 ml-2">(Overdue)</span>
                  )}
                </span>
              </div>

              {followUp.completed_date && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Completed: {new Date(followUp.completed_date).toLocaleDateString()}</span>
                </div>
              )}

              {followUp.notes && (
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  {followUp.notes}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                {followUp.status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleComplete(followUp)}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Mark Complete
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(followUp)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {sortedFollowUps.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No follow-ups yet</h3>
            <p className="text-gray-600">Create follow-ups from the customer management section</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
