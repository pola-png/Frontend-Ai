'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getExplanationAction } from '@/app/actions';
import { Match, Prediction } from '@/lib/types';
import { Sparkles } from 'lucide-react';
import { Icons } from './Icons';
import { ScrollArea } from '../ui/scroll-area';

export function GenerateExplanationDialog({ prediction }: { prediction: Prediction }) {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    if (!prediction.prediction) {
      setError('No prediction data available to generate an explanation.');
      return;
    }
    setIsLoading(true);
    setError('');
    setExplanation('');
    const result = await getExplanationAction({
      team1: prediction.teams.home,
      team2: prediction.teams.away,
      prediction: prediction.prediction,
      relevantStats: prediction.analysis,
    });
    setIsLoading(false);
    if ('error' in result) {
      setError(result.error);
    } else {
      setExplanation(result.explanation);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Generate AI Explanation" disabled={!prediction}>
          <Sparkles className="h-5 w-5 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={handleGenerate}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Prediction Analysis
          </DialogTitle>
          <DialogDescription>
            AI-generated explanation for the prediction on {prediction.fixture}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="py-4 space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating explanation...</p>
              </div>
            )}
            {error && <p className="text-destructive">{error}</p>}
            {explanation && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
                {explanation.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
