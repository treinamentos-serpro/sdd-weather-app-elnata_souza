interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section role="status" aria-live="polite" className="space-y-2 py-8 text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm text-slate-300">{hint}</p>
    </section>
  );
}
