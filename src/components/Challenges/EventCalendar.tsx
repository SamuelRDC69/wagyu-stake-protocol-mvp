// src/components/Challenges/EventCalendar.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Badge, 
  Button,
  Tooltip 
} from '../common';
import { useChallenges } from '../../hooks/useChallenges';
import { 
  Calendar,
  Star,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const EventCalendar = () => {
  const { events, upcomingEvents, specialEvents } = useChallenges();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDayEvents = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case 'special':
        return 'success';
      case 'tournament':
        return 'warning';
      case 'guild':
        return 'primary';
      default:
        return 'default';
    }
  };

  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  ).getDay();

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <Typography.H3>Event Calendar</Typography.H3>
        </div>
      </div>

      <div className="space-y-6">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>
          <Typography.H4>
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Typography.H4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-2">
              <Typography.Small className="text-gray-500">{day}</Typography.Small>
            </div>
          ))}
          
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-50" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
            const dayEvents = getDayEvents(date);
            
            return (
              <div 
                key={i}
                className={`h-24 p-2 rounded-lg ${
                  date.toDateString() === new Date().toDateString()
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <Typography.Small>{i + 1}</Typography.Small>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((event, eventIndex) => (
                    <Tooltip
                      key={eventIndex}
                      content={
                        <div>
                          <div>{event.name}</div>
                          <div className="text-sm text-gray-400">{event.description}</div>
                          <div className="text-sm">{event.startTime}</div>
                        </div>
                      }
                    >
                      <div className="truncate">
                        <Badge variant={getEventBadgeVariant(event.type)}>
                          {event.name}
                        </Badge>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Events */}
        <div>
          <Typography.Label className="mb-4">Upcoming Events</Typography.Label>
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div 
                key={event.id}
                className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getEventBadgeVariant(event.type)}>
                        {event.type}
                      </Badge>
                      <Typography.Body>{event.name}</Typography.Body>
                    </div>
                    <Typography.Small className="text-gray-500 mt-1">
                      {event.description}
                    </Typography.Small>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <Typography.Small>
                      {new Date(event.startTime).toLocaleString()}
                    </Typography.Small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Events */}
        {specialEvents.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <Typography.H4>Special Events</Typography.H4>
            </div>
            <div className="space-y-3">
              {specialEvents.map(event => (
                <div key={event.id} className="flex justify-between items-center">
                  <div>
                    <Typography.Body>{event.name}</Typography.Body>
                    <Typography.Small className="text-gray-500">
                      {event.description}
                    </Typography.Small>
                  </div>
                  <Award className="w-5 h-5 text-primary" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EventCalendar;