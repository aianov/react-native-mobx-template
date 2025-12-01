import { makeAutoObservable } from 'mobx';
import { FormErrors, FormStateOptions, FormValues, ValidationResult, Validator } from '../mobxValidator/types';
import { ValidatorBuilder } from '../mobxValidator/validators';

class ValidationSchema extends ValidatorBuilder {
	validators: Record<string, Validator[]> = {};

	/**
 * Used for validating your input keys.
 * 
 * Telegram: https://t.me/nics51
 *
 * @example
 * // Create schema
 * export const orderFormSchema = m.schema({
 * 	name: m.reset()
 * 		.required()
 * 		.string()
 * 		.minLength(3, { message: 'Name must be at least 3 characters long' })
 * 		.build(),
 * 	description: m.reset()
 * 		.required({ message: 'Please provide a description' })
 * 		.string()
 * 		.minLength(10)
 * 		.build()
 * })
 * 
 * Schema can be reused and is used for useMobxForm function
 *
 * @param object - describe validation settings here, don't forget to write .build() at the end
 * 
 */
	schema(validators: Record<string, Validator[]>): ValidationSchema {
		const schema = new ValidationSchema();
		schema.validators = validators;
		return schema;
	}

	/**
	  * Adds new validators to existing schema.
	  * 
	  * Telegram: https://t.me/nics51 
	  * 
	  * @example
	  * export const newScheme = signScheme.extend({
	  * 	newKey: // your new validations + signScheme validations
	  * })
	  * 
	  * Also second parameter is override which defaults to false.
	  * If override is true then old key from parent will be deleted and replaced with new key if they have same name.
	  * If override is false then validators in new and old key will be merged.
	  * 
	  * @param newValidators - new set of validators to add
	  * @param override - if true, overrides existing validators
	  * @returns {ValidationSchema} - updated schema
	  * 
	  */
	extend(newValidators: Record<string, Validator[]>, override: boolean = false): ValidationSchema {
		for (const field in newValidators) {
			if (override || !this.validators[field]) this.validators[field] = newValidators[field];
			else this.validators[field] = this.validators[field].concat(newValidators[field]);
		}
		return this;
	}

	/**
	  * Picks only specific keys from schema
	  * 
	  * Telegram: https://t.me/nics51 
	  * 
	  * @param keys - array of keys to pick from schema
	  * @returns {ValidationSchema} - new schema with picked keys
	  * 
	  */
	pick(keys: string[]): ValidationSchema {
		const pickedValidators: Record<string, Validator[]> = {};

		for (const key of keys) {
			if (this.validators[key]) {
				pickedValidators[key] = this.validators[key];
			}
		}

		return this.schema(pickedValidators);
	}

	validate(values: Record<string, any>): ValidationResult {
		const errors: Record<string, string> = {};
		let success = true;

		for (const field in this.validators) {
			const validators = this.validators[field];
			for (const validate of validators) {
				const validationResult = validate(values[field], values);
				if (validationResult !== true) {
					success = false;
					errors[field + 'Err'] = typeof validationResult === 'string'
						? validationResult
						: `Invalid value for ${field}`;
					break;
				}
			}
		}

		return { success, errors };
	}
}


const formStateDefaultOptions = {
	instaValidate: true,
	inputResetErr: true,
	validateAllOnChange: false,
	resetErrIfNoValue: true,
	disabled: false,
	observableAnnotations: {},
	observableOptions: {}
};

class FormState<T> {
	values: FormValues<T>;
	errors: FormErrors<T> = {} as FormErrors<T>;
	validationSchema: ValidationSchema;
	options: Partial<FormStateOptions> = { instaValidate: true, validateAllOnChange: false, inputResetErr: true };
	initialValues: FormValues<T>;
	disabled: boolean = true;

	constructor(
		initialValues: FormValues<T>,
		validationSchema: ValidationSchema,
		options: FormStateOptions
	) {
		this.initialValues = initialValues;
		this.values = initialValues;
		this.validationSchema = validationSchema;
		this.options = { ...formStateDefaultOptions, ...options };

		if (options.disabled) this.disabled = options.disabled;

		makeAutoObservable(this, options.observableAnnotations || {}, options.observableOptions || {});
	}

	/**
 * Values setter
 * 
 * Telegram: https://t.me/nics51
 *
 */
	setValue = (field: string, value: T[keyof T]) => {
		this.values[field as keyof T] = value;

		// @ts-ignore
		if (this.options.inputResetErr) this.errors[`${field}Err`] = '';

		if (this.options.instaValidate) {
			const error = this.validationSchema.validate(this.values);
			this.disabled = !error.success;

			if (this.options.validateAllOnChange) {
				this.errors = error.errors as FormErrors<T>;
			} else {
				// @ts-ignore
				this.errors[field + 'Err'] = error.errors[field + 'Err'] || '';
			}
		} else if (value == '' && this.options.resetErrIfNoValue) {
			// @ts-ignore
			this.errors[field + 'Err'] = '';
		}
	};

	/**
 * Errors setter
 * 
 * Telegram: https://t.me/nics51
 *
 */
	setError(field: keyof T, error: string) {
		// @ts-ignore
		this.errors[`${field}Err`] = error || '';

		const ifNoErrors = Object.values(this.errors).every(error => error === '');

		this.disabled = !ifNoErrors;
	}

	/**
 * Returns all inputs to initial state
 * 
 * Telegram: https://t.me/nics51
 *
 */
	reset() {
		this.values = { ...this.initialValues };
		this.errors = {} as FormErrors<T>;
	}

	/**
 * Handles key validation, writes errors to errors, returns true or false if validation has errors or not
 * 
 * Telegram: https://t.me/nics51
 *
 * @example
 * this.orderForm.validate() // true | false if validation successful
 *
 * @param none - No parameters
 * 
 */
	validate(): boolean {
		const result: ValidationResult = this.validationSchema.validate(this.values);
		if (!result.success) this.errors = result.errors as FormErrors<T>;
		else this.errors = {} as FormErrors<T>;

		this.disabled = !result.success;

		return result.success;
	}
}

/**
 * Creates object with all necessary settings for form, inputs and errors management.
 * 
 * Telegram: https://t.me/nics51
 *
 * @example
 * // Create form
 * orderForm = useMobxForm({
 * 	name: '',
 * 	description: '',
 * },
 * 	orderFormSchema,
 * 	{ instaValidate: true, inputResetErr: true }
 * );
 * 
 * Now you can get in component:
 * const {
 * 	orderForm: {
 * 		setValue,
 * 		values: { name, description },
 * 		errors: { nameErr, descriptionErr }
 * 	}
 * } = orderStore
 *
 * @param initialValues - object with keys for inputs
 * @param schema - schema object with validation settings
 * @param options - additional options for form and makeAutoObservable
 * 
 * `instaValidate` handles instant validation on input typing, default true
 * 
 * `inputResetErr` handles instant error clearing on input typing, default true
 * 
 * `validateAllOnChange` works only if instaValidate is true, validates all inputs even if user types in one, default false
 * 
 * `resetErrIfNoValue` clears error if input is empty, default true
 * 
 * `observableAnnotations` - annotations for makeAutoObservable
 * 
 * `observableOptions` - options for makeAutoObservable
 * 
 */
export function useMobxForm<T>(
	initialValues: FormValues<T>,
	validationSchema: ValidationSchema,
	options: Partial<FormStateOptions> = {
		instaValidate: true,
		inputResetErr: true,
		validateAllOnChange: false,
		resetErrIfNoValue: true,
		disabled: false,
		observableAnnotations: {},
		observableOptions: {}
	},
) {
	return new FormState<T>(initialValues, validationSchema, options);
}
