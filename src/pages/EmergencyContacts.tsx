import { useState, useEffect } from "react";
import {
  UserPlus, Users, Mail, Phone, Trash2, Bell, BellOff,
  CheckCircle2, Clock, ShieldCheck, MessageSquare, RefreshCw,
  AlertTriangle, Shield, Smartphone, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string;
  verified: boolean;
  notify_on_alerts: boolean;
  is_active: boolean;
}

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editContact, setEditContact] = useState<EmergencyContact | null>(null);
  const [editForm, setEditForm] = useState({ name: "", relationship: "", phone: "", whatsapp: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [otpContact, setOtpContact] = useState<EmergencyContact | null>(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState<string | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<{ code: string; contactName: string } | null>(null);
  const [newContact, setNewContact] = useState({
    name: "", relationship: "", phone: "", whatsapp: "", email: "",
  });
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const fetchContacts = async (userId: string) => {
    setFetchError(null);
    const { data, error } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setFetchError(error.message);
    } else {
      setContacts((data as any[]).map((c: any) => ({
        id: c.id,
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        whatsapp: c.whatsapp ?? null,
        email: c.email,
        verified: c.verified ?? false,
        notify_on_alerts: c.notify_on_alerts,
        is_active: c.is_active,
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    // Wait for auth session before fetching
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        fetchContacts(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Also fetch immediately if session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        fetchContacts(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addContact = async () => {
    if (!newContact.name || !newContact.email) return;

    // Get userId from state, or fall back to getUser() if not yet set
    let userId = currentUserId;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Not authenticated", description: "Please log in to add contacts.", variant: "destructive" });
        return;
      }
      userId = user.id;
      setCurrentUserId(userId);
    }
    setAdding(true);
    try {
      const { error } = await supabase
        .from("emergency_contacts")
        .insert({
          user_id: userId,
          name: newContact.name,
          email: newContact.email,
          phone: newContact.phone || null,
          whatsapp: newContact.whatsapp || null,
          relationship: newContact.relationship || null,
          contact_type: "family",
          notify_on_alerts: true,
          is_active: true,
          verified: false,
        } as any);

      if (error) throw error;

      toast({ title: "✅ Contact added!", description: `${newContact.name} added. Send OTP to verify.` });
      setNewContact({ name: "", relationship: "", phone: "", whatsapp: "", email: "" });
      setIsAddOpen(false);
      if (currentUserId) fetchContacts(currentUserId);
    } catch (e: any) {
      toast({ title: "Failed to add contact", description: e.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const sendOTP = async (contact: EmergencyContact) => {
    setSendingOtp(contact.id);
    try {
      // Generate OTP client-side and store in DB
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from("emergency_contacts")
        .update({
          otp_code: code,
          otp_expires_at: expiresAt,
          verification_sent_at: new Date().toISOString(),
        } as any)
        .eq("id", contact.id);

      if (error) throw error;

      // Show the code so the user can share it with the contact manually
      setGeneratedOtp({ code, contactName: contact.name });
      toast({
        title: "✅ OTP Generated!",
        description: `Share the code with ${contact.name}. It expires in 10 minutes.`,
      });
    } catch (e: any) {
      toast({ title: "Failed to generate OTP", description: e.message, variant: "destructive" });
    } finally {
      setSendingOtp(null);
    }
  };

  const verifyOTP = async () => {
    if (!otpContact || otp.length !== 6) return;
    setOtpLoading(true);
    try {
      // Fetch contact's stored OTP from DB and compare
      const { data: contact, error: fetchErr } = await supabase
        .from("emergency_contacts")
        .select("otp_code, otp_expires_at")
        .eq("id", otpContact.id)
        .single();

      if (fetchErr || !contact) throw new Error("Contact not found");

      const storedOtp = (contact as any).otp_code;
      const expiresAt = (contact as any).otp_expires_at;

      if (!storedOtp) throw new Error("No OTP generated yet. Please click Send OTP first.");
      if (new Date(expiresAt) < new Date()) throw new Error("OTP has expired. Please request a new one.");
      if (storedOtp !== otp) throw new Error("Incorrect OTP code. Please try again.");

      // OTP correct — mark contact as verified and clear otp_code
      const { error: updateErr } = await supabase
        .from("emergency_contacts")
        .update({ verified: true, otp_code: null, otp_expires_at: null } as any)
        .eq("id", otpContact.id);

      if (updateErr) throw updateErr;

      toast({ title: "✅ Verified!", description: `${otpContact.name} is now a verified emergency contact.` });
      setOtpContact(null);
      setOtp("");
      if (currentUserId) fetchContacts(currentUserId);
    } catch (e: any) {
      toast({ title: "Verification failed", description: e.message, variant: "destructive" });
    } finally {
      setOtpLoading(false);
    }
  };

  const deleteContact = async (id: string, name: string) => {
    const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contact removed", description: `${name} has been removed.` });
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  const toggleNotify = async (contact: EmergencyContact) => {
    const { error } = await supabase
      .from("emergency_contacts")
      .update({ notify_on_alerts: !contact.notify_on_alerts })
      .eq("id", contact.id);
    if (!error) {
      setContacts(prev => prev.map(c =>
        c.id === contact.id ? { ...c, notify_on_alerts: !c.notify_on_alerts } : c
      ));
    }
  };

  const openEdit = (contact: EmergencyContact) => {
    setEditContact(contact);
    setEditForm({
      name: contact.name,
      relationship: contact.relationship ?? "",
      phone: contact.phone ?? "",
      whatsapp: contact.whatsapp ?? "",
      email: contact.email,
    });
  };

  const saveEdit = async () => {
    if (!editContact || !editForm.name || !editForm.email) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("emergency_contacts")
        .update({
          name: editForm.name,
          relationship: editForm.relationship || null,
          phone: editForm.phone || null,
          whatsapp: editForm.whatsapp || null,
          email: editForm.email,
        } as any)
        .eq("id", editContact.id);
      if (error) throw error;
      toast({ title: "✅ Contact updated!", description: `${editForm.name} has been updated.` });
      setEditContact(null);
      if (currentUserId) fetchContacts(currentUserId);
    } catch (e: any) {
      toast({ title: "Failed to update", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const verifiedCount = contacts.filter(c => c.verified).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Emergency Contacts
          </h1>
          <p className="text-muted-foreground mt-1">
            Add and verify family members to receive emergency alerts via SMS, WhatsApp & Email
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Emergency Contact</DialogTitle>
              <DialogDescription>
                They will receive a verification OTP via SMS, WhatsApp, and email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ec-name">Full Name *</Label>
                  <Input id="ec-name" placeholder="Jane Doe" value={newContact.name}
                    onChange={e => setNewContact({ ...newContact, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ec-rel">Relationship</Label>
                  <Input id="ec-rel" placeholder="Spouse, Parent…" value={newContact.relationship}
                    onChange={e => setNewContact({ ...newContact, relationship: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec-email">Email Address *</Label>
                <Input id="ec-email" type="email" placeholder="jane@example.com" value={newContact.email}
                  onChange={e => setNewContact({ ...newContact, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec-phone">Phone Number (for SMS)</Label>
                <Input id="ec-phone" placeholder="+1 234 567 8900" value={newContact.phone}
                  onChange={e => setNewContact({ ...newContact, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec-wa">WhatsApp Number</Label>
                <Input id="ec-wa" placeholder="+1 234 567 8900" value={newContact.whatsapp}
                  onChange={e => setNewContact({ ...newContact, whatsapp: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={addContact} disabled={adding || !newContact.name || !newContact.email}>
                {adding ? "Adding…" : "Add Contact"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contacts.length}</p>
              <p className="text-xs text-muted-foreground">Total Contacts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{contacts.length - verifiedCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Only <strong>verified contacts</strong> will receive SOS alerts. After adding a contact, send OTP and enter the code they receive.
          </p>
        </CardContent>
      </Card>

      {/* Error Banner */}
      {fetchError && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-red-800 dark:text-red-300 text-sm">Error loading contacts</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1 font-mono break-all">{fetchError}</p>
              </div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/40 rounded-md p-3 mb-3">
              <p className="text-xs text-red-800 dark:text-red-300 font-semibold mb-1">🔧 Fix required:</p>
              <p className="text-xs text-red-700 dark:text-red-400">
                Run the SQL fix in your <strong>Supabase Dashboard → SQL Editor</strong>.<br />
                File: <code className="bg-red-200 dark:bg-red-800 px-1 rounded">supabase/migrations/20260313_fix_emergency_contacts_schema.sql</code>
              </p>
            </div>
            <Button size="sm" variant="outline" className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
              onClick={() => currentUserId && fetchContacts(currentUserId)}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contact List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-14 w-14 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No contacts yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Add family members who should be notified in an emergency.
            </p>
            <Button onClick={() => setIsAddOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Your First Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contacts.map(contact => (
            <Card key={contact.id} className={`relative overflow-hidden transition-all ${contact.verified ? "border-green-200" : "border-amber-200"}`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${contact.verified ? "bg-green-500" : "bg-amber-400"}`} />
              <CardContent className="p-5 pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-full ${contact.verified ? "bg-green-100" : "bg-amber-100"}`}>
                      <Users className={`h-5 w-5 ${contact.verified ? "text-green-600" : "text-amber-600"}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{contact.name}</h4>
                      {contact.relationship && (
                        <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(contact)}>
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleNotify(contact)}>
                      {contact.notify_on_alerts
                        ? <Bell className="h-3.5 w-3.5 text-primary" />
                        : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteContact(contact.id, contact.name)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.whatsapp && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Smartphone className="h-3.5 w-3.5 shrink-0" />
                      <span>{contact.whatsapp} (WhatsApp)</span>
                    </div>
                  )}
                </div>

                <div className="mb-0">
                  {contact.verified ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-300 text-amber-700 gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      Pending Verification
                    </Badge>
                  )}
                </div>

                {!contact.verified && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button size="sm" variant="outline" className="flex-1 text-xs gap-1 h-8"
                      disabled={sendingOtp === contact.id}
                      onClick={() => sendOTP(contact)}>
                      {sendingOtp === contact.id
                        ? <><RefreshCw className="h-3 w-3 animate-spin" />Sending…</>
                        : <><MessageSquare className="h-3 w-3" />Send OTP</>}
                    </Button>
                    <Button size="sm" className="flex-1 text-xs gap-1 h-8"
                      onClick={() => { setOtpContact(contact); setOtp(""); }}>
                      <ShieldCheck className="h-3 w-3" />
                      Enter OTP
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Contact Dialog */}
      <Dialog open={!!editContact} onOpenChange={open => { if (!open) setEditContact(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Contact
            </DialogTitle>
            <DialogDescription>Update the contact's details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="Jane Doe" value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input placeholder="Spouse, Parent…" value={editForm.relationship}
                  onChange={e => setEditForm({ ...editForm, relationship: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input type="email" placeholder="jane@example.com" value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number (for SMS)</Label>
              <Input placeholder="+1 234 567 8900" value={editForm.phone}
                onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5" />
                WhatsApp Number
              </Label>
              <Input placeholder="+1 234 567 8900" value={editForm.whatsapp}
                onChange={e => setEditForm({ ...editForm, whatsapp: e.target.value })} />
              <p className="text-xs text-muted-foreground">Include country code e.g. +919876543210</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditContact(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving || !editForm.name || !editForm.email}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={!!otpContact} onOpenChange={open => { if (!open) { setOtpContact(null); setOtp(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Verify Contact
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit code you generated for <strong>{otpContact?.name}</strong>. Click "Send OTP" on their card to generate a code first.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="p-4 rounded-full bg-primary/10">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground text-center">
              Ask {otpContact?.name} for the verification code they received
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm"
              disabled={sendingOtp === otpContact?.id}
              onClick={() => otpContact && sendOTP(otpContact)}>
              {sendingOtp === otpContact?.id ? "Resending…" : "Resend OTP"}
            </Button>
            <Button onClick={verifyOTP} disabled={otp.length !== 6 || otpLoading} className="flex-1">
              {otpLoading ? "Verifying…" : "Verify Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated OTP Display Dialog */}
      <Dialog open={!!generatedOtp} onOpenChange={open => { if (!open) setGeneratedOtp(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              OTP Generated
            </DialogTitle>
            <DialogDescription>
              Share this code with <strong>{generatedOtp?.contactName}</strong>. It expires in 10 minutes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
              <ShieldCheck className="h-10 w-10 text-green-600" />
            </div>
            <div className="bg-muted rounded-xl px-8 py-5 text-center">
              <p className="text-xs text-muted-foreground mb-2">Verification Code</p>
              <p className="text-4xl font-bold tracking-[0.3em] text-primary">{generatedOtp?.code}</p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Give this code to <strong>{generatedOtp?.contactName}</strong> — they can enter it using the "Enter OTP" button on their contact card.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (generatedOtp) navigator.clipboard.writeText(generatedOtp.code);
                toast({ title: "Copied!", description: "OTP code copied to clipboard." });
              }}
            >
              Copy Code
            </Button>
            <Button onClick={() => setGeneratedOtp(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyContacts;
