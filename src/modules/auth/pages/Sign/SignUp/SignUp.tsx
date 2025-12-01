import { getGenderContextMenuItems } from '@auth/shared/config/context-menu-data';
import { authActionsStore, authStore } from '@auth/stores';
import { BgWrapperUi, Box, ButtonUi, InputUi, LoaderUi, MainText, PhoneInputUi } from '@core/ui';
import { navigate } from '@lib/navigation';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, StyleSheet, TouchableNativeFeedback, View } from 'react-native';

export const SignUp = observer(() => {
	const { currentTheme } = themeStore;
	const { registerSai: { status } } = authActionsStore;
	const {
		signUpForm: {
			values,
			errors,
			disabled,
			setValue
		},
		callingCode: { setCallingCode },
	} = authStore;

	const { t } = useTranslation();
	const genderBtnRef = useRef(null);
	const [isGenderOpen, setIsGenderOpen] = useState(false);

	const genderContextMenuItems = getGenderContextMenuItems();

	const onGenderContextMenuClose = () => setIsGenderOpen(false);
	const onGenderBtnPress = () => setIsGenderOpen(true);

	useEffect(() => {
		return () => setIsGenderOpen(false);
	}, []);

	return (
		<BgWrapperUi
			requiredBg={false}
		>
			<TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
				<View style={s.main}>
					<Box style={s.container}>
						<InputUi
							values={values}
							errors={errors}
							setValue={setValue}
							name='name'
							placeholder={t("name_placeholder")}
						/>

						<PhoneInputUi
							values={values}
							setValue={setValue}
							setCallingCode={setCallingCode}
							errors={errors}
							placeholder={t("phone_number_placeholder")}
							name='number'
						/>

						<InputUi
							values={values}
							setValue={setValue}
							placeholder={t("password_placeholder")}
							errors={errors}
							name='password'
						/>

						<InputUi
							values={values}
							errors={errors}
							setValue={setValue}
							name='repeatPassword'
							placeholder={t("repeat_password_placeholder")}
						/>

						<ButtonUi
							disabled={disabled || status === 'pending'}
							onPress={() => { }}
							bRad={10}
						>
							{status === 'pending' ? (
								<LoaderUi
									size={"small"}
									color={currentTheme.text_100}
								/>
							) : (
								<MainText color={currentTheme.btn_bg_000}>{t('signup')}</MainText>
							)}
						</ButtonUi>

						<View style={s.footer}>
							<MainText>{t('haveaccount')}</MainText>
							<MainText
								style={s.glow}
								onPress={() => navigate('SignIn')}
								color={currentTheme.primary_100}
							>
								{t('signin')}
							</MainText>
						</View>
					</Box>
				</View>
			</TouchableNativeFeedback>
		</BgWrapperUi>
	);
});

export const s = StyleSheet.create({
	container: {
		flexDirection: 'column',
		width: 325,
		gap: 15,
	},
	main: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 14
	},
	footer: {
		display: 'flex',
		flexDirection: 'row',
		gap: 5
	},
	glow: {
		fontWeight: 600
	},
	genderSelector: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: "space-between",
		gap: 10,
	},
	genderOptions: {
		flexDirection: 'row',
		gap: 5
	},
	genderBtn: {
		width: 100,
		alignItems: "center",
		justifyContent: "center"
	}
});