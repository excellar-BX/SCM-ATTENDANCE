"use client";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton({ children, className = "btn btn-primary", pendingText, ...rest }: {
  children: React.ReactNode; className?: string; pendingText?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} {...rest}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

/** A submit button that asks for confirmation first. */
export function ConfirmButton({ children, message, className = "btn btn-danger btn-sm" }: {
  children: React.ReactNode; message: string; className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      {children}
    </button>
  );
}
