import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Pill, Plus, Pencil, Trash2, Clock, CheckCircle2, AlarmClock, CalendarDays, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import MedicationAnalytics from "@/components/Medications/MedicationAnalytics";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes: string | null;
  color: string;
  active: boolean;
  created_at: string;
}

const COLORS = [
  { label: "Blue", value: "#3b82f6" },
  { label: "Green", value: "#22c55e" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Yellow", value: "#eab308" },
];

const FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Weekly",
  "As needed",
];

const PRESET_TIMES = ["06:00", "07:00", "08:00", "09:00", "12:00", "13:00", "14:00", "18:00", "20:00", "21:00", "22:00"];

const emptyForm = { name: "", dosage: "", frequency: "Once daily", times: ["08:00"], notes: "", color: "#3b82f6", active: true };

const Medications = () => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `taken-doses-${todayKey}`;
  const { toast } = useToast();
  const [takenDoses, setTakenDoses] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const toggleTaken = (key: string) => {
    setTakenDoses(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchMedications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMedications(data as Medication[]);
    setLoading(false);
  };

  useEffect(() => { fetchMedications(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (med: Medication) => {
    setEditing(med);
    setForm({ name: med.name, dosage: med.dosage, frequency: med.frequency, times: med.times, notes: med.notes ?? "", color: med.color, active: med.active });
    setDialogOpen(true);
  };

  const addTime = () => setForm(f => ({ ...f, times: [...f.times, "08:00"] }));
  const removeTime = (i: number) => setForm(f => ({ ...f, times: f.times.filter((_, idx) => idx !== i) }));
  const updateTime = (i: number, val: string) => setForm(f => ({ ...f, times: f.times.map((t, idx) => idx === i ? val : t) }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.dosage.trim()) {
      toast({ title: "Missing fields", description: "Name and dosage are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    const payload = { name: form.name.trim(), dosage: form.dosage.trim(), frequency: form.frequency, times: form.times, notes: form.notes || null, color: form.color, active: form.active, user_id: session.user.id };

    let error;
    if (editing) {
      ({ error } = await supabase.from("medications").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("medications").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Medication updated" : "Medication added", description: `${form.name} has been saved.` });
      setDialogOpen(false);
      fetchMedications();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("medications").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Medication removed" });
      setDeleteId(null);
      fetchMedications();
    }
  };

  const toggleActive = async (med: Medication) => {
    await supabase.from("medications").update({ active: !med.active }).eq("id", med.id);
    fetchMedications();
  };

  const activeMeds = medications.filter(m => m.active);
  const inactiveMeds = medications.filter(m => !m.active);

  // Build today's schedule from active meds
  const schedule = activeMeds
    .flatMap(med => med.times.map(time => ({ time, med })))
    .sort((a, b) => a.time.localeCompare(b.time));

  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    };
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  // Build dose keys for today's schedule (mirrors key used in toggleTaken)
  const scheduleKeys = schedule.map((item, i) => `${item.med.id}-${item.time}-${i}`);
  const dosesTakenCount = scheduleKeys.filter(k => takenDoses.has(k)).length;
  const dosesRemaining = schedule.length - dosesTakenCount;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" /> Medication Reminders
          </h1>
          <p className="text-muted-foreground">Track your daily medications and never miss a dose</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Medication
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" /> Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedule.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlarmClock className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No medications scheduled. Add one to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {schedule.map(({ time, med }, i) => {
                    const doseKey = `${med.id}-${time}-${i}`;
                    const isTaken = takenDoses.has(doseKey);
                    return (
                      <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg border transition-colors", isTaken ? "opacity-60 bg-muted/30" : "bg-card hover:bg-muted/20")}>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: med.color }} />
                        <div className="flex items-center gap-2 w-20 shrink-0">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-mono font-medium">{time}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.dosage}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={isTaken ? "secondary" : "outline"}
                          className={cn("text-xs h-7 gap-1 shrink-0", isTaken && "text-secondary-foreground")}
                          onClick={() => toggleTaken(doseKey)}
                        >
                          <CheckCircle2 className={cn("h-3 w-3", isTaken ? "text-secondary-foreground" : "text-muted-foreground")} />
                          {isTaken ? "Taken" : "Mark taken"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Medications */}
          {activeMeds.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Active Medications ({activeMeds.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeMeds.map(med => (
                  <MedCard key={med.id} med={med} onEdit={openEdit} onDelete={setDeleteId} onToggle={toggleActive} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats + Inactive */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active medications</span>
                <Badge>{activeMeds.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Doses today</span>
                <Badge variant="secondary">{schedule.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Doses taken</span>
                <Badge variant="outline">{dosesTakenCount}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Remaining today</span>
                <Badge variant={dosesRemaining > 0 ? "default" : "secondary"}>
                  {dosesRemaining} {dosesRemaining === 1 ? "dose" : "doses"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {inactiveMeds.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-muted-foreground">Inactive ({inactiveMeds.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {inactiveMeds.map(med => (
                  <MedCard key={med.id} med={med} onEdit={openEdit} onDelete={setDeleteId} onToggle={toggleActive} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <MedicationAnalytics medications={medications} takenDoses={takenDoses} todayKey={todayKey} />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Medication" : "Add Medication"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Medication Name *</Label>
              <Input placeholder="e.g. Metformin" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Dosage *</Label>
              <Input placeholder="e.g. 500mg" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Reminder Times</Label>
                <Button type="button" size="sm" variant="outline" onClick={addTime} className="h-7 text-xs gap-1">
                  <Plus className="h-3 w-3" /> Add time
                </Button>
              </div>
              {form.times.map((t, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Select value={t} onValueChange={v => updateTime(i, v)}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRESET_TIMES.map(pt => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="time" value={t} onChange={e => updateTime(i, e.target.value)} className="w-32" />
                  {form.times.length > 1 && (
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeTime(i)} className="h-8 w-8 shrink-0">
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Color Tag</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, color: c.value }))}
                    className={cn("w-7 h-7 rounded-full border-2 transition-transform", form.color === c.value ? "border-foreground scale-110" : "border-transparent")}
                    style={{ backgroundColor: c.value }} title={c.label} />
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea placeholder="Take with food, avoid dairy, etc." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editing ? "Update" : "Add Medication"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Medication?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete this medication and all its reminders.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MedCard = ({ med, onEdit, onDelete, onToggle }: { med: Medication; onEdit: (m: Medication) => void; onDelete: (id: string) => void; onToggle: (m: Medication) => void }) => (
  <div className={cn("flex items-start gap-3 p-3 rounded-lg border", !med.active && "opacity-60")}>
    <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: med.color }} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-medium text-sm truncate">{med.name}</p>
        <Badge variant="outline" className="text-xs shrink-0">{med.dosage}</Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">{med.frequency} · {med.times.join(", ")}</p>
      {med.notes && <p className="text-xs text-muted-foreground mt-0.5 italic truncate">{med.notes}</p>}
    </div>
    <div className="flex items-center gap-1 shrink-0">
      <Switch checked={med.active} onCheckedChange={() => onToggle(med)} className="scale-75" />
      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(med)}><Pencil className="h-3 w-3" /></Button>
      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(med.id)}><Trash2 className="h-3 w-3" /></Button>
    </div>
  </div>
);

export default Medications;
