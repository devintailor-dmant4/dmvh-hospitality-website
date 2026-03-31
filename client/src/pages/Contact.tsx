import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { useSeo } from "@/hooks/use-seo";
import {
  Clock, ArrowLeft, ArrowRight, CheckCircle2,
  User, Building2, Sofa, Paperclip, Upload, X, FileText, Image,
  ChevronRight, Lock, Eye, EyeOff, ShieldCheck,
  ClipboardList, NotebookPen, Mail, Scan, MessageCircle,
  Camera, Printer,
} from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  company: z.string().optional().default(""),
  role: z.string().optional().default(""),
  hotelBrand: z.string().optional().default(""),
  projectLocation: z.string().optional().default(""),
  totalRooms: z.string().optional().default(""),
  timeline: z.string().optional().default(""),
  budget: z.string().optional().default(""),
  priority: z.string().optional().default(""),
  categories: z.array(z.string()).default([]),
  style: z.string().optional().default(""),
  message: z.string().optional().default(""),
});

type InquiryForm = z.infer<typeof formSchema>;

const STEPS = [
  { id: "info",     label: "Your Info",       icon: User,      short: "Contact details" },
  { id: "project",  label: "Your Project",    icon: Building2, short: "Scope & timeline" },
  { id: "needs",    label: "Furniture Needs", icon: Sofa,      short: "What you need" },
  { id: "attach",   label: "Attachments",     icon: Paperclip, short: "Files & notes" },
];

const FURNITURE_CATEGORIES = [
  "Guestroom Casegoods (beds, nightstands, dressers, desks)",
  "Headboards & Upholstered Panels",
  "Seating & Sofas (lobby, guestroom, lounge)",
  "TV Consoles & Entertainment Units",
  "Wardrobe / Closet Systems",
  "Mirrors (full-length, vanity)",
  "Bathroom Vanities & Cabinetry",
  "Shower Doors & Enclosures",
  "Bathtubs & Whirlpool Tubs",
  "Bathroom Accessories (towel bars, hooks, holders)",
  "LED & Backlit Mirrors",
  "Lobby & Public Area Furniture",
  "Apartment / Multifamily Furniture",
  "Lighting Fixtures",
  "Custom / Bespoke Pieces",
];

interface UploadedFile {
  path: string;
  originalName: string;
  size: number;
  mimetype: string;
}

function FileUploadZone({ files, onAdd, onRemove }: {
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
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
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
        data-testid="dropzone-upload"
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <input ref={inputRef} type="file" multiple className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
          onChange={e => e.target.files && handleFiles(e.target.files)}
          data-testid="input-file-upload"
        />
        <Upload className={`w-8 h-8 mx-auto mb-3 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-sm font-medium mb-1">{uploading ? "Uploading…" : "Drop files here or click to browse"}</p>
        <p className="text-xs text-muted-foreground">Images, PDFs, Word docs, Excel sheets — up to 20 MB each, 10 files max</p>
        <p className="text-xs text-muted-foreground mt-1">Brand standards, floor plans, inspiration photos, spec sheets welcome</p>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(f => (
            <div key={f.path} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
              {isImage(f) ? <Image className="w-5 h-5 text-primary flex-shrink-0" /> : <FileText className="w-5 h-5 text-primary flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.originalName}</p>
                <p className="text-xs text-muted-foreground">{formatSize(f.size)}</p>
              </div>
              <button type="button" onClick={() => onRemove(f.path)}
                className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                data-testid={`button-remove-file-${f.originalName}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Contact() {
  useSeo({
    title: "Contact Us — Get a Custom Furniture Quote",
    description: "Contact DMVH Hospitality to request a quote for hotel or apartment furniture. Reach our teams in Chicago, Dallas, or Ho Chi Minh City.",
    canonical: "/contact",
  });
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [wantsAccount, setWantsAccount] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: currentUser } = useQuery<{ id: number; email: string; name: string } | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const form = useForm<InquiryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", email: "", company: "", role: "",
      hotelBrand: "", projectLocation: "", totalRooms: "",
      timeline: "", budget: "", priority: "",
      categories: [], style: "", message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InquiryForm) => {
      const { name, email, company, projectLocation, message, categories, hotelBrand, ...rest } = data;

      let userId: number | undefined = currentUser?.id;

      // Create account if user opted in and isn't already logged in
      if (!currentUser && wantsAccount && newPassword.length >= 8) {
        try {
          const regRes = await apiRequest("POST", "/api/auth/register", {
            name, email, company, password: newPassword,
          });
          const regData = await regRes.json();
          userId = regData.id;
          await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        } catch (err: any) {
          // Account may already exist — try to continue without linking
        }
      }

      const res = await apiRequest("POST", "/api/inquiries", {
        name, email, company, message,
        projectLocation,
        attachments: uploadedFiles.map(f => f.path),
        details: { ...rest, categories, hotelBrand },
        userId,
      });
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again or call us directly.",
        variant: "destructive",
      });
    },
  });

  function advance() {
    setCompletedSteps(p => new Set(p).add(step));
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  function goTo(idx: number) {
    setCompletedSteps(p => new Set(p).add(step));
    setStep(idx);
  }

  function onSubmit(data: InquiryForm) {
    mutation.mutate(data);
  }

  const values = form.watch();
  const selectedCategories: string[] = values.categories || [];
  function toggleCategory(cat: string) {
    const cur = form.getValues("categories") as string[];
    form.setValue("categories", cur.includes(cat) ? cur.filter(c => c !== cat) : [...cur, cat]);
  }

  const isLastStep = step === STEPS.length - 1;
  const emailValue = form.watch("email");
  const nameValue = form.watch("name");

  // ── Success Screen ──────────────────────────────────────────────
  if (submitted) {
    const createdAccount = wantsAccount && newPassword.length >= 8 && !currentUser;
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-serif mb-3" data-testid="text-success-title">Inquiry Submitted!</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Thank you — our team will respond within one business day. A confirmation has been sent to <strong>{form.getValues("email")}</strong>.
          </p>
          {createdAccount && (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/15 rounded-lg text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-primary">Portal account created</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Your inquiry is now saved in your client portal. Sign in anytime to track its status.
              </p>
              <Button size="sm" className="mt-3 w-full" onClick={() => navigate("/portal")} data-testid="button-go-to-portal">
                View My Portal
              </Button>
            </div>
          )}
          {currentUser && (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/15 rounded-lg text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-primary">Saved to your portal</p>
              </div>
              <p className="text-sm text-muted-foreground">This inquiry is visible in your client portal.</p>
              <Button size="sm" className="mt-3 w-full" onClick={() => navigate("/portal")} data-testid="button-go-to-portal-existing">
                View My Portal
              </Button>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setSubmitted(false); setStep(0); setCompletedSteps(new Set()); setUploadedFiles([]); form.reset(); setWantsAccount(false); setNewPassword(""); }} data-testid="button-submit-another">
              Submit Another
            </Button>
            <Link href="/"><Button variant="ghost" data-testid="button-back-home-success">Back to Home</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="py-10 md:py-14 bg-card border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 mb-6" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-3 font-serif" data-testid="text-contact-title">
            Let's talk about your project
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-xl">
            We work with distributors and wholesalers across North America. Send us a message or fill in a few details below — we respond within one business day.
          </p>

          {/* Two simple actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8" data-testid="section-path-guide">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("dmvh:open-chat"))}
              className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors shadow-sm"
              data-testid="button-open-chat"
            >
              <MessageCircle className="w-4 h-4" /> Send us a message
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("quote-form-start");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-muted/40 text-sm font-semibold transition-colors"
              data-testid="button-scroll-to-form"
            >
              <NotebookPen className="w-4 h-4" /> Request a quote
            </button>
          </div>

          {/* Contact info — one quiet line */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
            <a href="mailto:sales@dmvhhospitality.com" className="flex items-center gap-1.5 hover:text-foreground transition-colors" data-testid="link-email-contact">
              <Mail className="w-3.5 h-3.5 text-primary" /> sales@dmvhhospitality.com
            </a>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> Mon – Fri · 8 AM – 6 PM CST
            </span>
            <Link href="/bom">
              <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer" data-testid="link-detailed-bom">
                <ClipboardList className="w-3.5 h-3.5 text-primary" /> Detailed specs form
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main */}
      <div id="quote-form-start" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                e.preventDefault();
              }
            }}
            data-testid="form-inquiry"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">

              {/* Sidebar */}
              <aside className="lg:sticky lg:top-24 lg:self-start space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Steps</p>
                {STEPS.map((s, idx) => {
                  const Icon = s.icon;
                  const isActive = idx === step;
                  const isDone = completedSteps.has(idx);
                  return (
                    <button key={s.id} type="button" onClick={() => goTo(idx)}
                      data-testid={`step-${s.id}`}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        isActive ? "bg-white/20 text-primary-foreground" : isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {isDone && !isActive ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-tight">{s.label}</div>
                        <div className={`text-xs leading-tight mt-0.5 ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{s.short}</div>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-70 flex-shrink-0" />}
                    </button>
                  );
                })}

                <div className="mt-6 pt-5 border-t">
                  <Card className="p-4 bg-primary/5 border-primary/10">
                    <p className="text-xs font-semibold text-primary mb-2">Prefer to talk?</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Call <a href="tel:6202870248" className="text-primary font-medium">(620) 287-0248</a> or email <a href="mailto:sales@dmvhhospitality.com" className="text-primary font-medium">sales@dmvhhospitality.com</a>
                    </p>
                  </Card>
                </div>
              </aside>

              {/* Content */}
              <div className="space-y-5">
                {/* Mobile step pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
                  {STEPS.map((s, idx) => (
                    <button key={s.id} type="button" onClick={() => goTo(idx)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        idx === step ? "bg-primary text-primary-foreground"
                        : completedSteps.has(idx) ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                      }`}>
                      {idx + 1}. {s.label}
                    </button>
                  ))}
                </div>

                {/* Visual stepper */}
                <div className="flex items-start gap-0" data-testid="stepper">
                  {STEPS.map((s, idx) => {
                    const Icon = s.icon;
                    const isActive = idx === step;
                    const isDone = completedSteps.has(idx);
                    return (
                      <div key={s.id} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex items-center">
                          {idx > 0 && <div className={`flex-1 h-0.5 ${isDone || idx <= step ? "bg-primary" : "bg-border"}`} />}
                          <button
                            type="button"
                            onClick={() => goTo(idx)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all border-2 ${
                              isActive
                                ? "bg-primary border-primary text-primary-foreground shadow-md"
                                : isDone
                                ? "bg-primary/15 border-primary text-primary"
                                : "bg-background border-border text-muted-foreground"
                            }`}
                          >
                            {isDone && !isActive ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <Icon className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {idx < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${idx < step ? "bg-primary" : "bg-border"}`} />}
                        </div>
                        <p className={`text-[10px] mt-1.5 text-center leading-tight px-1 ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                          {s.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 font-medium">
                    Step {step + 1} of {STEPS.length}
                  </Badge>
                  <h2 className="text-xl font-bold font-serif">{STEPS[step].label}</h2>
                </div>

                {/* ── STEP 1: Your Info ── */}
                {step === 0 && (
                  <Card className="p-6 md:p-8 space-y-5" data-testid="section-info">
                    <p className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-3">
                      Let us know who you are so we can route your inquiry to the right team.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl><Input placeholder="Jane Smith" {...field} data-testid="input-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl><Input type="email" placeholder="jane@company.com" {...field} data-testid="input-email" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="company" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company / Organization</FormLabel>
                          <FormControl><Input placeholder="Your company name" {...field} data-testid="input-company" /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="role" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-role"><SelectValue placeholder="Select your role" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hotel-owner">Hotel Owner / Operator</SelectItem>
                            <SelectItem value="developer">Developer / Asset Manager</SelectItem>
                            <SelectItem value="ffe-consultant">FF&E Consultant / Procurement</SelectItem>
                            <SelectItem value="distributor">Distributor / Wholesaler</SelectItem>
                            <SelectItem value="interior-designer">Interior Designer</SelectItem>
                            <SelectItem value="contractor">General Contractor / PM</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </Card>
                )}

                {/* ── STEP 2: Your Project ── */}
                {step === 1 && (
                  <Card className="p-6 md:p-8 space-y-5" data-testid="section-project">
                    <p className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-3">
                      Tell us about the property so we can understand scope and brand requirements.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="hotelBrand" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hotel Brand / Franchise</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-hotel-brand"><SelectValue placeholder="Select brand" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ihg-holiday-inn">IHG — Holiday Inn / Express</SelectItem>
                              <SelectItem value="ihg-candlewood">IHG — Candlewood / Staybridge</SelectItem>
                              <SelectItem value="ihg-avid">IHG — Avid / Atwell</SelectItem>
                              <SelectItem value="hilton-hgi">Hilton — Hilton Garden Inn</SelectItem>
                              <SelectItem value="hilton-hampton">Hilton — Hampton Inn</SelectItem>
                              <SelectItem value="hilton-home2">Hilton — Home2 / Homewood</SelectItem>
                              <SelectItem value="hilton-tru">Hilton — Tru by Hilton</SelectItem>
                              <SelectItem value="marriott-courtyard">Marriott — Courtyard</SelectItem>
                              <SelectItem value="marriott-fairfield">Marriott — Fairfield / SpringHill</SelectItem>
                              <SelectItem value="marriott-residence">Marriott — Residence / TownePlace</SelectItem>
                              <SelectItem value="wyndham-days">Wyndham — Days Inn / La Quinta</SelectItem>
                              <SelectItem value="wyndham-wingate">Wyndham — Wingate / Microtel</SelectItem>
                              <SelectItem value="choice-quality">Choice — Quality / Comfort Inn</SelectItem>
                              <SelectItem value="choice-sleep">Choice — Sleep Inn / Cambria</SelectItem>
                              <SelectItem value="best-western">Best Western</SelectItem>
                              <SelectItem value="independent">Independent / Boutique</SelectItem>
                              <SelectItem value="apartment">Apartment / Multifamily</SelectItem>
                              <SelectItem value="other">Other / Not Listed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="totalRooms" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Rooms / Units</FormLabel>
                          <FormControl><Input placeholder="e.g. 120" {...field} data-testid="input-total-rooms" /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="projectLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Name & Location</FormLabel>
                        <FormControl><Input placeholder="e.g. Hampton Inn, 123 Main St, Chicago IL" {...field} data-testid="input-project-location" /></FormControl>
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="timeline" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Target</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-timeline"><SelectValue placeholder="When do you need delivery?" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="asap">As soon as possible</SelectItem>
                              <SelectItem value="3months">Within 3 months</SelectItem>
                              <SelectItem value="6months">3 – 6 months</SelectItem>
                              <SelectItem value="1year">6 – 12 months</SelectItem>
                              <SelectItem value="flexible">Flexible / Planning phase</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="budget" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Budget Range</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-budget"><SelectValue placeholder="Select budget range" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under100k">Under $100,000</SelectItem>
                              <SelectItem value="100-500k">$100,000 – $500,000</SelectItem>
                              <SelectItem value="500k-1m">$500,000 – $1,000,000</SelectItem>
                              <SelectItem value="1-3m">$1M – $3M</SelectItem>
                              <SelectItem value="over3m">Over $3M</SelectItem>
                              <SelectItem value="unknown">Not sure yet</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </div>
                  </Card>
                )}

                {/* ── STEP 3: Furniture Needs ── */}
                {step === 2 && (
                  <Card className="p-6 md:p-8 space-y-6" data-testid="section-needs">
                    <p className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-3">
                      Select everything you need. Don't worry about exact quantities — we'll confirm details once we connect.
                    </p>
                    <div>
                      <p className="text-sm font-semibold mb-3">Categories Needed</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {FURNITURE_CATEGORIES.map(cat => (
                          <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                            data-testid={`toggle-cat-${cat.slice(0, 20).toLowerCase().replace(/\s+/g, '-')}`}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left text-sm transition-all ${
                              selectedCategories.includes(cat)
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border hover:border-primary/40 hover:bg-muted/40 text-muted-foreground"
                            }`}>
                            <div className={`w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center ${
                              selectedCategories.includes(cat) ? "bg-primary border-primary" : "border-muted-foreground/40"
                            }`}>
                              {selectedCategories.includes(cat) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="leading-tight">{cat}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <FormField control={form.control} name="style" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Style / Aesthetic</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-style"><SelectValue placeholder="Select style preference" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="contemporary">Contemporary / Modern</SelectItem>
                            <SelectItem value="transitional">Transitional</SelectItem>
                            <SelectItem value="traditional">Traditional / Classic</SelectItem>
                            <SelectItem value="industrial">Industrial / Urban</SelectItem>
                            <SelectItem value="coastal">Coastal / Relaxed</SelectItem>
                            <SelectItem value="boutique">Boutique / Custom</SelectItem>
                            <SelectItem value="brand-standard">Brand Standard (follow spec)</SelectItem>
                            <SelectItem value="flexible">Flexible / Open to suggestions</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </Card>
                )}

                {/* ── STEP 4: Attachments & Notes ── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <Card className="p-6 md:p-8 space-y-6" data-testid="section-attachments">
                      <p className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-3">
                        Attach any helpful documents — floor plans, brand standards, room photos, or spec sheets. You can also upload a completed printed inquiry form here.
                      </p>

                      {/* Printed Form Upload — simple visual steps */}
                      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4" data-testid="section-printed-form-hint">
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-1.5">
                          <Scan className="w-3.5 h-3.5" /> Filled out our form on paper? Upload it here:
                        </p>
                        <div className="flex items-center gap-1 text-center flex-wrap justify-center mb-3">
                          <div className="flex flex-col items-center gap-1 px-3">
                            <div className="w-9 h-9 rounded-full bg-white dark:bg-card border flex items-center justify-center">
                              <Printer className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Print form</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <div className="flex flex-col items-center gap-1 px-3">
                            <div className="w-9 h-9 rounded-full bg-white dark:bg-card border flex items-center justify-center">
                              <NotebookPen className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Fill by hand</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <div className="flex flex-col items-center gap-1 px-3">
                            <div className="w-9 h-9 rounded-full bg-white dark:bg-card border flex items-center justify-center">
                              <Camera className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Photo / scan</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <div className="flex flex-col items-center gap-1 px-3">
                            <div className="w-9 h-9 rounded-full bg-white dark:bg-card border flex items-center justify-center">
                              <Upload className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Upload below</span>
                          </div>
                        </div>
                        <Link href="/bom">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:underline cursor-pointer">
                            <ClipboardList className="w-3 h-3" /> Need the form? Open it here to print →
                          </span>
                        </Link>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-3">Upload Files <span className="text-muted-foreground font-normal">(optional)</span></p>
                        <FileUploadZone
                          files={uploadedFiles}
                          onAdd={newFiles => setUploadedFiles(prev => [...prev, ...newFiles])}
                          onRemove={path => setUploadedFiles(prev => prev.filter(f => f.path !== path))}
                        />
                      </div>

                      <FormField control={form.control} name="message" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Anything else we should know — special requirements, custom finishes, accessibility needs, etc."
                              className="min-h-[100px] resize-y"
                              {...field}
                              data-testid="textarea-message"
                            />
                          </FormControl>
                        </FormItem>
                      )} />
                    </Card>

                    {/* ── Account Creation ── */}
                    {currentUser ? (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" data-testid="section-logged-in-notice">
                        <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Signed in as <strong>{currentUser.name}</strong> — this inquiry will automatically appear in your client portal.
                        </p>
                      </div>
                    ) : (
                      <Card className="p-5 border-primary/20 bg-primary/3" data-testid="section-create-account">
                        <div className="flex items-start gap-3">
                          <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold">Track this inquiry in your client portal</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Create a free account to see status updates, upload more documents, and manage future orders.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setWantsAccount(w => !w)}
                                data-testid="button-toggle-create-account"
                                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${wantsAccount ? "bg-primary" : "bg-muted-foreground/30"}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${wantsAccount ? "translate-x-4" : ""}`} />
                              </button>
                            </div>

                            {wantsAccount && (
                              <div className="mt-4 space-y-3" data-testid="section-password-input">
                                <div className="p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
                                  Account email: <strong>{emailValue || "—"}</strong>
                                  {!emailValue && <span className="text-destructive ml-1">(enter your email in Step 1)</span>}
                                </div>
                                <div className="space-y-1">
                                  <label htmlFor="input-new-password" className="text-sm font-medium">Create a password</label>
                                  <div className="relative">
                                    <Input
                                      id="input-new-password"
                                      type={showPw ? "text" : "password"}
                                      placeholder="Min. 8 characters"
                                      value={newPassword}
                                      onChange={e => setNewPassword(e.target.value)}
                                      data-testid="input-new-password"
                                    />
                                    <button type="button" onClick={() => setShowPw(s => !s)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                      aria-label={showPw ? "Hide password" : "Show password"}
                                      data-testid="button-toggle-pw-visibility">
                                      {showPw ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                                    </button>
                                  </div>
                                  {newPassword.length > 0 && newPassword.length < 8 && (
                                    <p className="text-xs text-destructive">Must be at least 8 characters</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0} className="gap-2" data-testid="button-prev-step">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>

                  {!isLastStep ? (
                    <Button type="button" onClick={advance} className="gap-2" data-testid="button-next-step">
                      Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={mutation.isPending || (wantsAccount && newPassword.length > 0 && newPassword.length < 8)}
                      className="gap-2 min-w-[160px]"
                      data-testid="button-submit-inquiry"
                    >
                      {mutation.isPending ? "Submitting…" : "Submit Inquiry"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
