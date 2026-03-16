"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitFeedbackAction, type FeedbackFormState } from "@/server/actions/feedback";
import { Bug, Lightbulb, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { value: "BUG", label: "Bug Report", icon: Bug, color: "text-red-400" },
  { value: "FEATURE", label: "Feature Request", icon: Lightbulb, color: "text-amber-400" },
  { value: "OTHER", label: "Other", icon: MessageSquare, color: "text-blue-400" },
] as const;

const initialState: FeedbackFormState = { success: false };

export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [category, setCategory] = useState<string>("");
  const [titleLength, setTitleLength] = useState(0);
  const [messageLength, setMessageLength] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(submitFeedbackAction, initialState);

  // Close dialog and reset on success
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        onOpenChange(false);
        // Reset form after close animation
        setTimeout(() => {
          setCategory("");
          setTitleLength(0);
          setMessageLength(0);
          formRef.current?.reset();
        }, 200);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        {state.success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
            <p className="text-foreground font-medium text-lg">Thanks for your feedback!</p>
            <p className="text-muted-foreground text-sm">We'll review it soon.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Send Feedback</DialogTitle>
              <DialogDescription>
                Report a bug, suggest a feature, or share your thoughts. Limited to one submission per day.
              </DialogDescription>
            </DialogHeader>

            {state.error && !state.fieldErrors && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            )}

            <form ref={formRef} action={formAction} className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <input type="hidden" name="category" value={category} />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.value} value={cat.value}>
                          <Icon className={cn("w-4 h-4", cat.color)} />
                          {cat.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {state.fieldErrors?.category && (
                  <p className="text-xs text-destructive">{state.fieldErrors.category}</p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Title</Label>
                  <span className={cn(
                    "text-xs",
                    titleLength > 90 ? "text-amber-400" : "text-muted-foreground",
                  )}>
                    {titleLength}/100
                  </span>
                </div>
                <Input
                  id="title"
                  name="title"
                  placeholder="Brief summary of your feedback"
                  maxLength={100}
                  onChange={(e) => setTitleLength(e.target.value.length)}
                />
                {state.fieldErrors?.title && (
                  <p className="text-xs text-destructive">{state.fieldErrors.title}</p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Details</Label>
                  <span className={cn(
                    "text-xs",
                    messageLength > 900 ? "text-amber-400" : "text-muted-foreground",
                  )}>
                    {messageLength}/1000
                  </span>
                </div>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Describe the issue or suggestion in detail..."
                  maxLength={1000}
                  className="min-h-[120px] max-h-[240px] resize-none"
                  onChange={(e) => setMessageLength(e.target.value.length)}
                />
                {state.fieldErrors?.message && (
                  <p className="text-xs text-destructive">{state.fieldErrors.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !category}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
