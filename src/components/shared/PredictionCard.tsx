// src/components/shared/PredictionCard.tsx
'use client';

import React, { useState } from "react";
import { Prediction } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Flame, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { GenerateExplanationDialog } from "./GenerateExplanationDialog";
import Image from "next/image";

const StatusIcon = ({ status }: { status?: Prediction["status"] }) => {
  switch (status) {
    case "won":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "lost":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

export function PredictionCard({ prediction }: { prediction: Prediction }) {
  if (!prediction) return null;
  const [open, setOpen] = useState(false);

  const {
    league,
    matchDateUtc,
    prediction: predText,
    odds,
    status,
    is_vip,
    homeTeam,
    awayTeam,
    confidence,
    bucket,
    outcomes,
  } = prediction;

  const homeTeamName = homeTeam?.name || "Home";
  const awayTeamName = awayTeam?.name || "Away";
  const homeTeamLogo = homeTeam?.logoUrl;
  const awayTeamLogo = awayTeam?.logoUrl;

  return (
    <Card className="flex h-full flex-col bg-card shadow-md transition-shadow duration-300 hover:shadow-xl border-border/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-muted-foreground truncate">{league || "Match"}</CardTitle>
          {is_vip && <Badge className="bg-yellow-500 text-black">VIP</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">
          {matchDateUtc ? format(new Date(matchDateUtc), "MMM d, yyyy - HH:mm") : "Date TBD"}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-4">
        <div className="flex items-center justify-around text-center">
          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              {homeTeamLogo ? <Image src={homeTeamLogo} alt={homeTeamName} width={40} height={40} /> : <AvatarFallback>{homeTeamName.charAt(0).toUpperCase()}</AvatarFallback>}
            </Avatar>
            <span className="font-medium text-sm break-words">{homeTeamName}</span>
          </div>

          <span className="text-2xl font-bold text-muted-foreground">vs</span>

          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              {awayTeamLogo ? <Image src={awayTeamLogo} alt={awayTeamName} width={40} height={40} /> : <AvatarFallback>{awayTeamName.charAt(0).toUpperCase()}</AvatarFallback>}
            </Avatar>
            <span className="font-medium text-sm break-words">{awayTeamName}</span>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">Prediction</p>
          <p className="font-bold text-primary text-lg">{predText || "-"}</p>
          <p className="text-xs text-muted-foreground">{bucket ? `(${bucket})` : ""}</p>
        </div>

        {/* Expand toggle */}
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 text-sm text-muted-foreground underline"
            aria-expanded={open}
          >
            {open ? "Hide details" : "Show details"}
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {open && (
          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
            {typeof confidence === "number" && <div>Confidence: <strong>{confidence}%</strong></div>}
            {outcomes?.oneXTwo && (
              <div>
                <div className="font-semibold">1X2</div>
                <div className="flex gap-4">
                  <div>Home: {(outcomes.oneXTwo.home * 100).toFixed(0)}%</div>
                  <div>Draw: {(outcomes.oneXTwo.draw * 100).toFixed(0)}%</div>
                  <div>Away: {(outcomes.oneXTwo.away * 100).toFixed(0)}%</div>
                </div>
              </div>
            )}
            {outcomes?.doubleChance && (
              <div>
                <div className="font-semibold">Double Chance</div>
                <div className="flex gap-4">
                  <div>H/D: {(outcomes.doubleChance.homeOrDraw * 100).toFixed(0)}%</div>
                  <div>H/A: {(outcomes.doubleChance.homeOrAway * 100).toFixed(0)}%</div>
                  <div>D/A: {(outcomes.doubleChance.drawOrAway * 100).toFixed(0)}%</div>
                </div>
              </div>
            )}
            {outcomes?.over25 !== undefined && <div>Over 2.5 chance: {(outcomes.over25 * 100).toFixed(0)}%</div>}
            {outcomes?.bttsYes !== undefined && <div>BTTS Yes: {(outcomes.bttsYes * 100).toFixed(0)}%</div>}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-accent" />
          <span className="font-bold text-lg">{odds ? (odds > 1 ? odds.toFixed(2) : odds) : "-.--"}</span>
          <span className="text-sm text-muted-foreground">Odds</span>
        </div>
        <div className="flex items-center gap-2">
          <GenerateExplanationDialog prediction={prediction} />
          <StatusIcon status={status} />
        </div>
      </CardFooter>
    </Card>
  );
      }
