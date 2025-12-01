import { authServiceStore } from '@auth/stores';
import { logger } from '@lib/helpers';
import { initAppStorage, initLocalStorage } from '@storage/index';
import { makeAutoObservable } from 'mobx';

class GlobalInteractionsStore {
	constructor() { makeAutoObservable(this); }

	initStorages = async () => {
		await initAppStorage();
		await initLocalStorage();
	};

	initializeApp = async () => {
		const { initTokensAndOtherData } = authServiceStore;

		this.initStorages();
		initTokensAndOtherData();

		logger.info(
			'App',
			'App initialized and ready for logs. To use logs use: logger.info() and other functions'
		);
	};
}

export const globalInteractionsStore = new GlobalInteractionsStore();