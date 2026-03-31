import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSeo } from "@/hooks/use-seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, Package } from "lucide-react";
import type { BrandGroup, BrandProperty } from "@shared/schema";

export default function BrandGroupDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: group, isLoading: groupLoading } = useQuery<BrandGroup>({
    queryKey: ["/api/brand-groups", slug],
    queryFn: () => fetch(`/api/brand-groups/${slug}`).then(r => r.json()),
  });

  const { data: properties } = useQuery<BrandProperty[]>({
    queryKey: ["/api/brand-properties/group", group?.id],
    queryFn: () => fetch(`/api/brand-properties/group/${group!.id}`).then(r => r.json()),
    enabled: !!group?.id,
  });

  const isBathOrApt = group && ["apartment", "bathroom"].includes(group.slug);

  useSeo({
    title: group ? `${group.name} Furniture — FF&E Solutions` : "Hotel Furniture Collection",
    description: group?.description ?? "Browse our hotel and apartment furniture collections for leading hospitality brands.",
    canonical: `/brands/${slug}`,
  });

  if (groupLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-20 w-full mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-md" />)}
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Brand Group Not Found</h1>
        <Link href="/brands"><Button data-testid="button-back-not-found">Back to Catalog</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative py-20 md:py-28 border-b overflow-hidden">
        <div className="absolute inset-0">
          <img src={group.image || "/images/brand-ihg.png"} alt={group.name} className="w-full h-full object-cover scale-105" width="1200" height="480" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={isBathOrApt ? "/" : "/brands"}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-white/80 mb-6 hover:text-white hover:bg-white/10" data-testid="button-back-nav">
              <ArrowLeft className="w-4 h-4" />
              {isBathOrApt ? "Back to Home" : "Back to Hotel Brands"}
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-white font-serif tracking-tight" data-testid="text-group-title">
            {group.name}
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-3xl leading-relaxed" data-testid="text-group-description">
            {group.description}
          </p>
          {properties && (
            <div className="mt-6 flex items-center gap-2 text-white/70 text-sm">
              <Package className="w-4 h-4" />
              <span>{properties.length} {isBathOrApt ? "categories" : "properties"} available</span>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {properties && properties.length > 0 && (
          <>
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 font-serif" data-testid="text-properties-title">
                {isBathOrApt ? "Product Categories" : "Brand Properties"}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
                {isBathOrApt
                  ? "Browse our curated selection of premium products designed for hospitality and residential projects."
                  : "Select a property brand to view available FF&E packages including guestroom casegoods, softgoods, lighting, and public area furniture."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mb-12">
              {properties.map((prop) => {
                return (
                  <Link key={prop.id} href={`/property/${prop.slug}`}>
                    <Card className="group cursor-pointer overflow-hidden h-full border-0 shadow-md hover:shadow-xl transition-all duration-500 rounded-xl bg-card" data-testid={`card-property-${prop.slug}`}>
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={prop.image || group.image || "/images/brand-ihg.png"}
                          alt={prop.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          <span className="inline-flex items-center gap-1.5 text-white font-medium text-sm bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-full">
                            Explore Collection
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                      <div className="p-5 pb-6">
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors" data-testid={`text-property-name-${prop.slug}`}>
                          {prop.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {prop.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
