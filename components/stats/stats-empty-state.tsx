import { LottieEmptyState } from '@/components/ui/lottie-empty-state';

export function StatsEmptyState() {
  return (
    <LottieEmptyState
      source={require('@/assets/animations/empty-stats.json')}
      title="Nenhum dado ainda"
      description={`Registre consumos ou descartes\npara ver as estatísticas.`}
    />
  );
}
