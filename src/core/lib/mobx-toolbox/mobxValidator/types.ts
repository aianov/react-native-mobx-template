import { AnnotationsMap } from 'mobx';
import { MakeObservableOptions } from '../mobxState/types';

export type Validator = (value: any, allValues?: Record<string, any>) => true | string;
export type FormValues<T> = { [K in keyof T]: T[K] };
export type FormErrors<T> = { [K in keyof T]: string } & { [K in keyof T as `${K & string}Err`]: string };
export interface SchemaOptions { message?: string; }
export type ValidationResult = { success: boolean; errors: Record<string, string>; };
export interface FormStateOptions {
	instaValidate?: boolean;
	inputResetErr?: boolean;
	validateAllOnChange?: boolean;
	resetErrIfNoValue?: boolean;
	disabled?: boolean;
	observableAnnotations?: AnnotationsMap<{ [key: string]: any; }, never>;
	observableOptions?: MakeObservableOptions;
}