import { ReactNode } from "react";

type PageRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function PageReveal({ children, delay = 0, className = "" }: PageRevealProps) {
  return (
    <div
      className={`page-reveal ${className}`.trim()}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
