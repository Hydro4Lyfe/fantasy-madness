import Link from "next/link";

type DraftStatus = "OPEN" | "DRAFTING" | "LOCKED" | "COMPLETE";

type DraftCardProps = {
  id: string;
  name: string;
  status: DraftStatus;
  tournamentName?: string;
  tournamentYear?: number;
  isPrivate?: boolean;
  participantCount: number;
  rosterSize: number;
  pickTimerSec?: number | null;
  isParticipant?: boolean;
};

function StatusBadge({ status }: { status: DraftStatus }) {
  const config = {
    OPEN: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      border: "border-green-500/30",
      label: "Open",
    },
    DRAFTING: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
      label: "Live",
      pulse: true,
    },
    LOCKED: {
      bg: "bg-amber-500/20",
      text: "text-amber-400",
      border: "border-amber-500/30",
      label: "Starting",
      pulse: true,
    },
    COMPLETE: {
      bg: "bg-gray-500/20",
      text: "text-gray-400",
      border: "border-gray-500/30",
      label: "Finished",
    },
  }[status];

  return (
    <span
      className={`px-3 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-full border ${config.border} ${config.pulse ? "animate-pulse" : ""}`}
    >
      {config.label}
    </span>
  );
}

function ProgressBar({ current, max, status }: { current: number; max: number; status: DraftStatus }) {
  const percent = (current / max) * 100;

  const gradientClass = {
    OPEN: "from-indigo-500 to-purple-500",
    DRAFTING: "from-red-500 to-pink-500",
    LOCKED: "from-amber-500 to-orange-500",
    COMPLETE: "from-gray-600 to-gray-500",
  }[status];

  return (
    <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${gradientClass}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function ActionButton({ status, draftId, isParticipant }: { status: DraftStatus; draftId: string; isParticipant?: boolean }) {
  if (status === "DRAFTING") {
    return (
      <Link
        href={`/drafts/${draftId}/room`}
        className="block w-full py-3 gradient-live text-white font-semibold rounded-lg transition text-center glow-border"
      >
        Enter Draft Room
      </Link>
    );
  }

  if (status === "LOCKED") {
    return (
      <Link
        href={`/drafts/${draftId}/lobby`}
        className="block w-full py-3 gradient-starting text-white font-semibold rounded-lg transition text-center"
      >
        View Lobby
      </Link>
    );
  }

  if (status === "COMPLETE") {
    return (
      <Link
        href={`/drafts/${draftId}/results`}
        className="block w-full py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold rounded-lg transition text-center"
      >
        View Results
      </Link>
    );
  }

  // OPEN status
  if (isParticipant) {
    return (
      <Link
        href={`/drafts/${draftId}`}
        className="block w-full py-3 gradient-primary text-white font-semibold rounded-lg transition text-center"
      >
        View Draft
      </Link>
    );
  }

  return (
    <Link
      href={`/drafts/${draftId}`}
      className="block w-full py-3 gradient-primary text-white font-semibold rounded-lg transition text-center"
    >
      Join Draft
    </Link>
  );
}

export function DraftCard({
  id,
  name,
  status,
  tournamentName = "NCAA Tournament",
  tournamentYear = 2025,
  isPrivate = false,
  participantCount,
  rosterSize,
  pickTimerSec,
  isParticipant,
}: DraftCardProps) {
  const isLive = status === "DRAFTING";

  return (
    <article
      className={`glass-card glass-card-hover rounded-xl overflow-hidden ${isLive ? "border-2 border-indigo-500/50" : ""}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>{tournamentName} {tournamentYear}</span>
              <span className="text-gray-600">•</span>
              <span>{isPrivate ? "Private" : "Public"}</span>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Players</span>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(participantCount, 5) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-dark-700"
                  />
                ))}
                {participantCount > 5 && (
                  <div className="w-6 h-6 rounded-full bg-dark-700 border-2 border-dark-700 flex items-center justify-center text-xs text-gray-400">
                    +{participantCount - 5}
                  </div>
                )}
              </div>
              <span className="text-white font-semibold">
                {participantCount}/{rosterSize}
              </span>
            </div>
          </div>

          {pickTimerSec && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Pick Timer</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded border border-amber-500/30">
                {pickTimerSec}s
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Status</span>
            <span className="text-white font-semibold capitalize">{status.toLowerCase()}</span>
          </div>
        </div>

        <div className="mb-4">
          <ProgressBar current={participantCount} max={rosterSize} status={status} />
        </div>

        <ActionButton status={status} draftId={id} isParticipant={isParticipant} />
      </div>
    </article>
  );
}
