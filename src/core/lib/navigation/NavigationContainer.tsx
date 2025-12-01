import { NavigationContainer as RNNavigationContainer } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { NavigationContainerProps } from './types';

export function NavigationContainer({ children, onReady }: NavigationContainerProps) {
	const isReadyRef = useRef(false);

	const handleReady = useCallback(() => {
		if (!isReadyRef.current) {
			isReadyRef.current = true;
			onReady?.();
		}
	}, [onReady]);

	return (
		<RNNavigationContainer onReady={handleReady}>
			{children}
		</RNNavigationContainer>
	);
}

