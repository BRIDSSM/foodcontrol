import { EmptyState } from '@/components/ui/empty-state';
import EmptyStatsIllustration from '@/assets/illustrations/empty-stats.svg';

export function StatsEmptyState() {
  return (
    <EmptyState
      Illustration={EmptyStatsIllustration}
      title="Nenhum dado ainda"
      description={`Registre consumos ou descartes\npara ver as estatísticas.`}
    />
  );
}
