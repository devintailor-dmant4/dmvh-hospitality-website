import { useEffect } from "react";

interface SeoOptions {
  title: string;
  description?: string;
  canonical?: string;
}

const SITE_NAME = "DMVH Hospitality";
const BASE_URL = "https://dmvhhospitality.com";

export function useSeo({ title, description, canonical }: SeoOptions) {
  useEffect(() => {
    document.title = `${title} | ${SITE_NAME}`;

    const setMeta = (name: string, content: string, prop = false) => {
      const attr = prop ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, true);
    }

    const fullTitle = `${title} | ${SITE_NAME}`;
    setMeta("og:title", fullTitle, true);

    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : `${BASE_URL}${window.location.pathname}`;
    setMeta("og:url", canonicalUrl, true);

    let linkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.setAttribute("rel", "canonical");
      document.head.appendChild(linkEl);
    }
    linkEl.setAttribute("href", canonicalUrl);

    return () => {
      document.title = `${SITE_NAME} - Premium Hotel & Apartment Furniture Manufacturer`;
    };
  }, [title, description, canonical]);
}
