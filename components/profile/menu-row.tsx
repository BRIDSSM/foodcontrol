import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function MenuRow({
  label,
  onPress,
  destructive = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      className="h-auto w-full flex-row items-center justify-between px-4 py-3.5"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={destructive ? 'text-destructive' : undefined}>{label}</Text>
      {!destructive && <Text className="text-lg text-muted-foreground">›</Text>}
    </Button>
  );
}
