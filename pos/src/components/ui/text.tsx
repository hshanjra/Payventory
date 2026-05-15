import { cn } from '@/lib/utils';
import { Text as NativeText, TextProps } from 'react-native';

export const Text: React.FC<TextProps> = ({ className, ...props }) => {
  return <NativeText className={cn('text-base', className)} {...props} />;
};
