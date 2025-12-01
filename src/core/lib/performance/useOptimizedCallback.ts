import { useCallback, useRef } from 'react';

/**
 * A more stable version of useCallback that prevents unnecessary re-renders.
 * Unlike React's useCallback, this version uses refs internally to maintain
 * the same function reference across renders while still using the latest values.
 * 
 * This is useful in scenarios where you want to pass callbacks to child components
 * without causing them to re-render every time parent state changes.
 * 
 * @example
 * ```tsx
 * const handlePress = useOptimizedCallback(() => {
 *   console.log(someState); // Always uses the latest state
 * });
 * ```
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
	callback: T,
	deps?: React.DependencyList
): T {
	const callbackRef = useRef(callback);

	callbackRef.current = callback;

	return useCallback(((...args: any[]) => {
		return callbackRef.current(...args);
	}) as T, deps || []);
}

/**
 * Creates a stable callback reference that never changes.
 * Use this when you want maximum stability but still need access to latest values.
 * 
 * @example
 * ```tsx
 * const handlePress = useStableCallback((id: string) => {
 *   // Always has access to latest state via closure
 *   navigation.push('Details', { id });
 * });
 * ```
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
	const callbackRef = useRef(callback);
	callbackRef.current = callback;

	const stableCallback = useRef(((...args: any[]) => {
		return callbackRef.current(...args);
	}) as T);

	return stableCallback.current;
}

