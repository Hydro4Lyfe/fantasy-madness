import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Users,
  Calendar,
  DollarSign,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Zap,
} from 'lucide-react';

interface DraftDetails {
  id: number;
  name: string;
  participants: number;
  maxParticipants: number;
  startDate: string;
  prizePool: number;
  entryFee: number;
  difficulty: string;
  spotsLeft: number;
}

interface JoinDraftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: DraftDetails | null;
  onConfirm: () => void;
}

export function JoinDraftDialog({ open, onOpenChange, draft, onConfirm }: JoinDraftDialogProps) {
  const [isJoining, setIsJoining] = useState(false);

  if (!draft) return null;

  const handleConfirm = async () => {
    setIsJoining(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onConfirm();
    setIsJoining(false);
    onOpenChange(false);
  };

  const spotsRemaining = draft.maxParticipants - draft.participants;
  const spotsPercentage = (draft.participants / draft.maxParticipants) * 100;

  // Format draft data for display
  const draftTime = '7:00 PM ET';
  const draftDate = draft.startDate;
  const timePerPick = '90 seconds';
  const rounds = 8;
  const format = 'Snake Draft';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            Join Draft
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review the draft details before joining
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Draft Name */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{draft.name}</h3>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                {format}
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                {rounds} Rounds
              </Badge>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-muted-foreground">Draft Date</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{draftDate}</p>
              <p className="text-xs text-muted-foreground">{draftTime}</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-muted-foreground">Time Per Pick</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{timePerPick}</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-xs text-muted-foreground">Entry Fee</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {draft.entryFee === 0 ? 'Free' : `$${draft.entryFee}`}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-muted-foreground">Prize Pool</span>
              </div>
              <p className="text-sm font-semibold text-foreground">${draft.prizePool.toLocaleString()}</p>
            </div>
          </div>

          {/* Participants Status */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-foreground">Participants</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {draft.participants} / {draft.maxParticipants}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                style={{ width: `${spotsPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} remaining
              </p>
              {spotsRemaining <= 3 && (
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Filling Fast
                </Badge>
              )}
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Before you join</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Make sure you're available at the draft time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Entry fee of {draft.entryFee === 0 ? 'Free' : `$${draft.entryFee}`} will be charged upon confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>You'll receive a notification 30 minutes before the draft starts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isJoining}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm & Join
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}