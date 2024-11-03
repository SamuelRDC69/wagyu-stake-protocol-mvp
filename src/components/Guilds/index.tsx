// src/components/Guilds/index.tsx
import GuildLeaderboard from './GuildLeaderboard';
import GuildBattles from './GuildBattles';
import GuildMemberList from './GuildMemberList';
import GuildManagement from './GuildManagement';

const Guilds = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GuildLeaderboard />
        <GuildBattles />
      </div>
      <GuildMemberList />
      <GuildManagement />
    </div>
  );
};

export default Guilds;
export {
  GuildLeaderboard,
  GuildBattles,
  GuildMemberList,
  GuildManagement
};