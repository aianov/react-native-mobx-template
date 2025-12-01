import { useFocusEffect as useRNFocusEffect } from '@react-navigation/native';
import type { EffectCallback } from 'react';

export function useFocusEffect(effect: EffectCallback): void {
	useRNFocusEffect(effect);
}

export { useFocusEffect as useFocusEffectOptimized };

