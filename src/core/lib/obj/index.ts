/**
 * Extracts data from object by specified path
 * @param obj - object to extract data from
 * @param path - path in "key1.key2.key3" format
 * @returns extracted data or entire object if path not specified
 */
export function extractDataByPath(obj: any, path?: string): any {
	if (!path || !obj) {
		return obj;
	}

	const keys = path.split('.');
	let result = obj;

	for (const key of keys) {
		if (result && typeof result === 'object' && key in result) {
			result = result?.[key] || null;
		} else {
			console.warn(`[extractDataByPath] Path "${path}" not found in object, returning original object`);
			return obj;
		}
	}

	console.log(`[extractDataByPath] ✅ Data extracted by path "${path}"`, {
		extractedKeys: typeof result === 'object' ? Object.keys(result).slice(0, 5) : 'not object'
	});

	return result;
}

export function findArrayKeysDeep(obj: any, result = {} as any) {
	if (obj && typeof obj === "object") {
		for (const [key, value] of Object.entries(obj)) {
			if (Array.isArray(value)) {
				result[key] = { length: value.length };
			}

			if (value && typeof value === "object") {
				findArrayKeysDeep(value, result);
			}
		}
	}

	return result;
}
