import { View, Text } from 'react-native';
import { Dialog, DialogProps } from './dialog';
import { Button } from './button';
import { useTheme } from '@/theme/useTheme';

type PromptProps = {
  onSubmit: () => void;
  submitText?: string;
  cancelText?: string;
  description?: string;
} & Omit<DialogProps, 'children'>;

export const Prompt: React.FC<React.PropsWithChildren<PromptProps>> = ({
  onSubmit,
  onClose,
  submitText = 'Yes',
  cancelText = 'No',
  description,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <Dialog {...props} onClose={onClose} containerClassName="max-w-md">
      <View className="gap-6">
        {description && (
          <Text
            style={{ color: colors.fgSecondary }}
            className="text-center text-[15px] leading-6 font-medium">
            {description}
          </Text>
        )}
        {children}
        <View className="flex-row gap-3">
          <Button onPress={onSubmit} className="flex-1">
            {submitText}
          </Button>
          <Button variant="outline" onPress={onClose} className="flex-1">
            {cancelText}
          </Button>
        </View>
      </View>
    </Dialog>
  );
};
