import { useEffect, useRef, useState, type ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`glass-card ${className}`}>{children}</section>;
}

export function AnimatedNumber({
  value,
  formatter = (number) => number.toLocaleString("en-IN"),
}: {
  value: number;
  formatter?: (value: number) => string;
}) {
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      previous.current = value;
      return;
    }
    const start = previous.current;
    const began = performance.now();
    const duration = 700;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - began) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (value - start) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else previous.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatter(display)}</>;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "saffron",
  detail,
  progress,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "saffron" | "red" | "gold" | "cream";
  detail?: string;
  progress?: number;
}) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <span className="metric-icon"><Icon size={19} /></span>
      <span className="metric-label">{label}</span>
      <strong><AnimatedNumber value={value} formatter={(number) => `₹${Math.round(number).toLocaleString("en-IN")}`} /></strong>
      {detail && <small>{detail}</small>}
      {progress !== undefined && (
        <div className="mini-progress" aria-label={`${Math.round(progress)} percent`}>
          <span style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
        </div>
      )}
    </article>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replaceAll(" ", "_");
  return <span className={`status-badge status-${normalized}`}>{status.replaceAll("_", " ")}</span>;
}

export function MemberAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return <span className={`member-avatar avatar-${size}`} title={name}>{initials}</span>;
}

export function AvatarStack({ names }: { names: string[] }) {
  return (
    <div className="avatar-stack">
      {names.slice(0, 5).map((name, index) => <MemberAvatar key={`${name}-${index}`} name={name} size="sm" />)}
      {names.length > 5 && <span className="avatar-more">+{names.length - 5}</span>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="empty-state">
      <span><Icon size={28} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-grid" aria-label="Loading">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <span className="skeleton-line short" />
          <span className="skeleton-line tall" />
          <span className="skeleton-line" />
        </div>
      ))}
    </div>
  );
}

export function ProgressRing({
  value,
  label,
  size = 112,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className="progress-ring" style={{ "--progress": `${clamped * 3.6}deg`, "--ring-size": `${size}px` } as React.CSSProperties}>
      <div>
        <strong>{Math.round(clamped)}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
