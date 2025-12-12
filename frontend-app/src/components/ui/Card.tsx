import clsx from "classnames";

type CardProps = {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const Card = ({ title, actions, children, className }: CardProps) => (
  <section
    className={clsx(
      "rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl p-6 shadow-2xl shadow-black/50 ring-1 ring-white/10 animate-scale-in",
      className
    )}
  >
    {(title || actions) && (
      <header className="mb-4 flex items-center justify-between">
        {title && <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h3>}
        {actions}
      </header>
    )}
    <div>{children}</div>
  </section>
);

