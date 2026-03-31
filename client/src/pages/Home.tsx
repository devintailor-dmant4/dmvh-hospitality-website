import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSeo } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Factory, Globe, Award, Users, Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { BrandGroup } from "@shared/schema";

function HeroSection() {
  return (
    <section className="relative min-h-[580px] md:min-h-[680px] flex items-center" data-testid="section-hero">
      <div className="absolute inset-0">
        <picture>
          <source srcSet="/images/hero-hotel-room.webp" type="image/webp" />
          <img src="/images/hero-hotel-room.png" alt="Luxury hotel room interior" className="w-full h-full object-cover" width="1920" height="1080" loading="eager" fetchpriority="high" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            Premium FF&E Manufacturer · Direct from Factory
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 font-serif" data-testid="text-hero-title">
            Crafting Exceptional
            <br />
            <span className="text-primary-foreground opacity-90">Hospitality Spaces</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-xl" data-testid="text-hero-subtitle">
            Complete hotel, apartment, and bathroom furniture — manufactured in Vietnam, delivered DDP to North America. Built to exact brand standards for distributors and wholesalers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/brands">
              <Button size="lg" className="text-base" data-testid="button-view-catalog">
                View Product Catalog
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-base bg-white/5 text-white border-white/30 backdrop-blur-sm" data-testid="button-request-quote">
                Request a Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { icon: Factory, label: "Manufacturing Facility", value: "800,000+ sq ft" },
    { icon: Globe, label: "Markets Served", value: "North America" },
    { icon: Award, label: "Years Experience", value: "15+" },
    { icon: Users, label: "Brand Partners", value: "50+" },
  ];
  return (
    <section className="py-10 md:py-14 bg-card border-y" data-testid="section-stats">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-7 h-7 text-primary mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold mb-1" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandGroupsSection() {
  const { data: groups, isLoading } = useQuery<BrandGroup[]>({ queryKey: ["/api/brand-groups"] });
  const hotelGroups = groups?.filter(g => !["apartment", "bathroom"].includes(g.slug)) || [];
  const otherGroups = groups?.filter(g => ["apartment", "bathroom"].includes(g.slug)) || [];

  return (
    <section className="py-14 md:py-20" data-testid="section-brands">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-serif" data-testid="text-brands-title">Hotel Brand Solutions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete FF&E packages built to exact brand standards for all major hotel chains.
          </p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-56 rounded-md" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
              {hotelGroups.map((group) => (
                <Link key={group.id} href={`/brands/${group.slug}`}>
                  <Card className="group cursor-pointer overflow-hidden hover-elevate h-full" data-testid={`card-brand-${group.id}`}>
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={group.image || "/images/brand-ihg.png"} alt={group.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" width="600" height="400" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1" data-testid={`text-brand-name-${group.id}`}>{group.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                      <div className="flex items-center gap-1 mt-2.5 text-primary text-sm font-medium">
                        <span>View Properties</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 font-serif">Apartment & Bathroom Products</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Furniture and fixtures for multifamily developments and full bathroom collections.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {otherGroups.map((group) => (
                <Link key={group.id} href={`/brands/${group.slug}`}>
                  <Card className="group cursor-pointer overflow-hidden hover-elevate h-full" data-testid={`card-brand-${group.id}`}>
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={group.image || "/images/apartment-living.png"} alt={group.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" width="600" height="400" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{group.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                      <div className="flex items-center gap-1 mt-2.5 text-primary text-sm font-medium">
                        <span>Explore Products</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote: "DMVH delivered a complete FF&E package for our 280-room Courtyard renovation on time and under budget. Their understanding of Marriott brand standards was immediately apparent — zero revisions needed on the brand approval package. The quality of the casegoods exceeded what we'd been getting from our previous supplier at a significantly better price point.",
    shortQuote: "On time, under budget, zero brand revisions. The quality exceeded our previous supplier at a significantly better price point.",
    name: "Marcus T.",
    title: "VP of Development",
    company: "Midwest Hospitality Group",
    brand: "Marriott Courtyard · 280 Rooms",
    initials: "MT",
  },
  {
    quote: "We put DMVH through a very demanding pilot — Holiday Inn Express H5 standard for three properties across two states, all with staggered delivery schedules. They managed the complexity without a single delay. We've since moved all eight of our IHG properties to DMVH.",
    shortQuote: "Three properties, two states, staggered schedules — not a single delay. We've since moved all eight of our IHG properties to DMVH.",
    name: "Sandra K.",
    title: "Director of Procurement",
    company: "Pinnacle Hotel Investments",
    brand: "IHG — Holiday Inn Express · 3 Properties",
    initials: "SK",
  },
  {
    quote: "As an owner-operator, I needed a partner I could trust to handle everything from design drawings to DDP delivery at my Hampton Inn. DMVH was exactly that. They even coordinated with my general contractor on the delivery schedule. The rooms look spectacular.",
    shortQuote: "Handled everything from design drawings to DDP delivery. They even coordinated with my GC. The rooms look spectacular.",
    name: "James R.",
    title: "Owner / Operator",
    company: "Riverstone Hospitality",
    brand: "Hampton Inn · 118 Rooms",
    initials: "JR",
  },
  {
    quote: "I consult for several FF&E projects a year and I've rarely seen a manufacturer this responsive. DMVH produced physical samples in three weeks, incorporated all my client's feedback, and managed the entire container logistics to a Texas port. The Wyndham brand audit went smoothly — every item passed on first inspection.",
    shortQuote: "Samples in three weeks, feedback incorporated, full logistics managed. Every item passed the Wyndham brand audit on first inspection.",
    name: "Priya M.",
    title: "Principal FF&E Consultant",
    company: "Meridian Design Consultants",
    brand: "Wyndham — Wingate · 190 Rooms",
    initials: "PM",
  },
  {
    quote: "We converted an office building into a 220-unit Staybridge Suites. The furniture had to work double-duty — hotel quality with apartment livability. DMVH designed a custom casegoods line that hit every IHG spec and still looked like a home. Six months in and no warranty claims.",
    shortQuote: "Custom casegoods that hit every IHG spec while feeling like home. Six months in and zero warranty claims.",
    name: "Derek A.",
    title: "Director of Construction",
    company: "Urban Conversion Partners",
    brand: "IHG — Staybridge Suites · 220 Units",
    initials: "DA",
  },
  {
    quote: "Our 320-unit multifamily development needed high-durability apartment furniture that could hold up to turnover while still looking upscale for leasing tours. DMVH handled 60 containers worth — US customs clearance, final-mile delivery coordination. Absolutely seamless.",
    shortQuote: "60 containers, customs clearance, final-mile coordination — all handled without a hitch. Absolutely seamless.",
    name: "Linda C.",
    title: "VP of Asset Management",
    company: "Horizon Residential REIT",
    brand: "Luxury Apartments · 320 Units",
    initials: "LC",
  },
];

function TestimonialsSection() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="py-14 md:py-20 bg-card border-y" data-testid="section-testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif">Trusted by Leading Buyers</h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              From single-property renovations to multi-site rollouts — hear from our clients.
            </p>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors"
                data-testid="button-testimonials-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors"
                data-testid="button-testimonials-next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visible.map((t, i) => {
            const idx = page * perPage + i;
            return (
              <Card key={idx} className="p-5 flex flex-col gap-3 hover:shadow-md transition-shadow" data-testid={`card-testimonial-${idx}`}>
                <Quote className="w-6 h-6 text-primary/25 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-4">"{t.shortQuote}"</p>
                <button
                  onClick={() => setExpandedIdx(idx)}
                  className="text-xs text-primary font-medium hover:underline text-left w-fit"
                  data-testid={`button-read-more-${idx}`}
                >
                  Read full review →
                </button>
                <div className="border-t pt-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{t.initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{t.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{t.title}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px] bg-primary/8 text-primary border-primary/15 font-normal">
                      {t.brand}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={expandedIdx !== null} onOpenChange={(open) => !open && setExpandedIdx(null)}>
        <DialogContent className="max-w-lg" data-testid="dialog-testimonial">
          {expandedIdx !== null && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-lg">{testimonials[expandedIdx].name} — {testimonials[expandedIdx].company}</DialogTitle>
              </DialogHeader>
              <div className="pt-2">
                <Quote className="w-8 h-8 text-primary/20 mb-3" />
                <p className="text-muted-foreground leading-relaxed italic text-sm">"{testimonials[expandedIdx].quote}"</p>
                <div className="mt-4 pt-4 border-t flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{testimonials[expandedIdx].initials}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonials[expandedIdx].name}</p>
                    <p className="text-xs text-muted-foreground">{testimonials[expandedIdx].title}, {testimonials[expandedIdx].company}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px] bg-primary/8 text-primary border-primary/15 font-normal">
                      {testimonials[expandedIdx].brand}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-14 md:py-20 bg-primary" data-testid="section-cta">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-serif">Ready to Furnish Your Properties?</h2>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
          Get competitive pricing on complete FF&E packages — hotels, apartments, and bathrooms — with DDP delivery to any North American port.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="text-base" data-testid="button-cta-quote">Request a Quote</Button>
          </Link>
          <Link href="/brands">
            <Button size="lg" variant="outline" className="text-base bg-white/5 text-primary-foreground border-primary-foreground/30" data-testid="button-cta-catalog">Browse Catalog</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useSeo({
    title: "Premium Hotel & Apartment Furniture Manufacturer",
    description: "DMVH Hospitality manufactures custom hotel and apartment furniture for IHG, Hilton, Marriott, Wyndham and more. US-Vietnam startup with Chicago, Dallas, and Ho Chi Minh City offices.",
    canonical: "/",
  });
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <BrandGroupsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
