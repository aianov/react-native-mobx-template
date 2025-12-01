import { ValidationResult, Validator } from './types';
import { ValidatorBuilder } from './validators';


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


/**
 * From this function you can create schemas and validations :)
 * 
 * Telegram: https://t.me/nics51
 * 
 * @example
 * export const signScheme = m.scheme({
 * 	email: m.reset()
 * 		.required()
 * 		.build()
 * })
 *
 */
export const m = new ValidationSchema();