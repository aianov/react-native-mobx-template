import { mobxState } from '@lib/mobx-toolbox';
import { action, makeAutoObservable, toJS } from 'mobx';
import { RgbaColor, ThemeT } from '../types';

class ThemeStore {
   constructor() {
      const defaultThemeBase = {
         bg_000: "rgba(255, 255, 255, 1)",
         bg_100: "rgba(250, 250, 250, 1)",
         bg_200: "rgba(245, 245, 245, 1)",
         bg_300: "rgba(240, 240, 240, 1)",
         bg_400: "rgba(235, 235, 235, 1)",
         bg_500: "rgba(230, 230, 230, 1)",
         bg_600: "rgba(225, 225, 225, 1)",

         border_100: "1px solid rgba(230, 230, 230, 1)",
         border_200: "1px solid rgba(220, 220, 220, 1)",
         border_300: "1px solid rgba(210, 210, 210, 1)",
         border_400: "1px solid rgba(200, 200, 200, 1)",
         border_500: "1px solid rgba(190, 190, 190, 1)",
         border_600: "1px solid rgba(180, 180, 180, 1)",

         radius_100: "20px",
         radius_200: "15px",
         radius_300: "10px",
         radius_400: "30px",
         radius_500: "40px",
         radius_600: "50px",

         btn_bg_000: "rgba(255, 255, 255, 1)",
         btn_bg_100: "rgba(250, 250, 250, 1)",
         btn_bg_200: "rgba(245, 245, 245, 1)",
         btn_bg_300: "rgba(240, 240, 240, 1)",
         btn_bg_400: "rgba(235, 235, 235, 1)",
         btn_bg_500: "rgba(230, 230, 230, 1)",
         btn_bg_600: "rgba(225, 225, 225, 1)",

         btn_height_100: "55px",
         btn_height_200: "50px",
         btn_height_300: "45px",
         btn_height_400: "40px",
         btn_height_500: "35px",
         btn_height_600: "30px",

         btn_radius_000: "10px",
         btn_radius_100: "20px",
         btn_radius_200: "30px",
         btn_radius_300: "40px",

         primary_100: "rgba(59, 130, 246, 1)",
         primary_200: "rgba(37, 99, 235, 1)",
         primary_300: "rgba(29, 78, 216, 1)",

         success_100: "rgba(34, 197, 94, 1)",
         success_200: "rgba(22, 163, 74, 1)",
         success_300: "rgba(21, 128, 61, 1)",

         error_100: "rgba(239, 68, 68, 1)",
         error_200: "rgba(220, 38, 38, 1)",
         error_300: "rgba(185, 28, 28, 1)",

         text_100: "rgba(23, 23, 23, 1)",
         secondary_100: "rgba(115, 115, 115, 1)",

         input_bg_100: "rgba(250, 250, 250, 1)",
         input_bg_200: "rgba(245, 245, 245, 1)",
         input_bg_300: "rgba(240, 240, 240, 1)",
         input_border_300: "rgba(212, 212, 212, 1)",
         input_height_300: "45px",
         input_radius_300: "10px",

         mainGradientColor: {
            background: 'linear-gradient(to right, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 50%, rgba(29, 78, 216, 1) 100%)'
         },
      };

      this.defaultTheme = this.changeToNativeThemeFormat(defaultThemeBase);

      const processedTheme = this.changeToNativeThemeFormat(defaultThemeBase);
      Object.keys(processedTheme).forEach(key => {
         (this as any)[`_${key}`] = processedTheme[key as keyof ThemeT];
      });

      makeAutoObservable(this, {
         setBRadius: action,
         changeTheme: action,
         setBgPreview: action,
         setMyCommentBgPreview: action,
         setBtnsBgPreview: action,
         setMainColorPreview: action,
         setSecondaryColorPreview: action,
         setBRadiusPreview: action,
         currentTheme: false,
      }, { deep: false });
   }

   safeAreaWithContentHeight = mobxState(0)("safeAreaWithContentHeight");
   defaultTheme: ThemeT;
   currentThemeObj: ThemeT | undefined;
   mainBottomNavigationHeight = 45;
   groupedBtnsHeight = 52.5;

   _bg_000 = "rgba(255, 255, 255, 1)";
   _bg_100 = "rgba(250, 250, 250, 1)";
   _bg_200 = "rgba(245, 245, 245, 1)";
   _bg_300 = "rgba(240, 240, 240, 1)";
   _bg_400 = "rgba(235, 235, 235, 1)";
   _bg_500 = "rgba(230, 230, 230, 1)";
   _bg_600 = "rgba(225, 225, 225, 1)";

   _border_100 = "rgba(230, 230, 230, 1)";
   _border_200 = "rgba(220, 220, 220, 1)";
   _border_300 = "rgba(210, 210, 210, 1)";
   _border_400 = "rgba(200, 200, 200, 1)";
   _border_500 = "rgba(190, 190, 190, 1)";
   _border_600 = "rgba(180, 180, 180, 1)";

   _radius_100 = 20;
   _radius_200 = 15;
   _radius_300 = 10;
   _radius_400 = 30;
   _radius_500 = 40;
   _radius_600 = 50;

   _btn_bg_000 = "rgba(255, 255, 255, 1)";
   _btn_bg_100 = "rgba(250, 250, 250, 1)";
   _btn_bg_200 = "rgba(245, 245, 245, 1)";
   _btn_bg_300 = "rgba(240, 240, 240, 1)";
   _btn_bg_400 = "rgba(235, 235, 235, 1)";
   _btn_bg_500 = "rgba(230, 230, 230, 1)";
   _btn_bg_600 = "rgba(225, 225, 225, 1)";

   _btn_height_100 = 55;
   _btn_height_200 = 50;
   _btn_height_300 = 45;
   _btn_height_400 = 40;
   _btn_height_500 = 35;
   _btn_height_600 = 30;

   _btn_radius_000 = 10;
   _btn_radius_100 = 20;
   _btn_radius_200 = 30;
   _btn_radius_300 = 40;

   _primary_100 = "rgba(59, 130, 246, 1)";
   _primary_200 = "rgba(37, 99, 235, 1)";
   _primary_300 = "rgba(29, 78, 216, 1)";

   _success_100 = "rgba(34, 197, 94, 1)";
   _success_200 = "rgba(22, 163, 74, 1)";
   _success_300 = "rgba(21, 128, 61, 1)";

   _error_100 = "rgba(239, 68, 68, 1)";
   _error_200 = "rgba(220, 38, 38, 1)";
   _error_300 = "rgba(185, 28, 28, 1)";

   _text_100 = "rgba(23, 23, 23, 1)";
   _secondary_100 = "rgba(115, 115, 115, 1)";

   _input_bg_100 = "rgba(250, 250, 250, 1)";
   _input_bg_200 = "rgba(245, 245, 245, 1)";
   _input_bg_300 = "rgba(240, 240, 240, 1)";
   _input_border_300 = "rgba(212, 212, 212, 1)";
   _input_height_300 = 45;
   _input_radius_300 = 10;

   _mainGradientColor = {
      background: 'linear-gradient(to right, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 50%, rgba(29, 78, 216, 1) 100%)'
   };

   get currentTheme(): ThemeT {
      return {
         bg_000: this._bg_000,
         bg_100: this._bg_100,
         bg_200: this._bg_200,
         bg_300: this._bg_300,
         bg_400: this._bg_400,
         bg_500: this._bg_500,
         bg_600: this._bg_600,
         border_100: this._border_100,
         border_200: this._border_200,
         border_300: this._border_300,
         border_400: this._border_400,
         border_500: this._border_500,
         border_600: this._border_600,
         radius_100: this._radius_100,
         radius_200: this._radius_200,
         radius_300: this._radius_300,
         radius_400: this._radius_400,
         radius_500: this._radius_500,
         radius_600: this._radius_600,
         btn_bg_000: this._btn_bg_000,
         btn_bg_100: this._btn_bg_100,
         btn_bg_200: this._btn_bg_200,
         btn_bg_300: this._btn_bg_300,
         btn_bg_400: this._btn_bg_400,
         btn_bg_500: this._btn_bg_500,
         btn_bg_600: this._btn_bg_600,
         btn_height_100: this._btn_height_100,
         btn_height_200: this._btn_height_200,
         btn_height_300: this._btn_height_300,
         btn_height_400: this._btn_height_400,
         btn_height_500: this._btn_height_500,
         btn_height_600: this._btn_height_600,
         btn_radius_000: this._btn_radius_000,
         btn_radius_100: this._btn_radius_100,
         btn_radius_200: this._btn_radius_200,
         btn_radius_300: this._btn_radius_300,
         primary_100: this._primary_100,
         primary_200: this._primary_200,
         primary_300: this._primary_300,
         success_100: this._success_100,
         success_200: this._success_200,
         success_300: this._success_300,
         error_100: this._error_100,
         error_200: this._error_200,
         error_300: this._error_300,
         text_100: this._text_100,
         secondary_100: this._secondary_100,
         input_bg_100: this._input_bg_100,
         input_bg_200: this._input_bg_200,
         input_bg_300: this._input_bg_300,
         input_border_300: this._input_border_300,
         input_height_300: this._input_height_300,
         input_radius_300: this._input_radius_300,
         mainGradientColor: this._mainGradientColor,
      };
   }

   getBlurViewBgColor = () => this._bg_100;

   changeToNativeThemeFormat = (theme: ThemeT) => {
      const processThemeObject = (obj: any) => {
         const newObj = { ...obj };

         if (newObj.border) {
            console.log(newObj.border);
            const borderParts = newObj.border.split(' ');
            const borderColor = borderParts.slice(2).join(" ");

            if (borderParts[0]) {
               newObj.borderWidth = Number(borderParts[0].replace('px', ''));
            }

            if (borderColor) newObj.borderColor = borderColor;

            delete newObj.border;
         }

         Object.keys(newObj).forEach(key => {
            if (key === 'height' || key === 'borderRadius') {
               if (typeof newObj[key] === 'string' && newObj[key].includes('px')) {
                  newObj[key] = Number(newObj[key].replace('px', ''));
               }
            }
         });

         Object.keys(newObj).forEach(key => {
            if (typeof newObj[key] === 'object' && newObj[key] !== null) {
               newObj[key] = processThemeObject(newObj[key]);
            }
         });

         return newObj;
      };

      return processThemeObject({ ...theme });
   };

   setBRadius = (radius: string) => {
      if (radius.length > 3) return;
   };

   changeTheme = (colors: ThemeT) => {
      colors = toJS(colors);
      Object.keys(colors).forEach(key => {
         const fieldKey = `_${key}` as keyof this;
         if (fieldKey in this) {
            (this as any)[fieldKey] = colors[key as keyof ThemeT];
         }
      });
   };

   // PREVIEW MODE EDITING THEME

   setBgPreview = (e: RgbaColor) => {
      if (!this.currentThemeObj) return;
   };

   setMyCommentBgPreview = (e: RgbaColor) => {
      if (!this.currentThemeObj) return;
   };

   setBtnsBgPreview = (e: RgbaColor) => {
      if (!this.currentThemeObj) return;
   };

   setMainColorPreview = (e: RgbaColor) => {
      if (!this.currentThemeObj) return;
   };

   setSecondaryColorPreview = (e: RgbaColor) => {
      if (!this.currentThemeObj) return;
   };

   setBRadiusPreview = (radius: string) => {
      if (!this.currentThemeObj) return;
      if (radius.length > 3) return;
   };

   setThemeValue = (key: keyof ThemeT, value: any) => {
      const fieldKey = `_${key}` as keyof this;
      if (fieldKey in this) {
         (this as any)[fieldKey] = value;
      }
   };

   setCurrentTheme = (theme: ThemeT) => {
      Object.keys(theme).forEach(key => {
         const fieldKey = `_${key}` as keyof this;
         if (fieldKey in this) {
            (this as any)[fieldKey] = theme[key as keyof ThemeT];
         }
      });
   };
   setCurrentThemeObj = (theme: ThemeT) => this.currentThemeObj = toJS(theme);
}

export const themeStore = new ThemeStore;
