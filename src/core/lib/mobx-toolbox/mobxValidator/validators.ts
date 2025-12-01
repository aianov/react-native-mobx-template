import { SchemaOptions, Validator } from './types';

export class ValidatorBuilder {
	private validator: Validator[] = [];

	/**
	 * Specifies that this field is required.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .required({ message: "This field is required." })
	 * 
	 * @param options - { message: "Err message" }
	 */
	required(options?: SchemaOptions): this {
		this.validator.push((value) => value ? true : options?.message || "This field is required.");
		return this;
	}

	/**
	 * Checks that value is a string.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .string({ message: "Value must be string" })
	 * 
	 * @param options - { message: "Err message" }
	 */
	string(options?: SchemaOptions): this {
		this.validator.push((value) => typeof value === 'string' ? true : options?.message || "Must be a string.");
		return this;
	}

	/**
	 * Checks minimum string length.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .minLength(5, { message: "Minimum length is 5 characters." })
	 * 
	 * @param min - Minimum length
	 * @param options - { message: "Err message" }
	 */
	minLength(min: number, options?: SchemaOptions): this {
		this.validator.push((value) =>
			value.length >= min ? true : options?.message || `Must be at least ${min} characters long.`);
		return this;
	}

	/**
	 * Checks maximum string length.
	 * 
	 * @example
	 * .maxLength(5, { message: "Maximum length is 5 characters." })
	 * 
	 * @param max - Maximum length
	 * @param options - { message: "Err message" }
	 */
	maxLength(max: number, options?: SchemaOptions): this {
		this.validator.push((value) =>
			value.length <= max ? true : options?.message || `Must not exceed ${max} characters.`);
		return this;
	}

	/**
	 * Checks that value matches specified field.
	 *
	 * @example
	 * .matchField('password', { message: "Passwords do not match." })
	 *
	 * @param field - Field name to compare
	 * @param options - { message: "Err message" }
	 */
	matchField(field: string, options?: SchemaOptions): this {
		this.validator.push((value: any, allValues?: Record<string, any>) => {
			if (!allValues) {
				throw new Error("All values are required for matchField validation.");
			}
			return value === allValues[field]
				? true
				: options?.message || `Value must match ${field}.`;
		});
		return this;
	}


	/**
	 * Checks if value matches given regular expression.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .regex(/^[a-z]+$/, { message: "Must match the pattern." })
	 * 
	 * @param pattern - Regular expression
	 * @param options - { message: "Err message" }
	 */
	regex(pattern: RegExp, options?: SchemaOptions): this {
		this.validator.push((value) =>
			pattern.test(value) ? true : options?.message || "Does not match the required pattern."
		);
		return this;
	}

	/**
	 * Checks if value is a valid email address.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .email({ message: "Must be a valid email address." })
	 * 
	 * @param options - { message: "Err message" }
	 */
	email(options?: SchemaOptions): this {
		this.validator.push((value) =>
			typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
				? true
				: options?.message || "Must be a valid email address."
		);
		return this;
	}

	/**
	 * Checks if value is a valid URL.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .url({ message: "Must be a valid URL." })
	 * 
	 * @param options - { message: "Err message" }
	 */
	url(options?: SchemaOptions): this {
		this.validator.push((value) =>
			typeof value === 'string' && /^(ftp|http|https):\/\/[^ "]+$/.test(value)
				? true
				: options?.message || "Must be a valid URL."
		);
		return this;
	}

	// ========================== NUM VALIDATIONS ==============================

	/**
	 * Checks that value is not less than specified.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .minValue(10, { message: "Value must be at least 10." })
	 * 
	 * @param min - Minimum value
	 * @param options - { message: "Err message" }
	 */
	minValue(min: number, options?: SchemaOptions): this {
		this.validator.push((value) =>
			typeof value === 'number' && value >= min
				? true
				: options?.message || `Must be at least ${min}.`
		);
		return this;
	}

	/**
	 * Checks that value is not greater than specified.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .maxValue(100, { message: "Value must be no more than 100." })
	 * 
	 * @param max - Maximum value
	 * @param options - { message: "Err message" }
	 */
	maxValue(max: number, options?: SchemaOptions): this {
		this.validator.push((value) =>
			typeof value === 'number' && value <= max
				? true
				: options?.message || `Must be no more than ${max}.`
		);
		return this;
	}

	/**
	 * Checks that value equals specified value.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .equal("value", { message: "Values must be equal." })
	 * 
	 * @param compareValue - Value to compare
	 * @param options - { message: "Err message" }
	 */
	equal(compareValue: any, options?: SchemaOptions): this {
		this.validator.push((value) =>
			value === compareValue ? true : options?.message || "Values must be equal."
		);
		return this;
	}

	/**
	 * Checks that value is a big integer (bigint).
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .bigint({ message: "Must be a big integer." })
	 * 
	 * @param options - { message: "Err message" }
	 */
	bigint(options?: SchemaOptions): this {
		this.validator.push((value) =>
			typeof value === 'bigint' ? true : options?.message || "Must be a big integer."
		);
		return this;
	}

	/**
	 * Checks that value is an integer.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .int({ message: "Must be an integer." })
	 * 
	 * @param options - { message: "Err message" }
	 */
	int(options?: SchemaOptions): this {
		this.validator.push((value) =>
			Number.isInteger(value) ? true : options?.message || "Must be an integer."
		);
		return this;
	}

	/**
	 * Checks that value is a floating point number (float).
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .float({ message: "Must be a valid number." })
	 * 
	 * @param options - { message: "Err message" }
	 */
	float(options?: SchemaOptions): this {
		this.validator.push((value) =>
			typeof value === 'number' && !Number.isNaN(value) ? true : options?.message || "Must be a valid number."
		);
		return this;
	}

	// ========================== DATE VALIDATIONS ==============================

	/**
	 * Checks that value equals specified date.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .dateEqual(new Date('2023-01-01'), { message: "Dates must be equal." })
	 * 
	 * @param compareDate - Date to compare
	 * @param options - { message: "Err message" }
	 */
	dateEqual(compareDate: Date, options?: SchemaOptions): this {
		this.validator.push((value) => {
			const date = new Date(value);
			return date.getTime() === compareDate.getTime()
				? true
				: options?.message || "Dates must be equal.";
		});
		return this;
	}

	/**
	 * Checks that value is a valid date.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .isDate({ message: "Must be a valid date." })
	 * 
	 * @param options - { message: "Err message" }
	 */
	isDate(options?: SchemaOptions): this {
		this.validator.push((value) => {
			const date = new Date(value);
			return !isNaN(date.getTime()) ? true : options?.message || "Must be a valid date.";
		});
		return this;
	}

	/**
	 * Checks that date is in the past.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .isPast({ message: "Date must be in the past." })
	 * 
	 * @param options - { message: "Err message" }
	 */
	isPast(options?: SchemaOptions): this {
		this.validator.push((value) => {
			const date = new Date(value);
			return date < new Date() ? true : options?.message || "Date must be in the past.";
		});
		return this;
	}

	/**
	 * Checks that date is in the future.
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 * @example
	 * .isFuture({ message: "Date must be in the future." })
	 * 
	 * @param options - { message: "Err message" }
	 */
	isFuture(options?: SchemaOptions): this {
		this.validator.push((value) => {
			const date = new Date(value);
			return date > new Date() ? true : options?.message || "Date must be in the future.";
		});
		return this;
	}

	// ========= BUILDER REQUIRED ============

	/**
	 * Required at the end of each schema key!
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 */
	build(): Validator[] {
		return this.validator;
	}

	/**
	 * Must always be at the beginning of key validations in schema!
	 * 
	 * Telegram: https://t.me/nics51
	 * 
	 */
	reset(): this {
		this.validator = [];
		return this;
	}
}