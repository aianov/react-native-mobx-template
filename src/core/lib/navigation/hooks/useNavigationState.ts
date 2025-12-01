import type { NavigationState } from '@react-navigation/native';
import { useNavigationState as useRNNavigationState } from '@react-navigation/native';

export function useNavigationState<T = NavigationState>(
	selector: (state: NavigationState) => T
): T {
	return useRNNavigationState(selector);
}

