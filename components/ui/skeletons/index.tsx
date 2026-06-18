import { cn } from '@/lib/utils';
import { View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCircle({ size, className }: { size: number; className?: string }) {
  return (
    <Skeleton className={cn('rounded-full', className)} style={{ width: size, height: size }} />
  );
}

export function SkeletonText({
  width,
  height = 16,
  className,
}: {
  width?: number | `${number}%`;
  height?: number;
  className?: string;
}) {
  return (
    <Skeleton
      className={cn('rounded-md', className)}
      style={width ? { width, height } : { height }}
    />
  );
}

export function SkeletonRect({
  width,
  height,
  className,
}: {
  width?: number | `${number}%`;
  height: number;
  className?: string;
}) {
  return (
    <Skeleton
      className={cn('rounded-xl', className)}
      style={width ? { width, height } : { height }}
    />
  );
}

export function SkeletonProductCard() {
  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3">
      <SkeletonRect width={64} height={64} className="rounded-lg" />
      <View className="flex-1 gap-2">
        <SkeletonText width="85%" height={18} />
        <SkeletonText width="60%" height={14} />
        <SkeletonText width="40%" height={14} />
      </View>
      <View className="items-end gap-1.5">
        <SkeletonText width={56} height={20} />
        <SkeletonText width={72} height={14} />
      </View>
    </View>
  );
}

export function SkeletonMetricCard() {
  return (
    <View className="flex-1 gap-2.5 rounded-xl border border-border bg-card p-4">
      <SkeletonText width="70%" height={14} />
      <SkeletonText width="50%" height={36} />
      <SkeletonText width="80%" height={14} />
    </View>
  );
}

export function SkeletonCategoryBar() {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <SkeletonText width={100} height={14} />
        <SkeletonText width={40} height={14} />
      </View>
      <SkeletonRect width="100%" height={8} className="rounded-full" />
    </View>
  );
}
