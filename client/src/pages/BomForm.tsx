import { useState, useRef } from "react";
import { useSeo } from "@/hooks/use-seo";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Printer, Eye, Send, CheckCircle2, ArrowLeft, Upload, X, FileText, Image as ImageIcon, Scan, Camera, ArrowRight, NotebookPen } from "lucide-react";

interface UploadedFile { path: string; name: string; size: number; mimetype: string; }

function BomUploadZone({ files, onAdd, onRemove }: {
  files: UploadedFile[];
  onAdd: (files: UploadedFile[]) => void;
  onRemove: (path: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  async function handleFiles(fileList: FileList) {
    if (!fileList.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(fileList).forEach(f => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onAdd(data.files);
    } catch {
      toast({ title: "Upload failed", description: "Please try again or contact us by email.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  function isImage(f: UploadedFile) { return f.mimetype.startsWith("image/"); }
  function formatSize(bytes: number) {
    return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        data-testid="dropzone-bom-upload"
        className={`border-2 border-dashed rounded-lg p-7 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
      >
        <input ref={inputRef} type="file" multiple className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
          onChange={e => e.target.files && handleFiles(e.target.files)}
          data-testid="input-bom-file-upload"
        />
        <Upload className={`w-8 h-8 mx-auto mb-3 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-sm font-medium mb-1">{uploading ? "Uploading…" : "Drop your file(s) here, or click to browse"}</p>
        <p className="text-xs text-muted-foreground">Photos, scans, PDFs — up to 20 MB each</p>
      </div>
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map(f => (
            <li key={f.path} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-muted/30 text-sm">
              {isImage(f) ? <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" /> : <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              <span className="flex-1 truncate text-xs">{f.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">{formatSize(f.size)}</span>
              <button type="button" onClick={() => onRemove(f.path)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0" data-testid={`btn-remove-bom-file-${f.name}`}>
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────
interface RoomType {
  checked: boolean;
  rooms: string;
  king: string;
  queen: string;
  twin: string;
  extra: string;
}
interface FurnitureItem {
  checked: boolean;
  qty: string;
  type?: string;
  desc?: string;
}
interface BomState {
  fullName: string; company: string; email: string; projectLocation: string;
  totalRooms: string;
  standard: RoomType; deluxe: RoomType; suite: RoomType; otherRoom: RoomType & { label: string };
  startDate: string; completionDate: string; priority: string;
  // Bedroom
  platformBed: FurnitureItem;
  headboard: FurnitureItem;
  nightstand: FurnitureItem;
  wardrobe: FurnitureItem;
  desk: FurnitureItem;
  fullMirror: FurnitureItem;
  tvUnit: FurnitureItem;
  chair: FurnitureItem;
  sofa: FurnitureItem;
  // Bathroom
  vanity: FurnitureItem;
  bathMirror: FurnitureItem;
  towelRack: FurnitureItem;
  showerDoor: FurnitureItem;
  showerTray: FurnitureItem;
  tubSurround: FurnitureItem;
  // Additional
  lighting: FurnitureItem;
  curtains: FurnitureItem;
  valance: FurnitureItem;
  otherItem: FurnitureItem;
  // Style
  preferredStyle: string; colorScheme: string; material: string; designNotes: string; needsConsultation: string;
  // Customization
  customRequired: string; brandingInfo: string;
  // Payment
  budget: string; paymentTerms: string; paymentTermsOther: string;
  currency: string; currencyOther: string;
  paymentMethod: string; paymentMethodOther: string;
  // Shipping
  shippingMethod: string; destinationPort: string; customsBy: string;
  // Site
  siteReady: string; floorLevel: string; elevator: string; workingHours: string;
  warranty: string; afterSales: string; hasFloorPlans: string; measurementsConfirmed: string;
  // Delivery
  deliveryRequired: string; installationRequired: string; deliveryDate: string; specialInstructions: string;
  additionalNotes: string;
}

const emptyRoom = (): RoomType => ({ checked: false, rooms: "", king: "", queen: "", twin: "", extra: "" });
const emptyItem = (): FurnitureItem => ({ checked: false, qty: "" });

const defaultForm: BomState = {
  fullName: "", company: "", email: "", projectLocation: "",
  totalRooms: "",
  standard: emptyRoom(), deluxe: emptyRoom(), suite: emptyRoom(),
  otherRoom: { ...emptyRoom(), label: "" },
  startDate: "", completionDate: "", priority: "",
  platformBed: emptyItem(), headboard: emptyItem(), nightstand: emptyItem(), wardrobe: emptyItem(),
  desk: emptyItem(), fullMirror: emptyItem(), tvUnit: emptyItem(), chair: emptyItem(), sofa: emptyItem(),
  vanity: emptyItem(), bathMirror: { ...emptyItem(), type: "" },
  towelRack: emptyItem(), showerDoor: emptyItem(), showerTray: emptyItem(), tubSurround: emptyItem(),
  lighting: emptyItem(), curtains: emptyItem(), valance: emptyItem(), otherItem: { ...emptyItem(), desc: "" },
  preferredStyle: "", colorScheme: "", material: "", designNotes: "", needsConsultation: "",
  customRequired: "", brandingInfo: "",
  budget: "", paymentTerms: "", paymentTermsOther: "", currency: "", currencyOther: "",
  paymentMethod: "", paymentMethodOther: "",
  shippingMethod: "", destinationPort: "", customsBy: "",
  siteReady: "", floorLevel: "", elevator: "", workingHours: "",
  warranty: "", afterSales: "", hasFloorPlans: "", measurementsConfirmed: "",
  deliveryRequired: "", installationRequired: "", deliveryDate: "", specialInstructions: "",
  additionalNotes: "",
};

// ── Checkbox ───────────────────────────────────────────────
function Cb({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-primary cursor-pointer flex-shrink-0"
      />
      {label && <span className="text-sm leading-tight">{label}</span>}
    </label>
  );
}

// ── Radio ──────────────────────────────────────────────────
function Radio({ value, current, onChange, label }: { value: string; current: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="radio"
        checked={current === value}
        onChange={() => onChange(value)}
        className="w-4 h-4 accent-primary cursor-pointer flex-shrink-0"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

// ── Section Header ─────────────────────────────────────────
function SectionHeader({ num, title }: { num: number; title: string }) {
  return (
    <CardHeader className="pb-3">
      <CardTitle className="text-base font-serif font-bold flex items-center gap-3">
        <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">{num}</span>
        {title}
      </CardTitle>
    </CardHeader>
  );
}

// ── Room Type Card (always shows all fields) ───────────────
function RoomCard({ label, value, onChange, customLabel, onLabelChange }: {
  label: string; value: RoomType; onChange: (v: RoomType) => void;
  customLabel?: string; onLabelChange?: (s: string) => void;
}) {
  return (
    <div className={`border rounded-lg p-3 transition-all ${value.checked ? "border-primary/40 bg-primary/3" : "border-border bg-muted/20"}`}>
      <div className="flex items-center gap-3 mb-3">
        <Cb checked={value.checked} onChange={c => onChange({ ...value, checked: c })} />
        {customLabel !== undefined ? (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm font-medium">Other:</span>
            <Input className="h-7 text-sm flex-1 max-w-[180px]" placeholder="Room type name"
              value={customLabel} onChange={e => onLabelChange?.(e.target.value)} />
          </div>
        ) : (
          <span className={`text-sm font-semibold ${value.checked ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
        )}
      </div>
      <div className={`grid grid-cols-2 sm:grid-cols-5 gap-2 pl-6 ${!value.checked ? "opacity-40" : ""}`}>
        {([
          ["rooms", "No. of Rooms"],
          ["king", "King Beds"],
          ["queen", "Queen Beds"],
          ["twin", "Twin Beds"],
          ["extra", "Extra / Sofa Beds"],
        ] as [keyof RoomType, string][]).map(([field, lbl]) => (
          <div key={field} className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide leading-none">{lbl}</label>
            <Input className="h-8 text-sm text-center" type="number" min={0} placeholder="—"
              value={(value as any)[field] || ""}
              disabled={!value.checked}
              onChange={e => onChange({ ...value, [field]: e.target.value })}
              data-testid={`input-room-${field}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Furniture Row (always shows qty) ──────────────────────
function FurRow({ label, item, onUpdate, typeLabel }: {
  label: string;
  item: FurnitureItem;
  onUpdate: (v: Partial<FurnitureItem>) => void;
  typeLabel?: string;
}) {
  return (
    <div className={`flex items-center gap-3 py-2 px-2 rounded transition-colors ${item.checked ? "bg-primary/4 border border-primary/15" : "border border-transparent"}`}>
      <Cb checked={item.checked} onChange={c => onUpdate({ checked: c })} />
      <span className={`text-sm flex-1 leading-tight ${item.checked ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-muted-foreground">Qty:</span>
        <Input
          className="h-7 text-sm w-16 text-center"
          type="number" min={0} placeholder="—"
          value={item.qty}
          onChange={e => onUpdate({ qty: e.target.value })}
        />
        {typeLabel && (
          <Input
            className="h-7 text-xs w-36"
            placeholder={typeLabel}
            value={item.type || item.desc || ""}
            onChange={e => onUpdate({ type: e.target.value, desc: e.target.value })}
          />
        )}
      </div>
    </div>
  );
}

// ── Preview helpers ────────────────────────────────────────
function PreviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground min-w-[160px] flex-shrink-0">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-serif font-bold text-sm border-b pb-1 mb-2">{title}</p>
      <div className="space-y-1 pl-1">{children}</div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function BomForm() {
  useSeo({
    title: "BOM Inquiry Form — Request Custom Hotel Furniture Quote",
    description: "Submit a Bill of Materials inquiry for custom hotel or apartment furniture. Get a detailed quote for FF&E packages, bathroom products, and more.",
    canonical: "/bom",
  });
  const { toast } = useToast();
  const [f, setF] = useState<BomState>(defaultForm);
  const [showPreview, setShowPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const up = (patch: Partial<BomState>) => setF(s => ({ ...s, ...patch }));
  const upRoom = (key: "standard" | "deluxe" | "suite" | "otherRoom", val: RoomType) =>
    setF(s => ({ ...s, [key]: { ...(s[key] as any), ...val } }));
  const upItem = (key: keyof BomState, val: Partial<FurnitureItem>) =>
    setF(s => ({ ...s, [key]: { ...(s[key] as FurnitureItem), ...val } }));

  const submit = useMutation({
    mutationFn: () => apiRequest("POST", "/api/inquiries", {
      name: f.fullName, email: f.email, company: f.company,
      projectLocation: f.projectLocation,
      message: `Hotel Furniture BOM Inquiry — ${f.totalRooms || "?"} rooms${f.projectLocation ? " · " + f.projectLocation : ""}`,
      details: { bom: f, uploadedFiles },
    }),
    onSuccess: () => { setSubmitted(true); setShowPreview(false); },
    onError: (err: any) => toast({ title: "Submission failed", description: err.message, variant: "destructive" }),
  });

  // Build room summary for preview
  const roomSummary = (["standard", "deluxe", "suite", "otherRoom"] as const)
    .filter(k => (f[k] as RoomType).checked)
    .map(k => {
      const r = f[k] as RoomType;
      const lbl = k === "standard" ? "Standard" : k === "deluxe" ? "Deluxe" : k === "suite" ? "Suite" : (f.otherRoom.label || "Other");
      const beds = [r.king && `King×${r.king}`, r.queen && `Queen×${r.queen}`, r.twin && `Twin×${r.twin}`, r.extra && `Extra×${r.extra}`].filter(Boolean).join(", ");
      return `${lbl}: ${r.rooms || "?"} rooms${beds ? ` (${beds})` : ""}`;
    }).join(" | ");

  const bedroomItems: [keyof BomState, string][] = [
    ["platformBed", "Platform Bed(s)"], ["headboard", "Headboard(s)"], ["nightstand", "Nightstand(s)"],
    ["wardrobe", "Wardrobe/Closet"], ["desk", "Desk/Work Table"], ["fullMirror", "Full Length Mirror"],
    ["tvUnit", "TV Unit/Console"], ["chair", "Chair(s)"], ["sofa", "Sofa/Seating"],
  ];
  const bathItems: [keyof BomState, string][] = [
    ["vanity", "Vanity w/ Quartz Top"], ["bathMirror", "Mirror(s)"],
    ["towelRack", "Towel Rack(s)"], ["showerDoor", "Shower Door"], ["showerTray", "Shower Tray"], ["tubSurround", "Tub Surround"],
  ];
  const addItems: [keyof BomState, string][] = [
    ["lighting", "Lighting Fixtures"], ["curtains", "Curtains/Blinds"], ["valance", "Window Valance"], ["otherItem", "Other"],
  ];

  const bedroomSummary = bedroomItems.filter(([k]) => (f[k] as FurnitureItem).checked)
    .map(([k, lbl]) => `${lbl} ×${(f[k] as FurnitureItem).qty || "?"}`).join(", ");
  const bathSummary = bathItems.filter(([k]) => (f[k] as FurnitureItem).checked)
    .map(([k, lbl]) => `${lbl} ×${(f[k] as FurnitureItem).qty || "?"}`).join(", ");
  const addSummary = addItems.filter(([k]) => (f[k] as FurnitureItem).checked)
    .map(([k, lbl]) => `${lbl} ×${(f[k] as FurnitureItem).qty || "?"}`).join(", ");

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md" data-testid="section-bom-success">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-5" />
          <h2 className="text-2xl font-bold font-serif mb-3">Inquiry Submitted!</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Thank you, <strong>{f.fullName}</strong>. Your hotel furniture inquiry has been received. Our team will follow up within one business day at <strong>{f.email}</strong>.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => { setF(defaultForm); setSubmitted(false); }} data-testid="button-new-bom">New Inquiry</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1.5" />Print Copy</Button>
            <Link href="/contact"><Button variant="ghost">Back to Quote</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print-only header */}
      <div className="hidden print:block print:mb-6">
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-2xl font-bold tracking-widest uppercase">DMVH Hospitality</h1>
          <p className="text-sm tracking-widest uppercase text-gray-600 mt-1">Hotel Furniture Inquiry Form</p>
          <p className="text-xs text-gray-400 mt-1">sales@dmvhhospitality.com · (620) 287-0248 · Chicago · Dallas · Ho Chi Minh City</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-28 lg:pb-12 print:p-0 print:max-w-none" data-testid="page-bom">
        {/* Screen-only header */}
        <div className="mb-8 print:hidden">
          <Link href="/contact">
            <Button variant="ghost" size="sm" className="gap-1.5 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Get a Quote
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Badge variant="outline" className="text-primary border-primary/30 mb-2">Hotel Furniture Inquiry</Badge>
              <h1 className="text-3xl font-bold font-serif mb-2">Detailed Inquiry Form</h1>
              <p className="text-muted-foreground max-w-xl text-sm">
                Complete all sections to give us a full picture of your project. Check applicable items and fill in quantities. You can also <button className="text-primary underline underline-offset-2 cursor-pointer" onClick={() => window.print()}>print this form</button> and submit by email or fax.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.print()} data-testid="button-print">
              <Printer className="w-4 h-4 mr-1.5" />Print / Save PDF
            </Button>
          </div>
        </div>

        <div className="space-y-5 print:space-y-4">

          {/* ── SECTION 1 ── */}
          <Card className="print:shadow-none print:border print:border-gray-400">
            <SectionHeader num={1} title="Client Information" />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Full Name <span className="text-destructive">*</span></Label>
                  <Input placeholder="Full Name" value={f.fullName} onChange={e => up({ fullName: e.target.value })} data-testid="input-full-name" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Company Name</Label>
                  <Input placeholder="Company / Hotel Name (if applicable)" value={f.company} onChange={e => up({ company: e.target.value })} data-testid="input-company" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email Address <span className="text-destructive">*</span></Label>
                  <Input type="email" placeholder="email@company.com" value={f.email} onChange={e => up({ email: e.target.value })} data-testid="input-email" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Project Location <span className="text-muted-foreground font-normal">(Hotel Name & Address)</span></Label>
                <Input placeholder="e.g. Holiday Inn Express — 123 Main St, Dallas, TX" value={f.projectLocation} onChange={e => up({ projectLocation: e.target.value })} data-testid="input-project-location" />
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 2 ── */}
          <Card className="print:shadow-none print:border print:border-gray-400">
            <SectionHeader num={2} title="Project Details" />
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Total Number of Rooms to Furnish</Label>
                <Input className="max-w-[200px]" type="number" min={0} placeholder="e.g. 120" value={f.totalRooms} onChange={e => up({ totalRooms: e.target.value })} data-testid="input-total-rooms" />
              </div>

              {/* Room types — always all fields visible */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Room Type(s) <span className="font-normal normal-case">— Check all that apply, then fill in bed counts</span>
                </p>
                <div className="space-y-3">
                  <RoomCard label="Standard Room" value={f.standard} onChange={v => upRoom("standard", v)} />
                  <RoomCard label="Deluxe Room"   value={f.deluxe}   onChange={v => upRoom("deluxe", v)} />
                  <RoomCard label="Suite"          value={f.suite}    onChange={v => upRoom("suite", v)} />
                  <RoomCard
                    label="Other"
                    value={f.otherRoom}
                    onChange={v => upRoom("otherRoom", v)}
                    customLabel={f.otherRoom.label}
                    onLabelChange={s => setF(prev => ({ ...prev, otherRoom: { ...prev.otherRoom, label: s } }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Project Start Date</Label>
                  <Input type="date" value={f.startDate} onChange={e => up({ startDate: e.target.value })} data-testid="input-start-date" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Completion Date</Label>
                  <Input type="date" value={f.completionDate} onChange={e => up({ completionDate: e.target.value })} data-testid="input-completion-date" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Project Priority</p>
                <div className="flex gap-6 flex-wrap">
                  <Radio value="urgent" current={f.priority} onChange={v => up({ priority: v })} label="Urgent" />
                  <Radio value="standard" current={f.priority} onChange={v => up({ priority: v })} label="Standard" />
                  <Radio value="flexible" current={f.priority} onChange={v => up({ priority: v })} label="Flexible Timeline" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 3 ── */}
          <Card className="print:shadow-none print:border print:border-gray-400">
            <SectionHeader num={3} title="Furniture Requirements" />
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Check all that apply and enter quantities. Leave unchecked if not needed.</p>

              {/* Bedroom */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 pb-1 border-b">Bedroom Area</p>
                <div className="divide-y divide-border/50">
                  <FurRow label="Platform Bed(s)" item={f.platformBed} onUpdate={v => upItem("platformBed", v)} typeLabel="Type: Metal / Wood" />
                  <FurRow label="Headboard(s)" item={f.headboard} onUpdate={v => upItem("headboard", v)} />
                  <FurRow label="Nightstand(s)" item={f.nightstand} onUpdate={v => upItem("nightstand", v)} />
                  <FurRow label="Wardrobe / Closet Units" item={f.wardrobe} onUpdate={v => upItem("wardrobe", v)} />
                  <FurRow label="Desk / Work Table" item={f.desk} onUpdate={v => upItem("desk", v)} />
                  <FurRow label="Full Length Mirror" item={f.fullMirror} onUpdate={v => upItem("fullMirror", v)} />
                  <FurRow label="TV Unit / Console" item={f.tvUnit} onUpdate={v => upItem("tvUnit", v)} />
                  <FurRow label="Chair(s)" item={f.chair} onUpdate={v => upItem("chair", v)} />
                  <FurRow label="Sofa / Seating" item={f.sofa} onUpdate={v => upItem("sofa", v)} />
                </div>
              </div>

              {/* Bathroom */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 pb-1 border-b">Bathroom Accessories</p>
                <div className="divide-y divide-border/50">
                  <FurRow label="Vanity w/ Quartz Top & Basin" item={f.vanity} onUpdate={v => upItem("vanity", v)} />
                  <FurRow label="Mirror(s)" item={f.bathMirror} onUpdate={v => upItem("bathMirror", v)} typeLabel="Type: LED / Wood Frame" />
                  <FurRow label="Towel Rack(s)" item={f.towelRack} onUpdate={v => upItem("towelRack", v)} />
                  <FurRow label="Shower Door" item={f.showerDoor} onUpdate={v => upItem("showerDoor", v)} />
                  <FurRow label="Shower Tray" item={f.showerTray} onUpdate={v => upItem("showerTray", v)} />
                  <FurRow label="Tub Surround" item={f.tubSurround} onUpdate={v => upItem("tubSurround", v)} />
                </div>
              </div>

              {/* Additional */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 pb-1 border-b">Additional Items</p>
                <div className="divide-y divide-border/50">
                  <FurRow label="Lighting Fixtures" item={f.lighting} onUpdate={v => upItem("lighting", v)} />
                  <FurRow label="Curtains / Blinds" item={f.curtains} onUpdate={v => upItem("curtains", v)} />
                  <FurRow label="Window Valance" item={f.valance} onUpdate={v => upItem("valance", v)} />
                  <FurRow label="Other" item={f.otherItem} onUpdate={v => upItem("otherItem", v)} typeLabel="Describe item" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 4 ── */}
          <Card className="print:shadow-none print:border print:border-gray-400">
            <SectionHeader num={4} title="Style & Design Preferences" />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Preferred Style / Franchise <span className="font-normal text-muted-foreground">(if applicable)</span></Label>
                  <Input placeholder="e.g. Hampton Inn, Marriott standards, Modern Boutique" value={f.preferredStyle} onChange={e => up({ preferredStyle: e.target.value })} data-testid="input-preferred-style" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Preferred Color Scheme</Label>
                  <Input placeholder="e.g. Warm earth tones, Grey & White, Navy accents" value={f.colorScheme} onChange={e => up({ colorScheme: e.target.value })} data-testid="input-color-scheme" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Material Preferences</p>
                <div className="space-y-2">
                  <Radio value="wood-paint" current={f.material} onChange={v => up({ material: v })} label="Wood / MDF Veneer (Paint Finish)" />
                  <Radio value="wood-hpl" current={f.material} onChange={v => up({ material: v })} label="Wood / MDF with HPL / LPL Finish" />
                  <Radio value="wood-hpl-metal" current={f.material} onChange={v => up({ material: v })} label="Wood / MDF with HPL / LPL + Metal Frame" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Additional Notes</Label>
                <Textarea className="min-h-[70px] resize-none text-sm" placeholder="Any specific design requirements, brand guidelines, or special requests…" value={f.designNotes} onChange={e => up({ designNotes: e.target.value })} data-testid="textarea-design-notes" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Design Consultation Required?</p>
                <div className="flex gap-6">
                  <Radio value="yes" current={f.needsConsultation} onChange={v => up({ needsConsultation: v })} label="Yes" />
                  <Radio value="no" current={f.needsConsultation} onChange={v => up({ needsConsultation: v })} label="No" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 5 ── */}
          <Card className="print:shadow-none print:border print:border-gray-400">
            <SectionHeader num={5} title="Customization & Branding" />
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Custom Furniture Required?</p>
                <div className="flex gap-6">
                  <Radio value="yes" current={f.customRequired} onChange={v => up({ customRequired: v })} label="Yes" />
                  <Radio value="no" current={f.customRequired} onChange={v => up({ customRequired: v })} label="No" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Hotel Branding <span className="font-normal text-muted-foreground">(logos, colors, themes)</span></Label>
                <Input placeholder="e.g. Brand colors must match Pantone 485C, custom logo embossing on headboards" value={f.brandingInfo} onChange={e => up({ brandingInfo: e.target.value })} data-testid="input-branding" />
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 6 ── */}
          <Card className="print:shadow-none print:border print:border-gray-400">
            <SectionHeader num={6} title="Pricing & Payment Terms" />
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Estimated Project Budget</Label>
                <Input placeholder="e.g. $500,000 – $800,000 USD" value={f.budget} onChange={e => up({ budget: e.target.value })} data-testid="input-budget" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Payment Terms</p>
                  <div className="space-y-2">
                    <Radio value="50-shipment" current={f.paymentTerms} onChange={v => up({ paymentTerms: v })} label="50% Deposit / 50% Before Shipment" />
                    <Radio value="50-lc" current={f.paymentTerms} onChange={v => up({ paymentTerms: v })} label="50% Deposit / 50% L/C" />
                    <div className="flex items-center gap-2">
                      <Radio value="other" current={f.paymentTerms} onChange={v => up({ paymentTerms: v })} label="Other:" />
                      {f.paymentTerms === "other" && <Input className="h-7 text-xs flex-1" placeholder="specify" value={f.paymentTermsOther} onChange={e => up({ paymentTermsOther: e.target.value })} />}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Preferred Currency</p>
                  <div className="space-y-2">
                    <Radio value="usd" current={f.currency} onChange={v => up({ currency: v })} label="USD" />
                    <div className="flex items-center gap-2">
                      <Radio value="other" current={f.currency} onChange={v => up({ currency: v })} label="Other:" />
                      {f.currency === "other" && <Input className="h-7 text-xs w-24" placeholder="specify" value={f.currencyOther} onChange={e => up({ currencyOther: e.target.value })} />}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Payment Method</p>
                  <div className="space-y-2">
                    <Radio value="bank-transfer" current={f.paymentMethod} onChange={v => up({ paymentMethod: v })} label="Bank Transfer (T/T)" />
                    <Radio value="lc" current={f.paymentMethod} onChange={v => up({ paymentMethod: v })} label="Letter of Credit (Sight L/C)" />
                    <div className="flex items-center gap-2">
                      <Radio value="other" current={f.paymentMethod} onChange={v => up({ paymentMethod: v })} label="Other:" />
                      {f.paymentMethod === "other" && <Input className="h-7 text-xs flex-1" placeholder="specify" value={f.paymentMethodOther} onChange={e => up({ paymentMethodOther: e.target.value })} />}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 7 ── */}
          <Card className="print:shadow-none print:border print:border-gray-400">
            <SectionHeader num={7} title="Freight & Shipping" />
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Shipping Method <span className="font-normal normal-case">(Select One)</span></p>
                <div className="flex gap-6 flex-wrap">
                  <Radio value="door-to-door" current={f.shippingMethod} onChange={v => up({ shippingMethod: v })} label="Door-to-Door" />
                  <Radio value="factory-vietnam" current={f.shippingMethod} onChange={v => up({ shippingMethod: v })} label="Factory to Vietnam Port" />
                  <Radio value="factory-usa" current={f.shippingMethod} onChange={v => up({ shippingMethod: v })} label="Factory to USA Port" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Destination Port <span className="font-normal text-muted-foreground">(if applicable)</span></Label>
                <Input placeholder="e.g. Port of Los Angeles, Port of Houston" value={f.destinationPort} onChange={e => up({ destinationPort: e.target.value })} data-testid="input-destination-port" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Customs Clearance Responsibility</p>
                <div className="flex gap-6">
                  <Radio value="supplier" current={f.customsBy} onChange={v => up({ customsBy: v })} label="Supplier" />
                  <Radio value="client" current={f.customsBy} onChange={v => up({ customsBy: v })} label="Client" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 8 ── */}
          <Card className="print:shadow-none print:border print:border-gray-400">
            <SectionHeader num={8} title="Site Readiness, Warranty & Documentation" />
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Site Ready for Delivery & Installation?</p>
                    <div className="flex gap-6"><Radio value="yes" current={f.siteReady} onChange={v => up({ siteReady: v })} label="Yes" /><Radio value="no" current={f.siteReady} onChange={v => up({ siteReady: v })} label="No" /></div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Floor Level</p>
                    <div className="space-y-1.5">
                      <Radio value="ground" current={f.floorLevel} onChange={v => up({ floorLevel: v })} label="Ground" />
                      <Radio value="2-5" current={f.floorLevel} onChange={v => up({ floorLevel: v })} label="2–5 Floors" />
                      <Radio value="5plus" current={f.floorLevel} onChange={v => up({ floorLevel: v })} label="5+ Floors" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Elevator Access Available?</p>
                    <div className="flex gap-6"><Radio value="yes" current={f.elevator} onChange={v => up({ elevator: v })} label="Yes" /><Radio value="no" current={f.elevator} onChange={v => up({ elevator: v })} label="No" /></div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Working Hour Restrictions <span className="font-normal text-muted-foreground">(if any)</span></Label>
                    <Input placeholder="e.g. Mon–Fri 8am–5pm only" value={f.workingHours} onChange={e => up({ workingHours: e.target.value })} data-testid="input-working-hours" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Warranty Requirements</p>
                    <div className="space-y-1.5">
                      <Radio value="1" current={f.warranty} onChange={v => up({ warranty: v })} label="1 Year" />
                      <Radio value="3" current={f.warranty} onChange={v => up({ warranty: v })} label="3 Years" />
                      <Radio value="5" current={f.warranty} onChange={v => up({ warranty: v })} label="5 Years" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">After-Sales Support Required?</p>
                    <div className="flex gap-6"><Radio value="yes" current={f.afterSales} onChange={v => up({ afterSales: v })} label="Yes" /><Radio value="no" current={f.afterSales} onChange={v => up({ afterSales: v })} label="No" /></div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Will Client Provide Floor Plans / Drawings?</p>
                    <div className="flex gap-6"><Radio value="yes" current={f.hasFloorPlans} onChange={v => up({ hasFloorPlans: v })} label="Yes" /><Radio value="no" current={f.hasFloorPlans} onChange={v => up({ hasFloorPlans: v })} label="No" /></div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Measurements Confirmed?</p>
                    <div className="flex gap-6"><Radio value="yes" current={f.measurementsConfirmed} onChange={v => up({ measurementsConfirmed: v })} label="Yes" /><Radio value="no" current={f.measurementsConfirmed} onChange={v => up({ measurementsConfirmed: v })} label="No" /></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 9 ── */}
          <Card className="print:shadow-none print:border print:border-gray-400">
            <SectionHeader num={9} title="Delivery & Installation" />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Delivery Required?</p>
                  <div className="flex gap-6"><Radio value="yes" current={f.deliveryRequired} onChange={v => up({ deliveryRequired: v })} label="Yes" /><Radio value="no" current={f.deliveryRequired} onChange={v => up({ deliveryRequired: v })} label="No" /></div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Installation Required?</p>
                  <div className="flex gap-6"><Radio value="yes" current={f.installationRequired} onChange={v => up({ installationRequired: v })} label="Yes" /><Radio value="no" current={f.installationRequired} onChange={v => up({ installationRequired: v })} label="No" /></div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Preferred Delivery Date</Label>
                <Input type="date" className="max-w-[240px]" value={f.deliveryDate} onChange={e => up({ deliveryDate: e.target.value })} data-testid="input-delivery-date" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Special Instructions</Label>
                <Textarea className="min-h-[70px] resize-none text-sm" placeholder="Loading dock requirements, access constraints, scheduling notes, installation sequence…" value={f.specialInstructions} onChange={e => up({ specialInstructions: e.target.value })} data-testid="textarea-special-instructions" />
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 10 ── */}
          <Card className="print:shadow-none print:border print:border-gray-400">
            <SectionHeader num={10} title="Additional Notes or Requests" />
            <CardContent>
              <Textarea className="min-h-[100px] resize-none text-sm" placeholder="Any other requirements, questions, special requests, or information we should know about…" value={f.additionalNotes} onChange={e => up({ additionalNotes: e.target.value })} data-testid="textarea-additional-notes" />
            </CardContent>
          </Card>

          {/* ── Printed Form Upload ── */}
          <Card className="print:hidden border-amber-200 dark:border-amber-800" data-testid="section-bom-upload">
            <CardContent className="pt-5 space-y-4">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Scan className="w-4 h-4 text-amber-600" /> Filled this form out on paper? Upload it here
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                <div className="flex flex-col items-center gap-1 px-2">
                  <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 flex items-center justify-center">
                    <Printer className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium text-center">Print<br />form</span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                <div className="flex flex-col items-center gap-1 px-2">
                  <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 flex items-center justify-center">
                    <NotebookPen className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium text-center">Fill by<br />hand</span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                <div className="flex flex-col items-center gap-1 px-2">
                  <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium text-center">Photo<br />or scan</span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                <div className="flex flex-col items-center gap-1 px-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[10px] text-primary font-semibold text-center">Upload<br />below</span>
                </div>
              </div>
              <BomUploadZone
                files={uploadedFiles}
                onAdd={newFiles => setUploadedFiles(prev => [...prev, ...newFiles])}
                onRemove={path => setUploadedFiles(prev => prev.filter(f => f.path !== path))}
              />
              {uploadedFiles.length > 0 && (
                <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} attached — these will be included with your submission below.
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── Submit Bar ── */}
          <div className="print:hidden">
            <div className="flex items-center gap-4 flex-wrap justify-between p-5 bg-muted/50 rounded-xl border">
              <div>
                <p className="font-semibold text-sm">Ready to submit?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Preview all your entries before sending, or submit directly. We respond within one business day.</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowPreview(true)} data-testid="button-preview-bom">
                  <Eye className="w-4 h-4 mr-1.5" />Preview & Review
                </Button>
                <Button type="button" onClick={() => submit.mutate()} disabled={!f.fullName || !f.email || submit.isPending} data-testid="button-submit-bom">
                  {submit.isPending ? "Submitting…" : <><Send className="w-4 h-4 mr-1.5" />Submit Inquiry</>}
                </Button>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Thank you for choosing DMVH Hospitality ·{" "}
              <a href="mailto:sales@dmvhhospitality.com" className="text-primary hover:underline">sales@dmvhhospitality.com</a> ·{" "}
              <a href="tel:6202870248" className="text-primary hover:underline">(620) 287-0248</a>
            </p>
          </div>

          {/* Print footer */}
          <div className="hidden print:block mt-8 pt-4 border-t text-center text-xs text-gray-500">
            <p className="font-semibold text-sm">Thank you for choosing DMVH Hospitality for your hotel furnishing needs!</p>
            <p className="mt-1">Submit completed form to: <strong>sales@dmvhhospitality.com</strong> · Tel: (620) 287-0248</p>
            <p className="mt-1">Chicago, IL · Dallas, TX · Ho Chi Minh City, Vietnam</p>
          </div>
        </div>
      </div>

      {/* ── Preview Dialog ── */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Review Your Inquiry</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 text-sm">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">Hotel Furniture Inquiry — DMVH Hospitality</p>
              <p className="font-bold text-base font-serif">{f.fullName || "—"}</p>
              {f.company && <p className="text-muted-foreground text-sm">{f.company}</p>}
            </div>

            <PreviewSection title="1. Client Information">
              <PreviewRow label="Name" value={f.fullName} />
              <PreviewRow label="Company" value={f.company} />
              <PreviewRow label="Email" value={f.email} />
              <PreviewRow label="Project Location" value={f.projectLocation} />
            </PreviewSection>

            <PreviewSection title="2. Project Details">
              <PreviewRow label="Total Rooms" value={f.totalRooms} />
              {roomSummary && <PreviewRow label="Room Types" value={roomSummary} />}
              <PreviewRow label="Start Date" value={f.startDate} />
              <PreviewRow label="Completion Date" value={f.completionDate} />
              <PreviewRow label="Priority" value={f.priority === "flexible" ? "Flexible Timeline" : f.priority ? f.priority.charAt(0).toUpperCase() + f.priority.slice(1) : undefined} />
            </PreviewSection>

            <PreviewSection title="3. Furniture Requirements">
              {bedroomSummary && <PreviewRow label="Bedroom Items" value={bedroomSummary} />}
              {bathSummary && <PreviewRow label="Bathroom Items" value={bathSummary} />}
              {addSummary && <PreviewRow label="Additional Items" value={addSummary} />}
            </PreviewSection>

            <PreviewSection title="4. Style & Design">
              <PreviewRow label="Style / Franchise" value={f.preferredStyle} />
              <PreviewRow label="Color Scheme" value={f.colorScheme} />
              <PreviewRow label="Material" value={f.material === "wood-paint" ? "Wood/MDF Veneer (Paint)" : f.material === "wood-hpl" ? "Wood/MDF + HPL/LPL" : f.material === "wood-hpl-metal" ? "Wood/MDF + HPL/LPL + Metal Frame" : undefined} />
              <PreviewRow label="Design Notes" value={f.designNotes} />
              <PreviewRow label="Design Consultation" value={f.needsConsultation?.toUpperCase()} />
            </PreviewSection>

            <PreviewSection title="5. Customization & Branding">
              <PreviewRow label="Custom Required" value={f.customRequired?.toUpperCase()} />
              <PreviewRow label="Branding Details" value={f.brandingInfo} />
            </PreviewSection>

            <PreviewSection title="6. Pricing & Payment">
              <PreviewRow label="Budget" value={f.budget} />
              <PreviewRow label="Payment Terms" value={f.paymentTerms === "50-shipment" ? "50% Deposit / 50% Before Shipment" : f.paymentTerms === "50-lc" ? "50% Deposit / 50% L/C" : f.paymentTermsOther || f.paymentTerms} />
              <PreviewRow label="Currency" value={f.currency === "usd" ? "USD" : f.currencyOther || f.currency} />
              <PreviewRow label="Payment Method" value={f.paymentMethod === "bank-transfer" ? "Bank Transfer (T/T)" : f.paymentMethod === "lc" ? "Letter of Credit (Sight L/C)" : f.paymentMethodOther || f.paymentMethod} />
            </PreviewSection>

            <PreviewSection title="7. Freight & Shipping">
              <PreviewRow label="Shipping Method" value={f.shippingMethod === "door-to-door" ? "Door-to-Door" : f.shippingMethod === "factory-vietnam" ? "Factory → Vietnam Port" : f.shippingMethod === "factory-usa" ? "Factory → USA Port" : undefined} />
              <PreviewRow label="Destination Port" value={f.destinationPort} />
              <PreviewRow label="Customs Responsibility" value={f.customsBy ? (f.customsBy.charAt(0).toUpperCase() + f.customsBy.slice(1)) : undefined} />
            </PreviewSection>

            <PreviewSection title="8. Site, Warranty & Docs">
              <PreviewRow label="Site Ready" value={f.siteReady?.toUpperCase()} />
              <PreviewRow label="Floor Level" value={f.floorLevel === "ground" ? "Ground" : f.floorLevel === "2-5" ? "2–5 Floors" : f.floorLevel === "5plus" ? "5+ Floors" : undefined} />
              <PreviewRow label="Elevator Access" value={f.elevator?.toUpperCase()} />
              <PreviewRow label="Working Hours" value={f.workingHours} />
              <PreviewRow label="Warranty" value={f.warranty ? `${f.warranty} Year${parseInt(f.warranty) > 1 ? "s" : ""}` : undefined} />
              <PreviewRow label="After-Sales Support" value={f.afterSales?.toUpperCase()} />
              <PreviewRow label="Provides Floor Plans" value={f.hasFloorPlans?.toUpperCase()} />
              <PreviewRow label="Measurements Confirmed" value={f.measurementsConfirmed?.toUpperCase()} />
            </PreviewSection>

            <PreviewSection title="9. Delivery & Installation">
              <PreviewRow label="Delivery Required" value={f.deliveryRequired?.toUpperCase()} />
              <PreviewRow label="Installation Required" value={f.installationRequired?.toUpperCase()} />
              <PreviewRow label="Preferred Delivery Date" value={f.deliveryDate} />
              <PreviewRow label="Special Instructions" value={f.specialInstructions} />
            </PreviewSection>

            {f.additionalNotes && (
              <PreviewSection title="10. Additional Notes">
                <p className="text-sm leading-relaxed">{f.additionalNotes}</p>
              </PreviewSection>
            )}

            <Separator />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowPreview(false)} data-testid="button-preview-edit">← Edit Form</Button>
              <Button onClick={() => submit.mutate()} disabled={!f.fullName || !f.email || submit.isPending} data-testid="button-preview-submit">
                {submit.isPending ? "Submitting…" : <><Send className="w-4 h-4 mr-1.5" />Confirm & Submit</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
