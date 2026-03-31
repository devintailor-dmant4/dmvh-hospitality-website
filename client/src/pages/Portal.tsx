import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Building2, MessageSquare, User, LogOut, ChevronRight, Clock, Eye,
  KeyRound, ShoppingCart, Plus, Minus, Trash2, Package, ArrowRight, CheckCircle2,
  ChevronDown, ChevronUp, Pencil,
} from "lucide-react";
import type { Inquiry, BrandGroup, BrandProperty, Product } from "@shared/schema";

type AuthUser = { id: number; email: string; name: string; company?: string | null; phone?: string | null };

interface OrderItem {
  productId: number;
  productName: string;
  productType?: string | null;
  brandProperty?: string;
  image?: string | null;
  quantity: number;
  color?: string;
  finish?: string;
  size?: string;
  notes?: string;
  isCustom?: boolean;
}

function statusColor(status: string | null) {
  switch (status) {
    case "quoted": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300";
    case "in-progress": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300";
    case "completed": return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300";
    default: return "bg-muted text-muted-foreground border";
  }
}

function statusLabel(status: string | null) {
  switch (status) {
    case "quoted": return "Quoted";
    case "in-progress": return "In Progress";
    case "completed": return "Completed";
    default: return "Under Review";
  }
}

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const [open, setOpen] = useState(false);
  const details = inquiry.details as Record<string, any> | null;
  const isOrder = details?.orderItems?.length > 0;

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-inquiry-${inquiry.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              {isOrder && <Package className="w-3.5 h-3.5 text-primary" />}
              <p className="font-medium text-sm">{isOrder ? `Order — ${details.orderItems.length} item${details.orderItems.length !== 1 ? "s" : ""}` : (inquiry.message || "General Inquiry")}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
            </p>
          </div>
          <Badge className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${statusColor(inquiry.status)}`}>
            {statusLabel(inquiry.status)}
          </Badge>
        </div>

        {isOrder && (
          <div className="mb-3 space-y-0.5">
            {(details.orderItems as OrderItem[]).slice(0, 3).map((item, i) => (
              <div key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="w-5 h-5 bg-primary/10 text-primary rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{item.quantity}</span>
                <span className="truncate">
                  {item.productName}
                  {item.color && <span className="text-muted-foreground/70"> · {item.color}</span>}
                  {item.size && <span className="text-muted-foreground/70"> · {item.size}</span>}
                </span>
              </div>
            ))}
            {details.orderItems.length > 3 && (
              <p className="text-xs text-muted-foreground pl-6">+{details.orderItems.length - 3} more items</p>
            )}
          </div>
        )}

        {!isOrder && (inquiry.company || inquiry.projectLocation) && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
            {inquiry.company && <span>Company: <span className="text-foreground">{inquiry.company}</span></span>}
            {inquiry.projectLocation && <span>Location: <span className="text-foreground">{inquiry.projectLocation}</span></span>}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1" data-testid={`button-view-inquiry-${inquiry.id}`}>
              <Eye className="w-3.5 h-3.5" /> View full details
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">{isOrder ? "Order" : "Inquiry"} #{inquiry.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColor(inquiry.status)}`}>{statusLabel(inquiry.status)}</Badge>
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" }) : "—"}
                </span>
              </div>

              {isOrder && (
                <div>
                  <p className="font-medium mb-2">Order Items</p>
                  <div className="space-y-2">
                    {(details!.orderItems as OrderItem[]).map((item, i) => (
                      <div key={i} className="p-3 rounded-md bg-muted/40 border">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-7 h-7 bg-primary/10 text-primary rounded-md text-xs font-bold flex items-center justify-center flex-shrink-0">{item.quantity}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{item.productName}</p>
                            {item.brandProperty && <p className="text-xs text-muted-foreground">{item.brandProperty}</p>}
                          </div>
                        </div>
                        {(item.color || item.finish || item.size || item.notes) && (
                          <div className="mt-1.5 pl-9 space-y-0.5 text-xs text-muted-foreground">
                            {item.color && <p>Color: <span className="text-foreground">{item.color}</span></p>}
                            {item.finish && <p>Finish: <span className="text-foreground">{item.finish}</span></p>}
                            {item.size && <p>Size: <span className="text-foreground">{item.size}</span></p>}
                            {item.notes && <p>Notes: <span className="text-foreground">{item.notes}</span></p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inquiry.message && !isOrder && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Message</p>
                  <p className="leading-relaxed">{inquiry.message}</p>
                </div>
              )}

              {details?.orderNotes && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Order Notes</p>
                  <p className="leading-relaxed">{details.orderNotes}</p>
                </div>
              )}

              <Separator />
              <p className="text-xs text-muted-foreground">
                Questions? <a href="mailto:sales@dmvhhospitality.com" className="text-primary hover:underline">sales@dmvhhospitality.com</a> · <a href="tel:6202870248" className="text-primary hover:underline">(620) 287-0248</a>
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function OrderItemRow({ item, onUpdate, onQty, onRemove }: {
  item: OrderItem;
  onUpdate: (id: number, field: keyof OrderItem, val: string) => void;
  onQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border rounded-md overflow-hidden" data-testid={`order-item-${item.productId}`}>
      <div className="flex items-center gap-2 p-2 bg-muted/30">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-tight truncate">{item.productName}</p>
          {item.brandProperty && <p className="text-[10px] text-muted-foreground truncate">{item.brandProperty}</p>}
          {(item.color || item.size) && (
            <p className="text-[10px] text-primary truncate mt-0.5">
              {[item.color, item.finish, item.size].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onQty(item.productId, -1)} className="w-5 h-5 rounded bg-background border flex items-center justify-center hover:bg-muted" data-testid={`button-decrease-${item.productId}`}>
            <Minus className="w-2.5 h-2.5" />
          </button>
          <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
          <button onClick={() => onQty(item.productId, 1)} className="w-5 h-5 rounded bg-background border flex items-center justify-center hover:bg-muted" data-testid={`button-increase-${item.productId}`}>
            <Plus className="w-2.5 h-2.5" />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground ml-0.5" title="Edit details">
            <Pencil className="w-3 h-3" />
          </button>
          <button onClick={() => onRemove(item.productId)} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive" data-testid={`button-remove-${item.productId}`}>
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="p-2.5 bg-background border-t space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Color</label>
              <Input className="h-7 text-xs" placeholder="e.g. Walnut Brown" value={item.color || ""} onChange={e => onUpdate(item.productId, "color", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Finish</label>
              <Input className="h-7 text-xs" placeholder="e.g. Matte, Gloss" value={item.finish || ""} onChange={e => onUpdate(item.productId, "finish", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Size / Dimensions</label>
            <Input className="h-7 text-xs" placeholder="e.g. Queen, 60×80, Custom" value={item.size || ""} onChange={e => onUpdate(item.productId, "size", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Notes</label>
            <Input className="h-7 text-xs" placeholder="Special requirements for this item" value={item.notes || ""} onChange={e => onUpdate(item.productId, "notes", e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}

function OrderBuilder({ userId, userEmail, userName }: { userId: number; userEmail: string; userName: string }) {
  const { toast } = useToast();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customItem, setCustomItem] = useState({ name: "", productType: "", color: "", finish: "", size: "", notes: "", quantity: 1 });

  const { data: groups } = useQuery<BrandGroup[]>({ queryKey: ["/api/brand-groups"] });
  const { data: properties } = useQuery<BrandProperty[]>({
    queryKey: ["/api/brand-properties/group", selectedGroupId],
    queryFn: () => fetch(`/api/brand-properties/group/${selectedGroupId}`).then(r => r.json()),
    enabled: !!selectedGroupId,
  });
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/brand", selectedPropertyId],
    queryFn: () => fetch(`/api/products/brand/${selectedPropertyId}`).then(r => r.json()),
    enabled: !!selectedPropertyId,
  });

  const selectedProperty = properties?.find(p => p.id === selectedPropertyId);

  const CUSTOM_PREFIX = -Date.now();

  function addItem(product: Product) {
    setOrderItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, {
        productId: product.id,
        productName: product.name,
        productType: product.productType,
        brandProperty: selectedProperty?.name,
        image: product.images?.[0] || null,
        quantity: 1,
      }];
    });
  }

  function addCustomItem() {
    if (!customItem.name.trim()) return;
    const fakeId = -(Date.now() + Math.random() * 1000 | 0);
    setOrderItems(prev => [...prev, {
      productId: fakeId,
      productName: customItem.name.trim(),
      productType: customItem.productType || undefined,
      quantity: Math.max(1, customItem.quantity),
      color: customItem.color || undefined,
      finish: customItem.finish || undefined,
      size: customItem.size || undefined,
      notes: customItem.notes || undefined,
      isCustom: true,
    }]);
    setCustomItem({ name: "", productType: "", color: "", finish: "", size: "", notes: "", quantity: 1 });
    setShowCustomForm(false);
  }

  function updateItemField(productId: number, field: keyof OrderItem, val: string) {
    setOrderItems(prev => prev.map(i => i.productId === productId ? { ...i, [field]: val } : i));
  }

  function updateQty(productId: number, delta: number) {
    setOrderItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  }

  function removeItem(productId: number) {
    setOrderItems(prev => prev.filter(i => i.productId !== productId));
  }

  const submitOrder = useMutation({
    mutationFn: () => apiRequest("POST", "/api/inquiries", {
      name: userName,
      email: userEmail,
      userId,
      message: `Portal order — ${orderItems.length} item${orderItems.length !== 1 ? "s" : ""}`,
      details: { orderItems, orderNotes },
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/portal/inquiries"] });
      setSubmitted(true);
    },
    onError: (err: any) => toast({ title: "Failed to submit order", description: err.message, variant: "destructive" }),
  });

  if (submitted) {
    return (
      <div className="text-center py-12" data-testid="section-order-success">
        <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold font-serif mb-2">Order Submitted</h3>
        <p className="text-muted-foreground mb-6">Our team will review your selection and respond within one business day with pricing and availability.</p>
        <Button onClick={() => { setSubmitted(false); setOrderItems([]); setOrderNotes(""); }} data-testid="button-new-order">
          Build Another Order
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6" data-testid="section-order-builder">
      {/* Left: Product Browser */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-1">Browse & Select Products</h3>
          <p className="text-sm text-muted-foreground">Pick a brand category and property, then add products to your order. Use the pencil icon to add color, size, and finish details.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Brand / Category</Label>
            <Select value={selectedGroupId?.toString() || ""} onValueChange={v => { setSelectedGroupId(parseInt(v)); setSelectedPropertyId(null); }}>
              <SelectTrigger data-testid="select-brand-group"><SelectValue placeholder="Select brand group" /></SelectTrigger>
              <SelectContent>{groups?.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Brand Property / Line</Label>
            <Select value={selectedPropertyId?.toString() || ""} onValueChange={v => setSelectedPropertyId(parseInt(v))} disabled={!selectedGroupId || !properties?.length}>
              <SelectTrigger data-testid="select-brand-property"><SelectValue placeholder={!selectedGroupId ? "Select brand first" : "Select property"} /></SelectTrigger>
              <SelectContent>{properties?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {!selectedPropertyId ? (
          <Card><CardContent className="py-8 text-center">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Select a brand and property above to browse products</p>
          </CardContent></Card>
        ) : productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}</div>
        ) : !products?.length ? (
          <Card><CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No products found. <Link href="/brands"><span className="text-primary hover:underline cursor-pointer">Browse the full catalog</span></Link></p>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map(product => {
              const inOrder = orderItems.find(i => i.productId === product.id);
              return (
                <Card key={product.id} className={`overflow-hidden transition-all ${inOrder ? "border-primary/40 ring-1 ring-primary/20" : ""}`} data-testid={`card-product-${product.id}`}>
                  {product.images?.[0] && <div className="aspect-[3/2] overflow-hidden"><img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" width="300" height="200" loading="lazy" /></div>}
                  <CardContent className="p-3">
                    <p className="font-medium text-sm leading-tight mb-0.5">{product.name}</p>
                    {product.productType && <p className="text-xs text-muted-foreground mb-2">{product.productType}</p>}
                    <Button size="sm" variant={inOrder ? "default" : "outline"} className="w-full text-xs h-8" onClick={() => addItem(product)} data-testid={`button-add-product-${product.id}`}>
                      {inOrder ? <><Plus className="w-3 h-3 mr-1" />Add More (×{inOrder.quantity})</> : <><Plus className="w-3 h-3 mr-1" />Add to Order</>}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Custom Product Entry */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <button type="button" onClick={() => setShowCustomForm(s => !s)}
              className="flex items-center justify-between w-full text-sm font-medium"
              data-testid="button-toggle-custom-form">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Add Custom / Unlisted Product
              </span>
              {showCustomForm ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {showCustomForm && (
              <div className="mt-4 space-y-3 border-t pt-4" data-testid="section-custom-form">
                <p className="text-xs text-muted-foreground">Describe any product not found in the catalog above — we'll source or manufacture it for you.</p>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Product Name / Description *</Label>
                  <Input placeholder="e.g. Custom Headboard, Lobby Sofa, Bathroom Vanity" value={customItem.name} onChange={e => setCustomItem(f => ({ ...f, name: e.target.value }))} data-testid="input-custom-name" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Category / Product Type</Label>
                  <Input placeholder="e.g. Guestroom Casegoods, Lighting, Bathroom" value={customItem.productType} onChange={e => setCustomItem(f => ({ ...f, productType: e.target.value }))} data-testid="input-custom-type" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Color</Label>
                    <Input placeholder="e.g. Espresso" value={customItem.color} onChange={e => setCustomItem(f => ({ ...f, color: e.target.value }))} data-testid="input-custom-color" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Finish</Label>
                    <Input placeholder="e.g. Matte, Satin" value={customItem.finish} onChange={e => setCustomItem(f => ({ ...f, finish: e.target.value }))} data-testid="input-custom-finish" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Size / Dimensions</Label>
                    <Input placeholder="e.g. King, 72×36, Custom" value={customItem.size} onChange={e => setCustomItem(f => ({ ...f, size: e.target.value }))} data-testid="input-custom-size" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Quantity</Label>
                    <Input type="number" min={1} value={customItem.quantity} onChange={e => setCustomItem(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} data-testid="input-custom-qty" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Additional Notes</Label>
                  <Textarea placeholder="Any other specifications, brand standards, or requirements..." className="min-h-[60px] text-xs resize-none" value={customItem.notes} onChange={e => setCustomItem(f => ({ ...f, notes: e.target.value }))} data-testid="textarea-custom-notes" />
                </div>
                <Button type="button" size="sm" className="w-full" onClick={addCustomItem} disabled={!customItem.name.trim()} data-testid="button-add-custom-item">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add to Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: Order Summary */}
      <div className="space-y-4">
        <Card className="sticky top-24">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Order Summary
              {orderItems.length > 0 && <Badge variant="secondary" className="ml-auto text-xs">{orderItems.length} item{orderItems.length !== 1 ? "s" : ""}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderItems.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No items yet — browse products or add a custom item</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
                  {orderItems.map(item => (
                    <OrderItemRow key={item.productId} item={item} onUpdate={updateItemField} onQty={updateQty} onRemove={removeItem} />
                  ))}
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Order Notes</Label>
                  <Textarea placeholder="Delivery timeline, brand standards, project name, special requirements..." className="text-xs min-h-[70px] resize-none" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} data-testid="textarea-order-notes" />
                </div>
                <Button className="w-full" type="button" onClick={() => submitOrder.mutate()} disabled={submitOrder.isPending} data-testid="button-submit-order">
                  {submitOrder.isPending ? "Submitting…" : "Submit Order Request"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">We'll respond with pricing within one business day</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileSection({ user }: { user: AuthUser }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, company: user.company || "", phone: user.phone || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwOpen, setPwOpen] = useState(false);

  const updateProfile = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", "/api/portal/profile", data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile updated" });
      setEditing(false);
    },
    onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  const updatePassword = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", "/api/portal/password", data),
    onSuccess: () => {
      toast({ title: "Password updated" });
      setPwOpen(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate(form);
  }

  function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    updatePassword.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          My Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <form onSubmit={handleSave} className="space-y-3" data-testid="form-edit-profile">
            <div className="space-y-1"><Label className="text-xs">Full Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} data-testid="input-edit-name" /></div>
            <div className="space-y-1"><Label className="text-xs">Company</Label><Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} data-testid="input-edit-company" /></div>
            <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} data-testid="input-edit-phone" /></div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" disabled={updateProfile.isPending} data-testid="button-save-profile">{updateProfile.isPending ? "Saving…" : "Save"}</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)} data-testid="button-cancel-edit">Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium" data-testid="text-profile-name">{user.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span data-testid="text-profile-email">{user.email}</span></div>
            {user.company && <div className="flex justify-between"><span className="text-muted-foreground">Company</span><span data-testid="text-profile-company">{user.company}</span></div>}
            {user.phone && <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span data-testid="text-profile-phone">{user.phone}</span></div>}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} data-testid="button-edit-profile">Edit</Button>
              <Dialog open={pwOpen} onOpenChange={setPwOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" data-testid="button-change-password"><KeyRound className="w-3.5 h-3.5 mr-1" />Password</Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
                  <form onSubmit={handlePasswordSave} className="space-y-3" data-testid="form-change-password">
                    <div className="space-y-1"><Label className="text-xs">Current password</Label><Input type="password" required value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} data-testid="input-current-password" /></div>
                    <div className="space-y-1"><Label className="text-xs">New password</Label><Input type="password" required minLength={8} placeholder="Min. 8 characters" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} data-testid="input-new-password" /></div>
                    <div className="space-y-1"><Label className="text-xs">Confirm new password</Label><Input type="password" required value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} data-testid="input-confirm-new-password" /></div>
                    <Button type="submit" className="w-full" size="sm" disabled={updatePassword.isPending} data-testid="button-save-password">{updatePassword.isPending ? "Updating…" : "Update Password"}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Portal() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: inquiries, isLoading: inquiriesLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/portal/inquiries"],
    enabled: !!user,
    retry: false,
  });

  const logout = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      navigate("/login");
    },
  });

  if (userLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 font-serif">Client Portal</h2>
          <p className="text-muted-foreground text-sm mb-6">Sign in to access your inquiries, orders, and account settings.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login"><Button data-testid="button-portal-login">Access Portal</Button></Link>
            <Link href="/contact"><Button variant="outline" data-testid="button-portal-quote">Request a Quote</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-24 lg:pb-10" data-testid="page-portal">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-portal-welcome">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your inquiries, orders, and account</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending} className="shrink-0" data-testid="button-logout">
          <LogOut className="w-3.5 h-3.5 mr-1.5" />Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <div className="space-y-4">
          <ProfileSection user={user} />
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium mb-3">Quick Links</p>
              <div className="space-y-1">
                <Link href="/contact">
                  <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors cursor-pointer" data-testid="link-quote-form">
                    <div className="flex items-center gap-2 text-sm"><MessageSquare className="w-4 h-4 text-primary" />Request a Quote</div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
                <Link href="/brands">
                  <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors cursor-pointer" data-testid="link-browse-catalog">
                    <div className="flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-primary" />Browse Catalog</div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="inquiries">
            <TabsList className="mb-5">
              <TabsTrigger value="inquiries" data-testid="tab-inquiries">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                My Inquiries
                {inquiries && inquiries.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px]">{inquiries.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="order" data-testid="tab-build-order">
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                Build Order
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inquiries">
              {inquiriesLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}</div>
              ) : !inquiries || inquiries.length === 0 ? (
                <Card>
                  <CardContent className="p-10 text-center">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium mb-1">No inquiries yet</p>
                    <p className="text-sm text-muted-foreground mb-4">Submit a quote request or build an order to get started.</p>
                    <Link href="/contact"><Button data-testid="button-start-inquiry">Request a Quote</Button></Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3" data-testid="list-inquiries">
                  {inquiries.map(inquiry => <InquiryCard key={inquiry.id} inquiry={inquiry} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="order">
              <OrderBuilder userId={user.id} userEmail={user.email} userName={user.name} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
