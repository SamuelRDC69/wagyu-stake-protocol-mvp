// src/components/Strategy/ClaimHeatmap.tsx
import { useMemo } from 'react';
import { 
  Card, 
  Typography, 
  Badge,
  Tooltip 
} from '../common';
import { useClaimStrategy } from '../../hooks/useClaimStrategy';
import { Calendar, HelpCircle } from 'lucide-react';

const ClaimHeatmap = () => {
  const { claimHeatmapData } = useClaimStrategy();

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getHeatmapColor = (value: number) => {
    if (value >= 80) return 'bg-blue-900 dark:bg-blue-800';
    if (value >= 60) return 'bg-blue-700 dark:bg-blue-600';
    if (value >= 40) return 'bg-blue-500 dark:bg-blue-400';
    if (value >= 20) return 'bg-blue-300 dark:bg-blue-200';
    return 'bg-blue-100 dark:bg-blue-50';
  };

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <Typography.H3>Claim Activity Heatmap</Typography.H3>
        </div>
        <Tooltip content="Based on historical claim patterns">
          <HelpCircle className="w-5 h-5 text-gray-500" />
        </Tooltip>
      </div>

      <div className="space-y-6">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[auto_repeat(24,1fr)] gap-1">
              {/* Headers */}
              <div className="h-8" />
              {hours.map(hour => (
                <div key={hour} className="flex justify-center items-center h-8">
                  <Typography.Small className="text-gray-500">
                    {hour.toString().padStart(2, '0')}
                  </Typography.Small>
                </div>
              ))}

              {/* Heatmap cells */}
              {days.map(day => (
                <React.Fragment key={day}>
                  <div className="flex items-center h-10">
                    <Typography.Label>{day}</Typography.Label>
                  </div>
                  {hours.map(hour => {
                    const cellData = claimHeatmapData.find(
                      d => d.hour === hour && d.day === day
                    ) || { value: 0, claims: 0 };

                    return (
                      <Tooltip
                        key={`${day}-${hour}`}
                        content={
                          <div className="text-center">
                            <div>{cellData.claims} claims</div>
                            <div>{cellData.value}% activity</div>
                            <div>{day} at {hour}:00</div>
                          </div>
                        }
                      >
                        <div
                          className={`h-10 rounded-sm transition-colors ${getHeatmapColor(cellData.value)}`}
                        />
                      </Tooltip>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center px-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-50 rounded-sm" />
              <Typography.Small>Low Activity</Typography.Small>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-sm" />
              <Typography.Small>Medium Activity</Typography.Small>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-900 dark:bg-blue-800 rounded-sm" />
              <Typography.Small>High Activity</Typography.Small>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <Typography.Label className="mb-2">Strategy Tips</Typography.Label>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <Typography.Small>
                Lighter cells indicate better claiming opportunities
              </Typography.Small>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <Typography.Small>
                Consider claiming during low activity periods
              </Typography.Small>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default ClaimHeatmap;