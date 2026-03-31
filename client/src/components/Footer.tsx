import { Link } from "wouter";
import { Phone, MapPin } from "lucide-react";
import { SiFacebook, SiLinkedin, SiInstagram } from "react-icons/si";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="lg:col-span-1">
            {/* Logo — matches Header exactly */}
            <Link href="/" data-testid="footer-link-logo">
              <div className="flex items-center gap-3 mb-5">
                <svg width="28" height="35" viewBox="0 0 32 40" fill="none" className="flex-shrink-0 text-primary">
                  <path d="M3 39 L3 18 A13 13 0 0 1 29 18 L29 39" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none"/>
                  <path d="M3 39 L3 18 A13 13 0 0 1 29 18 L29 39 Z" fill="currentColor" opacity="0.15"/>
                  <line x1="0" y1="39" x2="32" y2="39" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M9 39 L9 20 A7 7 0 0 1 23 20 L23 39" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
                  <path d="M14 8 L16 4 L18 8 Z" fill="currentColor" opacity="0.8"/>
                </svg>
                <div className="flex flex-col leading-none">
                  <span className="font-serif font-bold tracking-[0.1em] text-background text-[20px] leading-none">DMVH</span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="h-px w-3.5 bg-primary flex-shrink-0" />
                    <span className="text-[9px] tracking-[0.3em] text-primary font-semibold uppercase leading-none">Hospitality</span>
                  </div>
                </div>
              </div>
            </Link>
            <p className="text-sm opacity-70 leading-relaxed max-w-xs">
              Premium hotel and apartment furniture manufacturer serving distributors and wholesalers across North America — from our 800,000+ sq ft facility in Vietnam.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-5 opacity-90">Products</h3>
            <ul className="space-y-3">
              {[
                { label: "Hotel Brand Furniture", href: "/brands" },
                { label: "Apartment Furniture", href: "/brands/apartment" },
                { label: "Bathroom Products", href: "/brands/bathroom" },
                { label: "Guestroom Casegoods", href: "/brands" },
                { label: "Softgoods & Seating", href: "/brands" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href}>
                    <span className="text-sm opacity-60 hover:opacity-100 cursor-pointer transition-opacity" data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-5 opacity-90">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about"><span className="text-sm opacity-60 hover:opacity-100 cursor-pointer transition-opacity" data-testid="footer-link-about">About Us</span></Link></li>
              <li><Link href="/contact"><span className="text-sm opacity-60 hover:opacity-100 cursor-pointer transition-opacity" data-testid="footer-link-contact">Request a Quote</span></Link></li>
              <li><Link href="/brands"><span className="text-sm opacity-60 hover:opacity-100 cursor-pointer transition-opacity" data-testid="footer-link-catalog">Product Catalog</span></Link></li>
              <li><Link href="/bom"><span className="text-sm opacity-60 hover:opacity-100 cursor-pointer transition-opacity" data-testid="footer-link-bom">Inquiry Form (BOM)</span></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-5 opacity-90">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 opacity-60 shrink-0" />
                <span className="text-sm opacity-60">
                  Chicago, IL<br />
                  Dallas, TX<br />
                  Ho Chi Minh City, Vietnam
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 opacity-60 shrink-0" />
                <a href="tel:6202870248" className="text-sm opacity-60 hover:opacity-100 transition-opacity">(620) 287-0248</a>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="opacity-50 hover:opacity-100 transition-opacity" aria-label="Facebook" data-testid="link-facebook">
                <SiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="opacity-50 hover:opacity-100 transition-opacity" aria-label="LinkedIn" data-testid="link-linkedin">
                <SiLinkedin className="w-5 h-5" />
              </a>
              <a href="#" className="opacity-50 hover:opacity-100 transition-opacity" aria-label="Instagram" data-testid="link-instagram">
                <SiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-50">
            &copy; {new Date().getFullYear()} DMVH Hospitality. All rights reserved.
          </p>
          <p className="text-xs opacity-40">
            Premium Hotel & Apartment Furniture Manufacturer
          </p>
        </div>
      </div>
    </footer>
  );
}
