import type { ParamListBase } from '@react-navigation/native';
import { useNavigation as useRNNavigation } from '@react-navigation/native';
import type { NavigationProp } from '../types';

export function useNavigation<T extends ParamListBase = ParamListBase>(): NavigationProp<T> {
	return useRNNavigation<NavigationProp<T>>();
}

