import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  MessageCircle, X, Send, CheckCircle2, ChevronDown,
} from "lucide-react";

const chatSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(5, "Please describe how we can help"),
});
type ChatForm = z.infer<typeof chatSchema>;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();

  const form = useForm<ChatForm>({
    resolver: zodResolver(chatSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: ChatForm) => {
      const res = await apiRequest("POST", "/api/inquiries", {
        name: data.name,
        email: data.email,
        message: data.message,
        details: { source: "chat-widget" },
      });
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Couldn't send message",
        description: "Please try emailing us at sales@dmvhhospitality.com.",
        variant: "destructive",
      });
    },
  });

  // Allow external "open chat" trigger (e.g. from Contact page card)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("dmvh:open-chat", handler);
    return () => window.removeEventListener("dmvh:open-chat", handler);
  }, []);

  // Hide only on BOM form page
  if (location === "/bom") return null;

  function onSubmit(data: ChatForm) {
    mutation.mutate(data);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      if (submitted) {
        setSubmitted(false);
        form.reset();
      }
    }, 400);
  }

  return (
    <>
      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 lg:bottom-8 right-4 lg:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="bg-white dark:bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">DMVH Hospitality</p>
                <p className="text-white/70 text-xs leading-tight">Typically replies same day</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/70 hover:text-white transition-colors"
              data-testid="button-chat-close"
              aria-label="Close chat"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {submitted ? (
              <div className="text-center py-6 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-base mb-1">Message received!</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our team will follow up within one business day.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClose}
                  className="mt-1"
                  data-testid="button-chat-done"
                >
                  Close
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-muted/40 rounded-xl px-4 py-3 mb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    👋 Hi! Tell us about your project and we'll get back to you shortly.
                  </p>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" data-testid="form-chat">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs">Your Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Smith" className="h-9 text-sm" {...field} data-testid="input-chat-name" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs">Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jane@company.com" className="h-9 text-sm" {...field} data-testid="input-chat-email" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs">How can we help? *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your project — hotel brand, room count, timeline…"
                            className="text-sm min-h-[80px] resize-none"
                            {...field}
                            data-testid="textarea-chat-message"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={mutation.isPending}
                      data-testid="button-chat-send"
                    >
                      {mutation.isPending ? "Sending…" : "Send Message"}
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => { setOpen(o => !o); }}
        data-testid="button-chat-toggle"
        aria-label={open ? "Close chat" : "Open chat"}
        className={`fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
          open ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        {open
          ? <X className="w-6 h-6" />
          : <MessageCircle className="w-6 h-6" />
        }
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
        )}
      </button>
    </>
  );
}
