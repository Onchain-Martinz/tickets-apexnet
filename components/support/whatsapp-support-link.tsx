import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const WHATSAPP_SUPPORT_URL =
  "https://wa.me/2349133848512?text=Hi%20Martinz,%20I%20need%20help%20with%20my%20exam%20prep%20account";

type WhatsAppSupportLinkProps = {
  className?: string;
  label?: string;
};

export function WhatsAppSupportLink({
  className,
  label = "Chat with Martinz"
}: WhatsAppSupportLinkProps) {
  return (
    <Button
      asChild
      size="sm"
      variant="ghost"
      className={cn(
        "border border-border/70 bg-background/70 px-3 text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <a
        href={WHATSAPP_SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Need help? Chat with Martinz on WhatsApp"
      >
        <MessageCircle className="mr-2 size-4" aria-hidden="true" />
        {label}
      </a>
    </Button>
  );
}
