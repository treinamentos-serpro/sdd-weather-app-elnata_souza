interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  isLoading?: boolean;
}

export default function ErrorState({ message, onRetry, isLoading = false }: ErrorStateProps) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="space-y-3 rounded-lg border border-red-400/30 bg-red-400/5 p-4 text-white"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isLoading}
        className="rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
      >
        {isLoading ? 'Carregando…' : 'Tentar novamente'}
      </button>
    </section>
  );
}
