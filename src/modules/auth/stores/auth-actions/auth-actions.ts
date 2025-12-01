import { MobxSaiFetchInstance, mobxSaiFetch } from '@lib/mobx-toolbox/mobxSaiFetch';
import { makeAutoObservable } from "mobx";
import { authServiceStore } from '../auth-service/auth-service';

class AuthActionsStore {
   constructor() { makeAutoObservable(this); }

   // REGISTER

   registerSai: MobxSaiFetchInstance<any> = {};

   registerAction = async () => {
      const { registerSuccessHandler, registerErrorHandler } = authServiceStore;

      this.registerSai = mobxSaiFetch(
         "",
         {},
         {
            id: "registerAction",
            fetchIfPending: false,
            fetchIfHaveData: true,
            onError: registerErrorHandler,
            onSuccess: registerSuccessHandler,
         }
      );
   };

   // LOGIN

   loginSai: MobxSaiFetchInstance<any> = {};

   loginAction = async () => {
      const { signInSuccessHandler, signInErrorHandler } = authServiceStore;

      this.loginSai = mobxSaiFetch(
         "/login",
         {},
         {
            id: "loginAction",
            fetchIfPending: false,
            fetchIfHaveData: true,
            onError: signInErrorHandler,
            onSuccess: signInSuccessHandler,
         }
      );
   };

   // LOGOUT

   logout: MobxSaiFetchInstance<any> = {};

   logOutAction = async () => {
      const { logoutSuccessHandler, logoutErrorHandler } = authServiceStore;

      this.logout = mobxSaiFetch(
         "",
         {},
         {
            id: "logoutAction",
            fetchIfHaveData: true,
            fetchIfPending: false,
            onError: logoutErrorHandler,
            onSuccess: logoutSuccessHandler,
         }
      );
   };

   // REFRESH TOKEN

   refreshToken: MobxSaiFetchInstance<any> = {};

   refreshTokenAction = () => {
      const { refreshTokenSuccessHandler, refreshTokenErrorHandler } = authServiceStore;

      this.refreshToken = mobxSaiFetch(
         "",
         {},
         {
            id: "refreshTokenAction",
            fetchIfHaveData: true,
            fetchIfPending: false,
            onError: refreshTokenErrorHandler,
            onSuccess: refreshTokenSuccessHandler,
         }
      );
   };
}
export const authActionsStore = new AuthActionsStore();