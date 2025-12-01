import { authActionsStore, authStore } from '@auth/stores';
import { BgWrapperUi, ButtonUi, InputUi, LoaderUi, MainText, PhoneInputUi } from '@core/ui';
import { navigate } from '@lib/navigation';
import { themeStore } from '@theme/stores';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Keyboard, StyleSheet, TouchableNativeFeedback, View } from 'react-native';

export const SignIn = observer(() => {
   const { currentTheme } = themeStore;
   const {
      signInForm: {
         values,
         errors,
         setValue,
         disabled
      },
      callingCode: { setCallingCode }
   } = authStore;
   const {
      loginSai: { status },
      loginAction
   } = authActionsStore;

   const { t } = useTranslation();

   return (
      <BgWrapperUi
         withOverlay={false}
         requiredBg={false}
      >
         <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
            <View style={s.main}>
               <View style={s.container}>
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
                     errors={errors}
                     setValue={setValue}
                     name='password'
                     placeholder={t("password_placeholder")}
                  />

                  <ButtonUi
                     disabled={disabled}
                     onPress={loginAction}
                     bRad={10}
                  >
                     {status == "pending" ? (
                        <LoaderUi
                           size={"small"}
                           color={currentTheme.text_100}
                        />
                     ) : (
                        <MainText
                           color={currentTheme.btn_bg_000}
                        >
                           {t('signin')}
                        </MainText>
                     )}
                  </ButtonUi>

                  <View style={s.footer}>
                     <MainText>{t('noaccount')}</MainText>
                     <MainText
                        style={s.glow}
                        onPress={() => navigate('SignUp')}
                        color={currentTheme.primary_100}
                     >
                        {t('signup')}
                     </MainText>
                  </View>
               </View>
            </View>
         </TouchableNativeFeedback>
      </BgWrapperUi>
   );
});

class TestRerendersStore {
   constructor() {
      makeAutoObservable(this);
   }

   count = 1;

   a = "asd";
   b = 10;

   increment = () => this.count += 1;
   decrement = () => this.count -= 1;
}

const testRerendersStore = new TestRerendersStore();

export const s = StyleSheet.create({
   container: {
      flexDirection: 'column',
      width: 325,
      gap: 14,
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
   }
});