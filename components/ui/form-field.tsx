import type { TextInputProps } from 'react-native';
import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps extends TextInputProps {
  label: string;
  nativeID: string;
}

export function FormField({ label, nativeID, ...inputProps }: FormFieldProps) {
  return (
    <View className="gap-2">
      <Label nativeID={nativeID}>{label}</Label>
      <Input nativeID={nativeID} {...inputProps} />
    </View>
  );
}
