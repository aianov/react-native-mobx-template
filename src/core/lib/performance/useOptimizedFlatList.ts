import { useCallback, useMemo } from 'react';
import { FlatListProps } from 'react-native';

interface OptimizedFlatListConfig<T> {
	/**
	 * Window size - number of items to render outside visible area
	 * @default 5
	 */
	windowSize?: number;

	/**
	 * Maximum number of items to render in a batch
	 * @default 10
	 */
	maxToRenderPerBatch?: number;

	/**
	 * Update cells batch period in milliseconds
	 * @default 50
	 */
	updateCellsBatchingPeriod?: number;

	/**
	 * Whether to remove clipped subviews
	 * @default true on Android, false on iOS
	 */
	removeClippedSubviews?: boolean;

	/**
	 * Item height for getItemLayout optimization (if all items have same height)
	 */
	itemHeight?: number;

	/**
	 * Custom getItemLayout function
	 */
	getItemLayout?: FlatListProps<T>['getItemLayout'];
}

/**
 * Hook that provides optimized props for FlatList components.
 * Significantly improves scrolling performance for large lists.
 * 
 * @example
 * ```tsx
 * const optimizedProps = useOptimizedFlatList({
 *   itemHeight: 80, // If all items have same height
 *   windowSize: 5,
 * });
 * 
 * return (
 *   <FlatList
 *     data={items}
 *     renderItem={renderItem}
 *     {...optimizedProps}
 *   />
 * );
 * ```
 */
export function useOptimizedFlatList<T>(config: OptimizedFlatListConfig<T> = {}) {
	const {
		windowSize = 5,
		maxToRenderPerBatch = 10,
		updateCellsBatchingPeriod = 50,
		removeClippedSubviews,
		itemHeight,
		getItemLayout: customGetItemLayout,
	} = config;

	const getItemLayout = useMemo(() => {
		if (customGetItemLayout) {
			return customGetItemLayout;
		}

		if (itemHeight) {
			return (_: any, index: number) => ({
				length: itemHeight,
				offset: itemHeight * index,
				index,
			});
		}

		return undefined;
	}, [customGetItemLayout, itemHeight]);

	const keyExtractor = useCallback((item: any, index: number) => {
		return item?.id?.toString() || item?.key?.toString() || index.toString();
	}, []);

	return useMemo(
		() => ({
			windowSize,
			maxToRenderPerBatch,
			updateCellsBatchingPeriod,
			removeClippedSubviews: removeClippedSubviews ?? undefined,
			getItemLayout,
			keyExtractor,
			initialNumToRender: maxToRenderPerBatch,
			legacyImplementation: false,
			maxRenderAhead: windowSize * 2,
		}),
		[windowSize, maxToRenderPerBatch, updateCellsBatchingPeriod, removeClippedSubviews, getItemLayout, keyExtractor]
	);
}

/**
 * Create memoized renderItem function for FlatList
 * 
 * @example
 * ```tsx
 * const renderItem = useOptimizedRenderItem(({ item }) => (
 *   <MyListItem item={item} />
 * ));
 * ```
 */
export function useOptimizedRenderItem<T>(
	renderFunction: ({ item, index }: { item: T; index: number; }) => React.ReactElement | null
) {
	return useCallback(renderFunction, []);
}

