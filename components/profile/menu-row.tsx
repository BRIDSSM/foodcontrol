import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function MenuRow({
  label,
  onPress,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      className="h-auto w-full flex-row items-center justify-between px-4 py-3.5"
      accessibilityLabel={label}
      onPress={onPress}
    >
      <Text className={destructive ? 'text-destructive' : undefined}>{label}</Text>
      {!destructive && <Text className="text-lg text-muted-foreground">›</Text>}
    </Button>
  );
}
