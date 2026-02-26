import { Youtube, Instagram, Twitter } from "lucide-react";
import { KANTA_SOCIAL } from "@/lib/livestream-data";

const links = [
  { href: KANTA_SOCIAL.youtube, label: "YouTube", icon: Youtube },
  { href: KANTA_SOCIAL.instagram, label: "Instagram", icon: Instagram },
  { href: KANTA_SOCIAL.x, label: "X", icon: Twitter },
];

export default function SocialLinks() {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center justify-center gap-6">
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex items-center gap-2 text-muted hover:text-accent transition-colors duration-200"
        >
          <Icon className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">{label}</span>
        </a>
      ))}
    </div>
  );
}
