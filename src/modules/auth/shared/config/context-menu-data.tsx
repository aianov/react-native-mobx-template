import { authStore } from '@auth/stores';
import { ContextMenuItem } from '@core/ui';
import { t } from 'i18next';

// SIGN UP

export const getGenderContextMenuItems = () => {
	const genderContextMenuItems: ContextMenuItem[] = [
		{
			id: 1,
			label: t('contextMenu_male'),
			icon: 'male',
			callback: () => authStore.selectedGender.setSelectedGender("Male"),
			key: "Male",
		},
		{
			id: 2,
			label: t('contextMenu_female'),
			icon: 'female',
			callback: () => authStore.selectedGender.setSelectedGender("Female"),
			key: "Female",
		},
		{
			id: 3,
			label: t('not_selected'),
			callback: () => authStore.selectedGender.setSelectedGender("None"),
			key: "None",
		},
	];

	return genderContextMenuItems;
};

