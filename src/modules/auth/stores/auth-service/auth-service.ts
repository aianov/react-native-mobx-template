import { authActionsStore } from '@auth/stores';
import { logger } from '@lib/helpers';
import { navigate } from '@lib/navigation';
import { localStorage } from '@storage/index';
import { jwtDecode } from '@utils/jwt';
import { showNotify } from '@utils/notifications';
import i18n from 'i18n';
import i18next from 'i18next';
import { makeAutoObservable } from "mobx";
import { CheckAuthStatus, TokensAndOtherData } from './types';

class AuthServiceStore {
   constructor() { makeAutoObservable(this, {}, { deep: false }); }

   // STATES 

   tokensAndOtherData: TokensAndOtherData = {
      access_token: '',
      refresh_token: '',
   };

   deviceToken = "";
   setDeviceToken = (token: string) => this.deviceToken = token;

   // FULL CLEAR

   fullClear = () => {
      localStorage.clear();

      navigate('SignIn');
   };

   // TOKENS AND OTHER DATA

   getAuthTokenData = () => jwtDecode(this.tokensAndOtherData.access_token);
   getProfileUserId = () => jwtDecode(this.tokensAndOtherData.access_token).id || null;
   getTokensAndOtherData = (): TokensAndOtherData => this.tokensAndOtherData;
   setTokensAndOtherData = (data: TokensAndOtherData) => {
      const tokensAndOtherData = {
         access_token: data.access_token,
         refresh_token: data.refresh_token,
      };

      this.tokensAndOtherData = tokensAndOtherData;
   };

   // THIS FUNCTION CAN BE USED TO INIT ALL TOKENS AND OTHER DATA
   initTokensAndOtherData = async () => { };

   // AUTH HANDLERS

   checkAuth = async (): Promise<CheckAuthStatus> => {
      const { refreshTokenAction } = authActionsStore;

      const tokens: any = await localStorage.get("tokens");

      if (!tokens || !tokens.accessToken || !tokens.refreshToken) return "unauthenticated";

      const refreshToken = tokens?.refreshToken;
      const accessToken = tokens?.accessToken;

      const accessTokenData = jwtDecode(accessToken);
      const refreshTokenData = jwtDecode(refreshToken);

      if (accessTokenData?.exp?.toString().length > 10) {
         accessTokenData.exp = accessTokenData.exp / 1000;
      }

      if (refreshTokenData?.exp?.toString().length > 10) {
         refreshTokenData.exp = refreshTokenData.exp / 1000;
      }

      const accessTokenExpired = new Date(accessTokenData?.exp * 1000) < new Date();
      const refreshTokenExpired = new Date(refreshTokenData?.exp * 1000) < new Date();

      logger.info("checkAuth", `accessTokenExpired: ${accessTokenExpired}, refreshTokenExpired: ${refreshTokenExpired}`);

      if (accessTokenExpired && refreshTokenExpired) {
         return "unauthenticated";
      }

      if (accessTokenExpired) {
         refreshTokenAction();
         return "refreshing";
      }

      return "authenticated";
   };

   // SIGN IN HANDLERS

   signInErrorHandler = (_error: any) => {
      showNotify("error", {
         message: i18next.t("retry_later_error")
      });
   };

   signInSuccessHandler = async (data: any) => {
      logger.info("signInSuccessHandler", data);
   };

   // REGISTER HANDLERS

   registerSuccessHandler = async (data: any) => {
      logger.info("registerSuccessHandler", data);
   };

   registerErrorHandler = (_error: any) => {
      showNotify("error", { message: i18n.t("register_error") });
   };

   // LOGOUT HANDLERS

   logoutSuccessHandler = async (_data: any) => {
      this.fullClear();
   };

   logoutErrorHandler = (error: any) => {
      logger.error("logoutErrorHandler", error);
   };

   // REFRESH TOKEN HANDLERS

   refreshTokenSuccessHandler = async (_data: any) => {
      logger.info("refreshTokenSuccessHandler", _data);
   };

   refreshTokenErrorHandler = (error: any) => {
      logger.error("refreshTokenErrorHandler", error);
   };
}

export const authServiceStore = new AuthServiceStore();