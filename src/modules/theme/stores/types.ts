import { CSSProperties } from 'react';

export interface ThemeT {
   bg_000: string;
   bg_100: string;
   bg_200: string;
   bg_300: string;
   bg_400: string;
   bg_500: string;
   bg_600: string;

   border_100: string;
   border_200: string;
   border_300: string;
   border_400: string;
   border_500: string;
   border_600: string;

   radius_100: string | number;
   radius_200: string | number;
   radius_300: string | number;
   radius_400: string | number;
   radius_500: string | number;
   radius_600: string | number;

   btn_bg_000: string;
   btn_bg_100: string;
   btn_bg_200: string;
   btn_bg_300: string;
   btn_bg_400: string;
   btn_bg_500: string;
   btn_bg_600: string;

   btn_height_100: string | number;
   btn_height_200: string | number;
   btn_height_300: string | number;
   btn_height_400: string | number;
   btn_height_500: string | number;
   btn_height_600: string | number;

   btn_radius_000: string | number;
   btn_radius_100: string | number;
   btn_radius_200: string | number;
   btn_radius_300: string | number;

   primary_100: string;
   primary_200: string;
   primary_300: string;

   success_100: string;
   success_200: string;
   success_300: string;

   error_100: string;
   error_200: string;
   error_300: string;

   text_100: string;
   secondary_100: string;

   input_bg_100: string;
   input_bg_200: string;
   input_bg_300: string;
   input_border_300: string;
   input_height_300: string | number;
   input_radius_300: string | number;

   mainGradientColor: CSSProperties;
}

export interface ThemeListT {
   colors: ThemeT;
   title: string;
   isPremium: boolean;
}

export interface EditThemeObjT {
   name: string;
}

export interface RgbaColor {
   a: number;
   r: number;
   g: number;
   b: number;
}