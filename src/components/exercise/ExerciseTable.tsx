import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Running, Bike, Activity, Trash2 } from 'lucide-react';
import { ExerciseLog, TimeFilter } from '@/lib/types';
import { format, differenceInDays } from 'date-fns';
import ExerciseTimeFilter from '@/components/exercise/ExerciseTimeFilter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ExerciseTableProps {
  exerciseLogs: ExerciseLog[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

const ExerciseTable: React.FC<ExerciseTableProps> = ({ 
  exerciseLogs, 
  isLoading, 
  onDelete,
  timeFilter,
  onTimeFilterChange
}) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  
  const groupedByWeek = groupLogsByWeek(exerciseLogs);
  
  const toggleWeekExpansion = (weekKey: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekKey]: !prev[weekKey]
    }));
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'walk': return <Running className="h-4 w-4 text-blue-500" />;
      case 'run': return <Running className="h-4 w-4 text-orange-500" />;
      case 'bike': return <Bike className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-purple-500" />;
    }
  };
  
  const getIntensityBadge = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Easy</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Moderate</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Intense</Badge>;
      default:
        return <Badge variant="outline">{intensity}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Activity Log</h2>
        <ExerciseTimeFilter 
          value={timeFilter} 
          onChange={onTimeFilterChange}
        />
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Intensity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : exerciseLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No exercise activities recorded
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(groupedByWeek).map(([weekKey, entries]) => {
                  const isExpanded = expandedWeeks[weekKey] !== false;
                  const totalMinutes = entries.reduce((acc, log) => acc + log.minutes, 0);
                  const totalDistance = entries.reduce((acc, log) => acc + (log.distance || 0), 0);
                  
                  return (
                    <React.Fragment key={weekKey}>
                      <TableRow 
                        className="group cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleWeekExpansion(weekKey)}
                      >
                        <TableCell colSpan={6}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                ▶
                              </span>
                              <span className="font-medium">{weekKey}</span>
                              <Badge variant="outline" className="ml-2">
                                {entries.length} {entries.length === 1 ? 'activity' : 'activities'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{totalMinutes} min</span>
                              <span>{totalDistance.toFixed(1)} km</span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {isExpanded && entries.map((log) => (
                        <TableRow key={log.id} className="bg-background">
                          <TableCell>{getActivityIcon(log.type)}</TableCell>
                          <TableCell>{format(new Date(log.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{log.minutes} min</TableCell>
                          <TableCell>{log.distance ? `${log.distance.toFixed(1)} km` : '-'}</TableCell>
                          <TableCell>{getIntensityBadge(log.intensity)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(log.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

function groupLogsByWeek(logs: ExerciseLog[]): Record<string, ExerciseLog[]> {
  const grouped: Record<string, ExerciseLog[]> = {};
  
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  sortedLogs.forEach(log => {
    const logDate = new Date(log.date);
    const weekStart = new Date(logDate);
    weekStart.setDate(logDate.getDate() - logDate.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekKey = `Week of ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
    
    if (!grouped[weekKey]) {
      grouped[weekKey] = [];
    }
    
    grouped[weekKey].push(log);
  });
  
  return grouped;
}

export default ExerciseTable;
