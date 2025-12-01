/**
 * Array prototype extension to add insert method
 * Inserts element into array at specified index
 */
declare global {
	interface Array<T> {
		/**
		 * Inserts element into array at specified index
		 *
		 * @param index - index where to insert element
		 * @param value - value to insert
		 * @returns new array with inserted element (immutable approach)
		 */
		insert(index: number, value: T): T[];

		/**
		 * Replaces element in array at specified index
		 *
		 * @param index - index of element to replace
		 * @param value - new value for replacement
		 * @returns new array with replaced element (immutable approach)
		 */
		replaceAt(index: number, value: T): T[];
	}
}

if (!Array.prototype.insert) {
	Array.prototype.insert = function <T>(index: number, value: T): T[] {
		if (index < 0 || index > this.length) {
			throw new Error('Index out of bounds');
		}

		return [
			...this.slice(0, index),
			value,
			...this.slice(index)
		];
	};
}

if (!Array.prototype.replaceAt) {
	Array.prototype.replaceAt = function <T>(index: number, value: T): T[] {
		if (index < 0 || index >= this.length) {
			throw new Error('Index out of bounds');
		}

		return [
			...this.slice(0, index),
			value,
			...this.slice(index + 1)
		];
	};
}

export { };

