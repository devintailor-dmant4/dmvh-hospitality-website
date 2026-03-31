import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { useSeo } from "@/hooks/use-seo";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Eye, Sparkles } from "lucide-react";
import type { BrandProperty, BrandGroup, Product } from "@shared/schema";

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: property, isLoading } = useQuery<BrandProperty>({
    queryKey: ["/api/brand-properties", slug],
    queryFn: () => fetch(`/api/brand-properties/${slug}`).then(r => r.json()),
  });

  const { data: group } = useQuery<BrandGroup>({
    queryKey: ["/api/brand-groups", property?.brandGroupId],
    queryFn: async () => {
      const groups = await fetch("/api/brand-groups").then(r => r.json());
      return groups.find((g: BrandGroup) => g.id === property!.brandGroupId);
    },
    enabled: !!property?.brandGroupId,
  });

  const { data: propertyProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/brand", property?.id],
    queryFn: () => fetch(`/api/products/brand/${property!.id}`).then(r => r.json()),
    enabled: !!property?.id,
  });

  useSeo({
    title: property ? `${property.name} — Hotel Furniture Package` : "Furniture Package",
    description: property?.description ?? "Custom hotel furniture package meeting brand standards.",
    canonical: `/property/${slug}`,
  });

  const productTypes = useMemo(() => {
    const types = [...new Set(propertyProducts?.map(p => p.productType).filter(Boolean))];
    return types as string[];
  }, [propertyProducts]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-64 w-full rounded-md mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-md" />)}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
        <Link href="/brands"><Button data-testid="button-back-not-found">Back to Catalog</Button></Link>
      </div>
    );
  }

  const useTabs = productTypes.length > 1 && propertyProducts && propertyProducts.length > productTypes.length;

  return (
    <div className="min-h-screen">
      <section className="relative py-20 md:py-28 border-b overflow-hidden">
        <div className="absolute inset-0">
          <img src={property.image || "/images/brand-ihg.png"} alt={property.name} className="w-full h-full object-cover scale-105" width="1200" height="480" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {group && (
            <Link href={`/brands/${group.slug}`}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-white/80 mb-6 hover:text-white hover:bg-white/10" data-testid="button-back-group">
                <ArrowLeft className="w-4 h-4" />
                Back to {group.name}
              </Button>
            </Link>
          )}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {group && <Badge className="bg-white/15 text-white border-white/25 backdrop-blur-sm">{group.name}</Badge>}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-white font-serif tracking-tight" data-testid="text-property-title">
            {property.name}
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-3xl leading-relaxed" data-testid="text-property-description">
            {property.description}
          </p>
          {propertyProducts && propertyProducts.length > 0 && (
            <div className="mt-6 flex items-center gap-2 text-white/70 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{propertyProducts.length} products available</span>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {useTabs ? (
          <Tabs defaultValue={productTypes[0]} className="w-full">
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 font-serif" data-testid="text-products-heading">Product Categories</h2>
              <TabsList className="flex flex-wrap h-auto gap-1.5 bg-muted/50 p-1.5 rounded-lg">
                {productTypes.map(type => (
                  <TabsTrigger key={type} value={type} className="text-sm rounded-md" data-testid={`tab-${type?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {type}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {productTypes.map(type => (
              <TabsContent key={type} value={type}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                  {propertyProducts?.filter(p => p.productType === type).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 font-serif" data-testid="text-products-heading">Products</h2>
            <p className="text-muted-foreground mb-10 text-base md:text-lg max-w-2xl">
              Explore our full range of options — each designed with premium materials and built for lasting performance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {propertyProducts?.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {(!propertyProducts || propertyProducts.length === 0) && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-2">Products coming soon</p>
            <p className="text-sm text-muted-foreground mb-6">Our team is preparing the product catalog for this property. Contact us for details.</p>
            <Link href="/contact">
              <Button data-testid="button-contact-for-info">Contact Us for Information</Button>
            </Link>
          </div>
        )}

        <div className="mt-14 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          {group && (
            <Link href={`/brands/${group.slug}`}>
              <Button variant="outline" size="lg" className="gap-2 rounded-full px-6" data-testid="button-bottom-back-group">
                <ArrowLeft className="w-4 h-4" />
                Back to {group.name}
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
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group cursor-pointer overflow-hidden h-full border-0 shadow-md hover:shadow-xl transition-all duration-500 rounded-xl bg-card" data-testid={`card-product-${product.slug}`}>
        <div className="aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-muted to-muted/50">
          <img
            src={product.images?.[0] || "/images/brand-ihg.png"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {product.productType && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/95 text-foreground shadow-sm backdrop-blur-sm border-0 text-xs font-medium">
                {product.productType}
              </Badge>
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
          <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors leading-snug" data-testid={`text-product-name-${product.slug}`}>
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.shortDescription}</p>
          <div className="flex items-center gap-1.5 mt-4 text-primary text-sm font-medium">
            <span>Specs & Details</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
