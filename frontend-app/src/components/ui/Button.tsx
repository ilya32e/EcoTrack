import clsx from "classnames";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export const Button = ({
  className,
  children,
  variant = "primary",
  ...props
}: ButtonProps) => (
  <button
    className={clsx(
      "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95",
      variant === "primary"
        ? "bg-brand text-white hover:bg-brand-light shadow-lg shadow-brand/20 hover:shadow-brand/40"
        : "bg-white/10 text-white hover:bg-white/20 border border-white/5 backdrop-blur-sm",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

