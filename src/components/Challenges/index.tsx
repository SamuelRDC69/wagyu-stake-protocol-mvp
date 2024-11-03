// src/components/Challenges/index.tsx
import DailyMissions from './DailyMissions';
import WeeklyTournaments from './WeeklyTournaments';
import EventCalendar from './EventCalendar';
import SpecialEvents from './SpecialEvents';

const Challenges = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DailyMissions />
        <WeeklyTournaments />
      </div>
      <SpecialEvents />
      <EventCalendar />
    </div>
  );
};

export default Challenges;
export {
  DailyMissions,
  WeeklyTournaments,
  EventCalendar,
  SpecialEvents
};