import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Building2, Sofa, Bath, Phone, Info, FileText, ArrowRight } from "lucide-react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Hotel Brands", href: "/brands" },
  { label: "Apartment", href: "/brands/apartment" },
  { label: "Bathroom", href: "/brands/bathroom" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const mobileNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Hotels", href: "/brands", icon: Building2 },
  { label: "Apartment", href: "/brands/apartment", icon: Sofa },
  { label: "Bathroom", href: "/brands/bathroom", icon: Bath },
  { label: "About", href: "/about", icon: Info },
  { label: "Contact", href: "/contact", icon: Phone },
];

export function Header() {
  const [location] = useLocation();

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        <div className="bg-primary text-primary-foreground hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-6 h-9 text-xs tracking-wide">
            <Link href="/contact">
              <span className="flex items-center gap-1.5 opacity-90 cursor-pointer hover:opacity-100 transition-opacity" data-testid="link-topbar-contact">
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
                <span>Contact Us</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="bg-background/95 backdrop-blur-md border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 lg:h-20">
              <Link href="/" aria-label="DMVH Hospitality — Go to Homepage" data-testid="link-logo">
                <div className="flex items-center gap-3" data-testid="img-logo">
                  <svg width="32" height="40" viewBox="0 0 32 40" fill="none" className="flex-shrink-0 text-primary lg:w-9 lg:h-[46px]" aria-hidden="true">
                    <path d="M3 39 L3 18 A13 13 0 0 1 29 18 L29 39" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
                    <path d="M3 39 L3 18 A13 13 0 0 1 29 18 L29 39 Z" fill="currentColor" opacity="0.1"/>
                    <line x1="0" y1="39" x2="32" y2="39" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M9 39 L9 20 A7 7 0 0 1 23 20 L23 39" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.4"/>
                    <path d="M14 8 L16 4 L18 8 Z" fill="currentColor" opacity="0.7"/>
                  </svg>
                  <div className="flex flex-col leading-none">
                    <span className="font-serif font-bold tracking-[0.1em] text-foreground text-[19px] lg:text-[24px] leading-none">DMVH</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="h-px w-3.5 bg-primary flex-shrink-0" aria-hidden="true" />
                      <span className="text-[9px] lg:text-[10px] tracking-[0.3em] text-primary font-semibold uppercase leading-none">Hospitality</span>
                    </div>
                  </div>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation" data-testid="nav-desktop">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-sm font-medium tracking-wide ${
                        location === item.href ? "text-primary" : "text-muted-foreground"
                      }`}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}

                <Link href="/bom">
                  <Button size="sm" variant="outline" className="ml-2 border-primary/40 text-primary hover:bg-primary/5" data-testid="button-bom-form">
                    <FileText className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                    Inquiry Form
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="sm" className="ml-1" data-testid="button-get-quote">
                    Get a Quote
                  </Button>
                </Link>
              </nav>

              <div className="flex items-center gap-2 lg:hidden">
                <Link href="/bom">
                  <Button variant="ghost" size="icon" className="text-primary" aria-label="Open BOM Inquiry Form" data-testid="button-mobile-bom">
                    <FileText className="w-5 h-5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="sm" data-testid="button-mobile-get-quote">
                    Get a Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t safe-area-bottom" aria-label="Mobile navigation" data-testid="nav-mobile-bottom">
        <div className="grid grid-cols-6 h-16">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/"
              ? location === "/"
              : location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} aria-label={item.label} aria-current={isActive ? "page" : undefined}>
                <div
                  className={`flex flex-col items-center justify-center h-full gap-0.5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
