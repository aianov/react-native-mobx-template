import { NavigationContainer as RNNavigationContainer } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import { setNavigationInstance } from './globalNavigation';
import type { NavigationContainerProps } from './types';
import { navigationRef } from './utils/navigationRef';

export function NavigationContainerWithRef({ children, onReady }: NavigationContainerProps) {
	const isReadyRef = useRef(false);

	const handleReady = useCallback(() => {
		if (!isReadyRef.current) {
			isReadyRef.current = true;
			setNavigationInstance(navigationRef.current);
			onReady?.();
		}
	}, [onReady]);

	useEffect(() => {
		if (navigationRef.current) {
			setNavigationInstance(navigationRef.current);
		}
	}, []);

	return (
		<RNNavigationContainer ref={navigationRef} onReady={handleReady}>
			{children}
		</RNNavigationContainer>
	);
}

