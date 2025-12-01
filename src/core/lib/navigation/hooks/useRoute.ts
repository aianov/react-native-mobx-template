import type { ParamListBase } from '@react-navigation/native';
import { useRoute as useRNRoute } from '@react-navigation/native';
import type { RouteProp } from '../types';

export function useRoute<T extends ParamListBase = ParamListBase, RouteName extends keyof T = keyof T>(): RouteProp<T, RouteName> {
	return useRNRoute<RouteProp<T, RouteName>>();
}

