interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando…' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex items-center gap-3 py-6 text-slate-300"
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      />
      <span>{message}</span>
    </div>
  );
}
