export default function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-8 border-b border-border pb-6">
      {eyebrow && (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </p>
      )}
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}