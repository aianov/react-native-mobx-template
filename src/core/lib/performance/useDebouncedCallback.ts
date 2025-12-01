import { useCallback, useEffect, useRef } from 'react';

/**
 * Creates a debounced version of a callback function.
 * Useful for expensive operations like search or API calls.
 * 
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * 
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   searchAPI(query);
 * }, 300);
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
	callback: T,
	delay: number
): T {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return useCallback(
		((...args: any[]) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				callbackRef.current(...args);
			}, delay);
		}) as T,
		[delay]
	);
}

/**
 * Creates a throttled version of a callback function.
 * Ensures the callback is called at most once per specified interval.
 * 
 * @param callback - The function to throttle
 * @param interval - Minimum interval between calls in milliseconds
 * 
 * @example
 * ```tsx
 * const handleScroll = useThrottledCallback((event) => {
 *   updateScrollPosition(event.nativeEvent.contentOffset.y);
 * }, 16); // ~60fps
 * ```
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
	callback: T,
	interval: number
): T {
	const lastCallRef = useRef<number>(0);
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	return useCallback(
		((...args: any[]) => {
			const now = Date.now();
			if (now - lastCallRef.current >= interval) {
				lastCallRef.current = now;
				callbackRef.current(...args);
			}
		}) as T,
		[interval]
	);
}

