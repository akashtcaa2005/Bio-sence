import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { TrendingUp, CheckCircle2, XCircle, BarChart2, Minus } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  color: string;
  active: boolean;
}

interface MedicationAnalyticsProps {
  medications: Medication[];
  takenDoses: Set<string>;
  todayKey: string;
}

const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
};

const getDayLabel = (dateStr: string) =>
  new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });

const getTakenForDay = (dateStr: string): Set<string> => {
  try {
    const raw = localStorage.getItem(`taken-doses-${dateStr}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
};

/**
 * Returns how many doses per day this medication expects.
 * "As needed" = 0 (excluded from adherence).
 * "Weekly"    = only on designated days (handled separately).
 */
const getDailyExpected = (frequency: string, timesCount: number): number => {
  if (frequency === "As needed") return 0;
  if (frequency === "Weekly") return 0; // handled per-week
  return timesCount;
};

/**
 * For weekly meds, only count on the first day of the 7-day window.
 */
const isWeeklyDueDay = (dateStr: string, last7: string[]): boolean =>
  dateStr === last7[0];

/**
 * Mirrors the key used in Medications.tsx:
 * schedule is sorted by time, then keyed as `${med.id}-${time}-${flatIndex}`
 */
const buildScheduleKeys = (activeMeds: Medication[]) => {
  const flat = activeMeds
    .flatMap(med => med.times.map(time => ({ medId: med.id, time, frequency: med.frequency })))
    .sort((a, b) => a.time.localeCompare(b.time));
  return flat.map(({ medId, time, frequency }, idx) => ({ medId, key: `${medId}-${time}-${idx}`, frequency }));
};

const barColor = (entry: { isToday: boolean; pct: number }) => {
  if (entry.isToday) return "hsl(var(--primary))";
  if (entry.pct >= 90) return "hsl(142 71% 45%)";
  if (entry.pct >= 70) return "hsl(var(--primary) / 0.65)";
  if (entry.pct >= 50) return "hsl(38 92% 50%)";
  return "hsl(var(--destructive) / 0.7)";
};

const MedicationAnalytics = ({ medications, takenDoses, todayKey }: MedicationAnalyticsProps) => {
  const activeMeds = useMemo(() => medications.filter(m => m.active), [medications]);
  const last7 = useMemo(() => getLast7Days(), []);
  const scheduleKeys = useMemo(() => buildScheduleKeys(activeMeds), [activeMeds]);

  const getEffectiveTaken = (dateStr: string): Set<string> =>
    dateStr === todayKey ? takenDoses : getTakenForDay(dateStr);

  // ── Daily bar chart data ──────────────────────────────────────────
  const dailyData = useMemo(() =>
    last7.map(dateStr => {
      const taken = getEffectiveTaken(dateStr);

      // Count expected & taken for this day respecting frequency
      let total = 0;
      let takenCount = 0;

      activeMeds.forEach(med => {
        const dailyExp = getDailyExpected(med.frequency, med.times.length);
        const isWeekly = med.frequency === "Weekly";
        const isAsNeeded = med.frequency === "As needed";

        if (isAsNeeded) return; // skip
        if (isWeekly && !isWeeklyDueDay(dateStr, last7)) return; // only count once

        const medKeys = scheduleKeys
          .filter(s => s.medId === med.id)
          .map(s => s.key);

        total += isWeekly ? med.times.length : dailyExp;
        takenCount += medKeys.filter(k => taken.has(k)).length;
      });

      const pct = total > 0 ? Math.round((takenCount / total) * 100) : 0;
      return {
        day: getDayLabel(dateStr),
        date: dateStr,
        taken: takenCount,
        total,
        pct,
        isToday: dateStr === todayKey,
      };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [last7, scheduleKeys, activeMeds, todayKey, takenDoses]
  );

  // ── Per-medication stats ──────────────────────────────────────────
  const medStats = useMemo(() =>
    activeMeds.map(med => {
      const isAsNeeded = med.frequency === "As needed";
      const isWeekly = med.frequency === "Weekly";
      const medKeys = scheduleKeys.filter(s => s.medId === med.id).map(s => s.key);

      let totalPossible = 0;
      let totalTaken = 0;

      if (isAsNeeded) {
        // count every marking but don't compute adherence %
        last7.forEach(dateStr => {
          const taken = getEffectiveTaken(dateStr);
          totalTaken += medKeys.filter(k => taken.has(k)).length;
        });
        totalPossible = 0; // no fixed expectation
      } else if (isWeekly) {
        totalPossible = med.times.length; // 1 expected set per week
        const taken = getEffectiveTaken(last7[0]);
        totalTaken = medKeys.filter(k => taken.has(k)).length;
      } else {
        last7.forEach(dateStr => {
          const taken = getEffectiveTaken(dateStr);
          totalPossible += med.times.length;
          totalTaken += medKeys.filter(k => taken.has(k)).length;
        });
      }

      const pct = totalPossible > 0 ? Math.round((totalTaken / totalPossible) * 100) : null;
      return { med, totalPossible, totalTaken, pct, isAsNeeded, isWeekly };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeMeds, scheduleKeys, last7, todayKey, takenDoses]
  );

  const trackableMeds = medStats.filter(s => s.pct !== null);
  const overallPct = trackableMeds.length > 0
    ? Math.round(trackableMeds.reduce((sum, s) => sum + (s.pct ?? 0), 0) / trackableMeds.length)
    : 0;

  const adherenceLabel =
    overallPct >= 90 ? "Excellent" :
    overallPct >= 70 ? "Good" :
    overallPct >= 50 ? "Fair" : "Needs Attention";

  const adherenceVariant: "default" | "secondary" | "destructive" =
    overallPct >= 90 ? "default" : overallPct >= 70 ? "secondary" : "destructive";

  if (activeMeds.length === 0) return null;

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BarChart2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Medication Analytics</h2>
        {trackableMeds.length > 0 && (
          <Badge variant={adherenceVariant} className="ml-auto">
            {adherenceLabel} — {overallPct}%
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── 7-Day Adherence Bar Chart ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> 7-Day Adherence
              <span className="text-xs text-muted-foreground font-normal ml-1">(excludes "As needed")</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={dailyData} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={v => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  formatter={(_val: unknown, _name: unknown, props: { payload?: { taken?: number; total?: number; pct?: number } }) => [
                    `${props.payload?.pct ?? 0}%  (${props.payload?.taken ?? 0} / ${props.payload?.total ?? 0} doses)`,
                    "Adherence"
                  ]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(var(--foreground))"
                  }}
                />
                <Bar dataKey="pct" radius={[5, 5, 0, 0]}>
                  {dailyData.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
              {[
                { color: "hsl(var(--primary))", label: "Today" },
                { color: "hsl(142 71% 45%)", label: "≥90%" },
                { color: "hsl(var(--primary) / 0.65)", label: "70–89%" },
                { color: "hsl(38 92% 50%)", label: "50–69%" },
                { color: "hsl(var(--destructive) / 0.7)", label: "<50%" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Per-Tablet Adherence Table ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Per-Tablet Report (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medStats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No data yet — start marking doses taken
                </p>
              ) : (
                medStats.map(({ med, totalTaken, totalPossible, pct, isAsNeeded, isWeekly }) => (
                  <div key={med.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: med.color }} />
                        <div className="min-w-0">
                          <span className="text-sm font-medium truncate block">{med.name}</span>
                          <span className="text-xs text-muted-foreground">{med.frequency}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isAsNeeded ? (
                          <>
                            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-bold tabular-nums">{totalTaken} taken</span>
                            <Badge variant="outline" className="text-xs">As needed</Badge>
                          </>
                        ) : isWeekly ? (
                          <>
                            {totalTaken >= totalPossible
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                            <span className="text-sm font-bold tabular-nums">{pct}%</span>
                            <span className="text-xs text-muted-foreground">({totalTaken}/{totalPossible} this week)</span>
                          </>
                        ) : (
                          <>
                            {(pct ?? 0) >= 80
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                            <span className="text-sm font-bold tabular-nums">{pct}%</span>
                            <span className="text-xs text-muted-foreground">({totalTaken}/{totalPossible})</span>
                          </>
                        )}
                      </div>
                    </div>
                    {!isAsNeeded && (
                      <Progress value={pct ?? 0} className="h-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicationAnalytics;
