
import React, { useMemo } from 'react';
import { FastingLog } from '@/lib/types';
import { differenceInSeconds, subDays, subMonths, subYears, startOfDay } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface FastingStatsProps {
  fastingLogs: FastingLog[];
  timeFilter: 'week' | 'month' | 'year';
}

const FastingStats: React.FC<FastingStatsProps> = ({ fastingLogs, timeFilter }) => {
  const stats = useMemo(() => {
    // Filter logs based on time filter
    const now = new Date();
    const filterDate = timeFilter === 'week' 
      ? subDays(now, 7) 
      : timeFilter === 'month' 
        ? subMonths(now, 1) 
        : subYears(now, 1);
    
    const filteredLogs = fastingLogs.filter(log => new Date(log.startTime) >= filterDate);
    
    // Calculate total fasting time in hours
    const totalFastingHours = filteredLogs.reduce((total, log) => {
      if (!log.endTime && log !== fastingLogs[0]) return total;
      
      const startTime = new Date(log.startTime);
      // For active fast, use current time as end time
      const endTime = log.endTime ? new Date(log.endTime) : new Date();
      const fastDurationInSeconds = differenceInSeconds(endTime, startTime);
      return total + (fastDurationInSeconds / 3600);
    }, 0);
    
    // Find longest fast
    let longestFastHours = 0;
    filteredLogs.forEach(log => {
      if (!log.endTime && log !== fastingLogs[0]) return;
      
      const startTime = new Date(log.startTime);
      // For active fast, use current time as end time
      const endTime = log.endTime ? new Date(log.endTime) : new Date();
      const fastDurationInHours = differenceInSeconds(endTime, startTime) / 3600;
      
      if (fastDurationInHours > longestFastHours) {
        longestFastHours = fastDurationInHours;
      }
    });
    
    // Count days with at least one fast
    const daysWithFast = new Set();
    filteredLogs.forEach(log => {
      const date = startOfDay(new Date(log.startTime)).toISOString();
      daysWithFast.add(date);
    });
    
    return {
      totalFasts: filteredLogs.length,
      longestFast: longestFastHours,
      totalFastingTime: totalFastingHours,
      daysWithFast: daysWithFast.size,
    };
  }, [fastingLogs, timeFilter]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (timeFilter === 'week') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();
      const dayOfWeek = now.getDay();
      
      // Reorder days to start with the current week
      const orderedDays = [
        ...days.slice(dayOfWeek + 1),
        ...days.slice(0, dayOfWeek + 1)
      ];
      
      // Initialize data with 0 hours for fasting
      const data = orderedDays.map(day => ({ 
        day, 
        fasting: 0,
        eating: 0
      }));
      
      // Fill in actual hours from logs
      fastingLogs.forEach(log => {
        if (!log.endTime && log !== fastingLogs[0]) return; // Skip non-completed fasts except the current one
        
        const startTime = new Date(log.startTime);
        // For active fast, use current time as end time
        const endTime = log.endTime ? new Date(log.endTime) : new Date();
        
        // Only include logs from the past week
        if (startTime < subDays(now, 7)) return;
        
        const dayIndex = data.findIndex(d => d.day === days[startTime.getDay()]);
        if (dayIndex !== -1) {
          const fastDurationInHours = differenceInSeconds(endTime, startTime) / 3600;
          const cappedFastingHours = Math.min(fastDurationInHours, 24);
          data[dayIndex].fasting = cappedFastingHours;
          
          // Only add eating time for completed fasts
          if (log.endTime) {
            data[dayIndex].eating = Math.max(24 - cappedFastingHours, 0);
          }
        }
      });
      
      return data;
    } else if (timeFilter === 'month') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const data = weeks.map(week => ({ 
        day: week, 
        fasting: 0,
        eating: 0
      }));
      
      // Fill in actual hours from logs
      const now = new Date();
      fastingLogs.forEach(log => {
        if (!log.endTime && log !== fastingLogs[0]) return; // Skip non-completed fasts except the current one
        
        const startTime = new Date(log.startTime);
        // For active fast, use current time as end time
        const endTime = log.endTime ? new Date(log.endTime) : new Date();
        
        // Only include logs from the past month
        if (startTime < subMonths(now, 1)) return;
        
        const dayOfMonth = startTime.getDate();
        let weekIndex = Math.floor((dayOfMonth - 1) / 7);
        if (weekIndex > 3) weekIndex = 3;
        
        const fastDurationInHours = differenceInSeconds(endTime, startTime) / 3600;
        data[weekIndex].fasting += fastDurationInHours;
        
        // Only add eating time for completed fasts
        if (log.endTime) {
          const eatingHours = 24 - (data[weekIndex].fasting % 24);
          data[weekIndex].eating += eatingHours > 0 ? eatingHours : 0;
        }
      });
      
      return data;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = months.map(month => ({ 
        day: month, 
        fasting: 0,
        eating: 0
      }));
      
      // Fill in actual hours from logs
      const now = new Date();
      fastingLogs.forEach(log => {
        if (!log.endTime && log !== fastingLogs[0]) return; // Skip non-completed fasts except the current one
        
        const startTime = new Date(log.startTime);
        // For active fast, use current time as end time
        const endTime = log.endTime ? new Date(log.endTime) : new Date();
        
        // Only include logs from the past year
        if (startTime < subYears(now, 1)) return;
        
        const monthIndex = startTime.getMonth();
        const fastDurationInHours = differenceInSeconds(endTime, startTime) / 3600;
        data[monthIndex].fasting += fastDurationInHours;
        
        // Only add eating time for completed fasts
        if (log.endTime) {
          const daysInMonth = new Date(startTime.getFullYear(), startTime.getMonth() + 1, 0).getDate();
          const totalHoursInMonth = daysInMonth * 24;
          const eatingHours = Math.min(totalHoursInMonth - data[monthIndex].fasting, totalHoursInMonth / 2);
          data[monthIndex].eating = Math.max(eatingHours, 0);
        }
      });
      
      return data;
    }
  }, [fastingLogs, timeFilter]);

  // Format durations
  const formatDuration = (hours: number) => {
    if (hours === 0) return '0h';
    
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    
    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${remainingHours}h`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-md p-4">
          <div className="text-sm text-slate-400">Fasts</div>
          <div className="text-2xl font-bold">{stats.totalFasts || 0}</div>
        </div>
        <div className="bg-slate-800 rounded-md p-4">
          <div className="text-sm text-slate-400">Longest fast</div>
          <div className="text-2xl font-bold">{formatDuration(stats.longestFast)}</div>
        </div>
        <div className="bg-slate-800 rounded-md p-4">
          <div className="text-sm text-slate-400">Total fasting time</div>
          <div className="text-2xl font-bold">{formatDuration(stats.totalFastingTime)}</div>
        </div>
        <div className="bg-slate-800 rounded-md p-4">
          <div className="text-sm text-slate-400">Days with fast</div>
          <div className="text-2xl font-bold">{stats.daysWithFast || 0}</div>
        </div>
      </div>
      
      <div className="h-56 md:h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="day" 
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}h`}
              fontSize={12}
              width={30}
              domain={[0, 24]}
            />
            <Tooltip 
              formatter={(value, name) => [
                `${Math.round(Number(value))} hours`, 
                name === 'fasting' ? 'Fasting Time' : 'Eating Time'
              ]}
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
            <Bar 
              dataKey="fasting" 
              name="Fasting Time"
              stackId="a"
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="eating" 
              name="Eating Time"
              stackId="a"
              fill="#ef4444"
              radius={[0, 0, 4, 4]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FastingStats;
