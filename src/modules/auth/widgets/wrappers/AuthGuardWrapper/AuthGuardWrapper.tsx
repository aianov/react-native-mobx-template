import { authServiceStore, authStore } from '@auth/stores';
import { observer } from "mobx-react-lite";
import { useEffect } from 'react';

export const AuthGuardWrapper = observer(({ children }: { children: React.ReactNode; }) => {
	const {
		appReady: { setAppReady },
		initialScreen: { setInitialScreen },
		checkOnboardingStatus
	} = authStore;
	const { checkAuth } = authServiceStore;

	const init = async () => {
		const onboardingCompleted = await checkOnboardingStatus();

		if (!onboardingCompleted) {
			setInitialScreen("Onboarding");
			setAppReady(true);
			return;
		}

		const authStatus = await checkAuth();

		await new Promise(resolve => setTimeout(resolve, 2000));

		if (authStatus === "refreshing") return;
		if (authStatus === "authenticated") setInitialScreen("Posts");

		setAppReady(true);
	};

	useEffect(() => {
		init();
	}, []);

	return children;
});