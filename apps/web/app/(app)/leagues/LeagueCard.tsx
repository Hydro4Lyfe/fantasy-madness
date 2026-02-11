import { Calendar, Users } from 'lucide-react';

export interface League {
  id: string;
  name: string;
  currentSize: number;
  capacity: number;
  status: 'open' | 'closed' | 'full';
  closeDateTime: Date | null;
}

interface LeagueCardProps {
  league: League;
}

export function LeagueCard({ league }: LeagueCardProps) {
  const getStatusColor = (status: League['status']) => {
    switch (status) {
      case 'open':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
      case 'closed':
        return 'text-slate-300 bg-slate-500/10 border-slate-500/30';
      case 'full':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="bg-card/70 border border-border rounded-lg p-6 hover:border-border/80 hover:bg-card transition-colors">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-foreground text-lg font-semibold m-0">{league.name}</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm border capitalize ${getStatusColor(
            league.status
          )}`}
        >
          {league.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">
            {league.currentSize} / {league.capacity} participants
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <div className="text-sm">
            <span className="text-muted-foreground/80">Closes:</span>{' '}
            <span className="text-foreground/90">
              {league.closeDateTime ? formatDateTime(league.closeDateTime) : 'TBD'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
