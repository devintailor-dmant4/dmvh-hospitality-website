import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSeo } from "@/hooks/use-seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { BrandGroup } from "@shared/schema";

export default function BrandCatalog() {
  useSeo({
    title: "Hotel Brand Furniture Catalog — IHG, Hilton, Marriott, Wyndham",
    description: "Browse our complete hotel furniture catalog for IHG, Hilton, Marriott, Wyndham, Choice Hotels and more. Brand-compliant FF&E solutions for hospitality properties worldwide.",
    canonical: "/brands",
  });
  const { data: groups, isLoading } = useQuery<BrandGroup[]>({ queryKey: ["/api/brand-groups"] });

  const hotelGroups = groups?.filter(g => !["apartment", "bathroom"].includes(g.slug)) || [];

  return (
    <div className="min-h-screen">
      <section className="relative py-16 md:py-20 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 mb-4" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-serif" data-testid="text-catalog-title">Hotel Brand Furniture</h1>
            <p className="text-lg text-muted-foreground">
              We manufacture complete FF&E packages to exact brand standards for all major hotel chains. Select a brand group below to view available properties and their product packages.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-64 rounded-md" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelGroups.map((group) => (
              <Link key={group.id} href={`/brands/${group.slug}`}>
                <Card className="group cursor-pointer overflow-hidden hover-elevate h-full" data-testid={`card-brand-${group.slug}`}>
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={group.image || "/images/brand-ihg.png"} alt={group.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" width="600" height="400" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                    <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium">
                      <span>View Properties</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
