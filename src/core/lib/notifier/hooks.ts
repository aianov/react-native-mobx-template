import { useContext } from 'react';
import { NotifierContext } from './NotifierContext';

export const useNotifier = () => {
	const context = useContext(NotifierContext);
	if (!context) {
		throw new Error('useNotifier must be used within NotifierProvider');
	}
	return context;
};