import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/use-seo";
import { Card } from "@/components/ui/card";
import {
  Factory, Globe, Award, Shield, Users, Truck,
  ArrowRight, ArrowLeft, CheckCircle, Ruler, Handshake
} from "lucide-react";

const services = [
  {
    image: "/images/hero-hotel-room.png",
    title: "Interior Design",
    tagline: "Brand-compliant spaces, beautifully executed",
    bullets: [
      "Custom furniture design for any brand prototype",
      "Room visualization and mood boards",
      "Specification drawings for brand approval",
    ],
  },
  {
    image: "/images/casegoods-collection.png",
    title: "FF&E Procurement",
    tagline: "Everything in one complete package",
    bullets: [
      "Casegoods, seating, lighting & bathroom",
      "Single-source purchasing for the entire property",
      "Competitive pricing direct from manufacturer",
    ],
  },
  {
    image: "/images/service-project-mgmt.png",
    title: "Project Management",
    tagline: "On time, on spec, zero surprises",
    bullets: [
      "End-to-end oversight from contract to delivery",
      "Dedicated US-based account manager per project",
      "Real-time production updates and milestone tracking",
    ],
  },
  {
    image: "/images/about-factory.png",
    title: "Custom Manufacturing",
    tagline: "Precision-built to your exact specifications",
    bullets: [
      "State-of-the-art CNC facility in Vietnam",
      "Physical samples before full production",
      "Any finish, size, or configuration available",
    ],
  },
  {
    image: "/images/service-logistics.png",
    title: "Logistics & Delivery",
    tagline: "From our factory floor to your property",
    bullets: [
      "FOB, CIF, and DDP shipping options",
      "Consolidated container loading for efficiency",
      "Optional installation coordination on arrival",
    ],
  },
  {
    image: "/images/category-guestroom-casegoods.png",
    title: "Brand Standards Compliance",
    tagline: "50+ hotel brands. Zero compliance issues.",
    bullets: [
      "IHG, Hilton, Marriott, Wyndham, Choice & more",
      "Pre-audited finishes and material specifications",
      "Documentation package for brand approval",
    ],
  },
];

const process = [
  { step: "01", icon: Handshake, title: "Consultation", desc: "Review brand requirements, project scope, and timeline." },
  { step: "02", icon: Ruler, title: "Design & Sampling", desc: "Detailed drawings and physical samples for your approval." },
  { step: "03", icon: Factory, title: "Manufacturing", desc: "Production with real-time updates and quality checkpoints." },
  { step: "04", icon: Truck, title: "Delivery", desc: "On-schedule arrival with optional installation support." },
];

export default function About() {
  useSeo({
    title: "About Us — US-Vietnam Furniture Manufacturer",
    description: "DMVH Hospitality is a US-Vietnam startup with offices in Chicago, Dallas, and Ho Chi Minh City, specializing in premium hotel and apartment furniture manufacturing.",
    canonical: "/about",
  });
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative py-16 md:py-20 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 mb-4" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-serif" data-testid="text-about-title">
              About DMVH Hospitality
            </h1>
            <p className="text-lg text-muted-foreground">
              A US-Vietnam partnership delivering world-class hotel and apartment furniture — from design through delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 font-serif">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                DMVH Hospitality was founded by three partners who shared a vision: to bridge American design standards with Vietnamese manufacturing excellence. With offices in Chicago, Dallas, and Ho Chi Minh City, we provide seamless end-to-end service from concept to delivery.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today we supply complete FF&E packages for IHG, Hilton, Marriott, Wyndham, Choice Hotels, and many more — plus apartment furniture and bathroom products for the growing multifamily market.
              </p>
            </div>
            <div className="aspect-[4/3] rounded-md overflow-hidden">
              <img
                src="/images/team-collaboration.png"
                alt="DMVH Hospitality founding team — Indian, American, and Vietnamese partners collaborating"
                className="w-full h-full object-cover"
                data-testid="img-about-hero"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturing Facility */}
      <section className="py-16 md:py-20 bg-card border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative rounded-lg overflow-hidden shadow-xl">
              <img
                src="/images/facility-vietnam.jpeg"
                alt="DMVH Hospitality manufacturing facility — aerial view, Ho Chi Minh City"
                className="w-full h-80 lg:h-96 object-cover"
                data-testid="img-facility"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4">
                <p className="text-white text-sm font-medium">Ho Chi Minh City, Vietnam</p>
                <p className="text-white/75 text-xs">Manufacturing Campus — 800,000+ sq ft</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl md:text-3xl font-bold mb-5 font-serif">Built at Scale</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our campus spans multiple dedicated production halls running simultaneously — casegoods, upholstery, and finishing — enabling large-scale FF&E packages for North American hotel brands without compromising lead times or quality standards.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { stat: "800,000+", label: "Sq Ft Facility" },
                  { stat: "500+", label: "Production Staff" },
                  { stat: "50+", label: "Hotel Brands" },
                ].map(item => (
                  <div key={item.label} className="text-center p-3 rounded-lg bg-background border">
                    <div className="text-xl font-bold text-primary font-serif">{item.stat}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do — image cards */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-3" data-testid="text-services-title">What We Do</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              End-to-end hospitality furniture solutions — from concept and design to manufacturing and delivery.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <Card key={svc.title} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow" data-testid={`card-service-${svc.title.toLowerCase().replace(/[\s&]+/g, '-')}`}>
                <div className="h-44 overflow-hidden flex-shrink-0">
                  <img
                    src={svc.image}
                    alt={svc.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{svc.title}</h3>
                    <p className="text-sm text-primary font-medium mt-0.5">{svc.tagline}</p>
                  </div>
                  <ul className="space-y-1.5 mt-auto">
                    {svc.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-16 md:py-20 bg-card border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center font-serif">What Sets Us Apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Quality Assurance", desc: "Multi-point inspection process at every production stage ensures each piece meets exact brand specifications before shipment." },
              { icon: Globe, title: "US-Vietnam Partnership", desc: "American project managers and Vietnamese production supervisors working together — design precision meets manufacturing excellence." },
              { icon: Award, title: "Brand Standards Expertise", desc: "Deep knowledge of IHG, Hilton, Marriott, Wyndham, Choice, and 40+ other brand standards built over years of delivery." },
              { icon: Truck, title: "Full Logistics Support", desc: "FOB, CIF, and DDP shipping options with consolidated loading, customs coordination, and installation support." },
              { icon: Users, title: "Dedicated Project Teams", desc: "A named account manager and on-site production supervisor assigned to every project from contract to delivery." },
              { icon: Factory, title: "Direct from Manufacturer", desc: "No middlemen. You work directly with the factory, which means better pricing, faster communication, and full transparency." },
            ].map(item => (
              <Card key={item.title} className="p-6">
                <item.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-14 text-center font-serif">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, idx) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                {idx < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 h-px bg-border" style={{ width: "calc(100% - 4rem)", left: "calc(50% + 2rem)" }} />
                )}
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-5 z-10">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary/50 tracking-widest mb-1">STEP {item.step}</div>
                <h3 className="font-semibold mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-serif">Let's Build Together</h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Whether outfitting a new hotel, renovating existing properties, or developing apartment communities — we have the expertise and capacity to deliver.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="text-base" data-testid="button-about-quote">
                Request a Quote
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/brands">
              <Button size="lg" variant="outline" className="text-base bg-white/5 text-primary-foreground border-primary-foreground/30" data-testid="button-about-catalog">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
