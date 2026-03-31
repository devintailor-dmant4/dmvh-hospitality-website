import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSeo } from "@/hooks/use-seo";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, ArrowRight, Eye, Clock, Truck, CreditCard, ChevronRight, ShieldCheck } from "lucide-react";
import type { Product, BrandProperty, BrandGroup } from "@shared/schema";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
  });

  const { data: properties } = useQuery<BrandProperty[]>({
    queryKey: ["/api/brand-properties"],
  });

  const { data: groups } = useQuery<BrandGroup[]>({
    queryKey: ["/api/brand-groups"],
  });

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  useSeo({
    title: product ? `${product.name} — Hotel Furniture` : "Furniture Product",
    description: product?.shortDescription ?? product?.description ?? "Premium hotel and apartment furniture product.",
    canonical: `/product/${slug}`,
  });

  const property = properties?.find(p => p.id === product?.brandPropertyId);
  const group = groups?.find(g => g.id === property?.brandGroupId);
  const relatedProducts = allProducts?.filter(p => p.brandPropertyId === product?.brandPropertyId && p.id !== product?.id).slice(0, 3) || [];

  useEffect(() => {
    setSelectedImage(null);
  }, [slug]);

  const specs = product?.specifications as Record<string, string> | null;
  const specLabels: Record<string, string> = {
    baseMaterial: "Base Material",
    headboard: "Headboard",
    casegoods: "Casegoods Finish",
    countertopSelection: "Countertop Selection",
    softseatingFabrics: "Soft Seating Fabrics",
    specifications: "Specifications",
    application: "Application",
    deliveryTime: "Delivery Time",
    paymentTerms: "Payment Terms",
    deliveryWay: "Delivery Way",
  };

  const highlightSpecs = ["deliveryTime", "paymentTerms", "deliveryWay"];
  const highlightIcons: Record<string, typeof Clock> = {
    deliveryTime: Clock,
    paymentTerms: CreditCard,
    deliveryWay: Truck,
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/brands"><Button data-testid="button-back-catalog">Back to Catalog</Button></Link>
      </div>
    );
  }

  const mainSpecs = specs ? Object.entries(specs).filter(([key]) => !highlightSpecs.includes(key)) : [];
  const quickSpecs = specs ? Object.entries(specs).filter(([key]) => highlightSpecs.includes(key)) : [];

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/brands"><span className="cursor-pointer hover:text-primary transition-colors" data-testid="link-breadcrumb-catalog">Catalog</span></Link>
            {group && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link href={`/brands/${group.slug}`}><span className="cursor-pointer hover:text-primary transition-colors" data-testid="link-breadcrumb-group">{group.name}</span></Link>
              </>
            )}
            {property && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link href={`/property/${property.slug}`}><span className="cursor-pointer hover:text-primary transition-colors" data-testid="link-breadcrumb-property">{property.name}</span></Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/30 shadow-lg">
              <img
                src={selectedImage || product.images?.[0] || "/images/brand-ihg.png"}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
                data-testid="img-product-main"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {product.images.map((img, i) => {
                  const isSelected = (selectedImage || product.images?.[0]) === img;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer ring-2 transition-all ${isSelected ? "ring-primary shadow-md" : "ring-transparent hover:ring-primary/50"}`}
                      data-testid={`img-thumbnail-${i}`}
                    >
                      <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" width="800" height="600" loading="lazy" />
                    </div>
                  );
                })}
              </div>
            )}

            {quickSpecs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                {quickSpecs.map(([key, value]) => {
                  const IconComp = highlightIcons[key] || Clock;
                  return (
                    <div key={key} className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComp className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{specLabels[key] || key}</p>
                        <p className="text-sm font-semibold mt-0.5">{String(value)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-5">
              {group && <Badge variant="secondary" className="font-medium">{group.name}</Badge>}
              {property && <Badge variant="secondary" className="font-medium">{property.name}</Badge>}
              {product.productType && <Badge className="font-medium">{product.productType}</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-5 font-serif tracking-tight leading-tight" data-testid="text-product-title">
              {product.name}
            </h1>

            <p className="text-muted-foreground leading-relaxed text-base mb-8" data-testid="text-product-description">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Key Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5" data-testid={`text-feature-${i}`}>
                      <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mainSpecs.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4" data-testid="text-specs-heading">
                  Specifications
                </h3>
                <div className="rounded-xl border overflow-hidden">
                  {mainSpecs.map(([key, value], idx) => (
                    <div key={key} className={`flex ${idx % 2 === 0 ? "bg-muted/30" : "bg-background"}`}>
                      <div className="w-2/5 px-4 py-3 text-sm font-medium text-muted-foreground border-r">
                        {specLabels[key] || key}
                      </div>
                      <div className="w-3/5 px-4 py-3 text-sm font-medium">
                        {String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8" />

            <div className="flex flex-wrap gap-3">
              <Link href="/contact">
                <Button size="lg" className="rounded-full px-8 shadow-md hover:shadow-lg transition-shadow text-base" data-testid="button-inquire">
                  Request a Quote
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full px-8 text-base" data-testid="button-contact">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="bg-muted/30 border-t py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 font-serif" data-testid="text-related-title">
              More from {property?.name || "This Collection"}
            </h2>
            <p className="text-muted-foreground mb-10 text-base">
              Explore other products in this category to complete your project.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/product/${rp.slug}`}>
                  <Card className="group cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500 rounded-xl bg-card" data-testid={`card-related-${rp.id}`}>
                    <div className="aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-muted to-muted/50">
                      <img src={rp.images?.[0] || "/images/brand-ihg.png"} alt={rp.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" width="400" height="300" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {rp.productType && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/95 text-foreground shadow-sm backdrop-blur-sm border-0 text-xs font-medium">{rp.productType}</Badge>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="inline-flex items-center gap-1.5 text-white font-medium text-sm bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </span>
                      </div>
                    </div>
                    <div className="p-5 pb-6">
                      <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">{rp.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{rp.shortDescription}</p>
                      <div className="flex items-center gap-1.5 mt-4 text-primary text-sm font-medium">
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {property ? (
              <Link href={`/property/${property.slug}`}>
                <Button variant="outline" size="lg" className="gap-2 rounded-full px-6" data-testid="button-bottom-back-property">
                  <ArrowLeft className="w-4 h-4" />
                  Back to {property.name}
                </Button>
              </Link>
            ) : group ? (
              <Link href={`/brands/${group.slug}`}>
                <Button variant="outline" size="lg" className="gap-2 rounded-full px-6" data-testid="button-bottom-back-group">
                  <ArrowLeft className="w-4 h-4" />
                  Back to {group.name}
                </Button>
              </Link>
            ) : (
              <Link href="/brands">
                <Button variant="outline" size="lg" className="gap-2 rounded-full px-6" data-testid="button-bottom-back-catalog">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Catalog
                </Button>
              </Link>
            )}
            <Link href="/contact">
              <Button size="lg" className="gap-2 rounded-full px-6" data-testid="button-bottom-quote">
                Request a Quote
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
