import type { ReactNode } from 'react';
import type { TextInputProps } from 'react-native';
import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps extends TextInputProps {
  label: string;
  nativeID: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function FormField({
  label,
  nativeID,
  leftIcon,
  rightIcon,
  className,
  ...inputProps
}: FormFieldProps) {
  const hasIcon = leftIcon || rightIcon;
  return (
    <View className="gap-2">
      <Label nativeID={nativeID}>{label}</Label>
      {hasIcon ? (
        <View className="relative">
          {leftIcon && (
            <View className="absolute bottom-0 left-3 top-0 z-10 justify-center">{leftIcon}</View>
          )}
          <Input
            nativeID={nativeID}
            className={cn(leftIcon ? 'pl-10' : '', rightIcon ? 'pr-10' : '', className)}
            {...inputProps}
          />
          {rightIcon && (
            <View className="absolute bottom-0 right-3 top-0 z-10 justify-center">{rightIcon}</View>
          )}
        </View>
      ) : (
        <Input nativeID={nativeID} className={className} {...inputProps} />
      )}
    </View>
  );
}
