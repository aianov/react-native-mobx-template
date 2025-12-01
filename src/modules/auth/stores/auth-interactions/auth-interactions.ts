import { signInSchema, signUpSchema } from '@auth/shared/schemas/signSchema';
import { mobxState, useMobxForm } from '@lib/mobx-toolbox';
import { localStorage } from '@storage/index';
import { makeAutoObservable, reaction } from "mobx";

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

class AuthStore {
	constructor() {
		makeAutoObservable(this);

		reaction(
			() => this.appReady.appReady,
			() => {
				if (!this.appReady.appReady) return;
				// YOU CAN USE THIS TO HIDE THE SPLASH SCREEN FROM "expo-splash-screen" PACKAGE
				// hideAsync();
				this.splashScreen.setSplashScreen(true);
			}
		);
	}

	// STATES

	appReady = mobxState(false)('appReady');
	initialScreen = mobxState('SignIn')('initialScreen');
	splashScreen = mobxState(false)('splashScreen');
	callingCode = mobxState('')('callingCode');

	// ONBOARDING

	onboardingCompleted = mobxState(false)('onboardingCompleted');
	currentSlide = mobxState(0)('currentSlide', { reset: true });

	// FORMS

	signInForm = useMobxForm(
		{
			number: "",
			password: ""
		},
		signInSchema,
		{ instaValidate: true, resetErrIfNoValue: false, disabled: true }
	);

	signUpForm = useMobxForm(
		{
			name: "",
			number: "",
			password: "",
			repeatPassword: "",
			gender: "none"
		},
		signUpSchema,
		{ instaValidate: true, resetErrIfNoValue: false, disabled: true }
	);

	// ONBOARDING METHODS

	checkOnboardingStatus = async () => {
		try {
			const completed = await localStorage.get<boolean>(ONBOARDING_COMPLETED_KEY);
			this.onboardingCompleted.setOnboardingCompleted(completed || false);
			return completed || false;
		} catch (error) {
			console.error('Error checking onboarding status:', error);
			return false;
		}
	};

	completeOnboarding = async () => {
		try {
			await localStorage.set(ONBOARDING_COMPLETED_KEY, true);
			this.onboardingCompleted.setOnboardingCompleted(true);
		} catch (error) {
			console.error('Error completing onboarding:', error);
		}
	};

	goToNextSlide = () => {
		this.currentSlide.setCurrentSlide(this.currentSlide.currentSlide + 1);
	};

	goToPreviousSlide = () => {
		if (this.currentSlide.currentSlide > 0) {
			this.currentSlide.setCurrentSlide(this.currentSlide.currentSlide - 1);
		}
	};

	skipOnboarding = async () => {
		await this.completeOnboarding();
	};
}

export const authStore = new AuthStore();