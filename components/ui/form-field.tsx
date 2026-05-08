import type { ReactNode } from 'react';
import type { TextInputProps } from 'react-native';
import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps extends TextInputProps {
  label: string;
  nativeID: string;
  leftIcon?: ReactNode;
}

export function FormField({ label, nativeID, leftIcon, ...inputProps }: FormFieldProps) {
  return (
    <View className="gap-2">
      <Label nativeID={nativeID}>{label}</Label>
      {leftIcon ? (
        <View className="relative">
          <View className="absolute bottom-0 left-3 top-0 z-10 justify-center">{leftIcon}</View>
          <Input nativeID={nativeID} className="pl-10" {...inputProps} />
        </View>
      ) : (
        <Input nativeID={nativeID} {...inputProps} />
      )}
    </View>
  );
}
