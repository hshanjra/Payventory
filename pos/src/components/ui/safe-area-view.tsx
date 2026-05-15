import { PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Edge = 'top' | 'bottom' | 'left' | 'right';
type EdgeMode = 'additive' | 'maximum' | 'off';
type EdgeRecord = Partial<Record<Edge, EdgeMode>>;
type EdgeWithAll = Edge | 'all';

type Props = {
  edges?: EdgeWithAll[] | EdgeRecord;
  style?: ViewProps['style'];
} & ViewProps;

const ALL_EDGES: Edge[] = ['top', 'bottom', 'left', 'right'];

function resolveEdges(edges: Props['edges']): Record<Edge, EdgeMode> {
  if (edges == null) {
    return { top: 'additive', bottom: 'additive', left: 'additive', right: 'additive' };
  }

  if (Array.isArray(edges)) {
    const expanded = edges.includes('all') ? ALL_EDGES : (edges as Edge[]);
    const edgeRecord = expanded.reduce<EdgeRecord>(
      (acc, edge) => ({ ...acc, [edge]: 'additive' }),
      {}
    );
    return {
      top: edgeRecord.top ?? 'off',
      bottom: edgeRecord.bottom ?? 'off',
      left: edgeRecord.left ?? 'off',
      right: edgeRecord.right ?? 'off',
    };
  }

  return {
    top: edges.top ?? 'off',
    bottom: edges.bottom ?? 'off',
    left: edges.left ?? 'off',
    right: edges.right ?? 'off',
  };
}

export const SafeAreaView = ({ children, edges, style, ...props }: PropsWithChildren<Props>) => {
  const insets = useSafeAreaInsets();
  const resolvedEdges = resolveEdges(edges);

  const padding = ALL_EDGES.reduce<Record<string, number>>((acc, edge) => {
    const mode = resolvedEdges[edge];
    const inset = insets[edge];
    const key = `padding${edge.charAt(0).toUpperCase() + edge.slice(1)}`;

    acc[key] =
      mode === 'additive'
        ? inset
        : mode === 'maximum'
          ? Math.max(
              inset,
              typeof style === 'object' && style !== null
                ? ((style as Record<string, number>)[key] ?? 0)
                : 0
            )
          : 0;

    return acc;
  }, {});

  return (
    <View style={[padding, style]} {...props}>
      {children}
    </View>
  );
};
