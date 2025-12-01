import { useIsFocused as useRNIsFocused } from '@react-navigation/native';

export function useIsFocused(): boolean {
	return useRNIsFocused();
}

