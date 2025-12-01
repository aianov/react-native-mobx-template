import { makeAutoObservable } from "mobx";

class ThemeActionsStore {
	constructor() { makeAutoObservable(this); }

	// themes: MobxSaiInstance<GetThemesResponse> = {}

	getThemesAction = async () => {

	};

}

export const themeActionsStore = new ThemeActionsStore();