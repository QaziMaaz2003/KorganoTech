import { brand } from "@/lib/site";
import { cn } from "@/lib/utils";

// lucide-react no longer ships brand marks, so these are simple inline glyphs.
const icons = {
  facebook: (
    <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v1.9H8v3.2h2.6V20H14v-8.3h2.6l.4-3.2H14Z" />
  ),
  instagram: (
    <path d="M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3Zm0 7.7a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm6-7.9a1.1 1.1 0 1 1-1.1-1.1A1.1 1.1 0 0 1 18 7.1ZM21.1 8.2a5.4 5.4 0 0 0-1.5-3.8 5.5 5.5 0 0 0-3.8-1.5C14.3 2.8 9.7 2.8 8.2 2.9a5.5 5.5 0 0 0-3.8 1.5 5.4 5.4 0 0 0-1.5 3.8c-.1 1.5-.1 6.1 0 7.6a5.4 5.4 0 0 0 1.5 3.8 5.5 5.5 0 0 0 3.8 1.5c1.5.1 6.1.1 7.6 0a5.4 5.4 0 0 0 3.8-1.5 5.5 5.5 0 0 0 1.5-3.8c.1-1.5.1-6.1 0-7.6Zm-2 9.2a3.1 3.1 0 0 1-1.7 1.7c-1.2.5-4 .4-5.4.4s-4.2.1-5.4-.4a3.1 3.1 0 0 1-1.7-1.7c-.5-1.2-.4-4-.4-5.4s-.1-4.2.4-5.4a3.1 3.1 0 0 1 1.7-1.7C7.8 4.4 10.6 4.5 12 4.5s4.2-.1 5.4.4a3.1 3.1 0 0 1 1.7 1.7c.5 1.2.4 4 .4 5.4s.1 4.2-.4 5.4Z" />
  ),
  twitter: (
    <path d="M17.8 3h3.1l-6.8 7.7 8 10.6h-6.3l-4.9-6.4L5.3 21.3H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3Zm-1.1 16.4h1.7L7.4 4.8H5.6l11.1 14.6Z" />
  ),
};

const links = [
  { key: "twitter" as const, label: "KorganoTech on X (Twitter)", href: brand.social.twitter },
  { key: "facebook" as const, label: "KorganoTech on Facebook", href: brand.social.facebook },
  { key: "instagram" as const, label: "KorganoTech on Instagram", href: brand.social.instagram },
];

export function SocialIcons({ className, itemClassName }: { className?: string; itemClassName?: string }) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {links.map((l) => (
        <li key={l.key}>
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={l.label}
            className={cn(
              "grid size-9 place-items-center rounded-full border transition-colors",
              itemClassName,
            )}
          >
            <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
              {icons[l.key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
