import { AnnotationsMap, makeAutoObservable } from 'mobx';
import { saiLocalCacheUpdater, saiLocalStorageUpdater } from '../mobxSaiFetch';

export type Identifiable = { id: string | number; };
type PrevDepth<D extends number> = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10][D];
export type AnyNestedKeyOf<T, Depth extends number = 5> = NestedKeyOf<T, Depth> | string;
export type NestedKeyOf<T, Depth extends number = 5> = [Depth] extends [never]
	? never
	: T extends object
	? {
		[K in keyof T]: K extends string | number
		? T[K] extends (infer U)[]
		? `${K}` | `${K}[${number}]` | `${K}[${number}].${NestedKeyOf<U, PrevDepth<Depth>>}`
		: `${K}` | `${K}.${NestedKeyOf<T[K], PrevDepth<Depth>>}`
		: never
	}[keyof T]
	: never;

export type GetTypeFromKey<T, K extends AnyNestedKeyOf<T>> =
	K extends `${infer Key}.${infer Rest}`
	? Key extends keyof T
	? Rest extends NestedKeyOf<T[Key]>
	? GetTypeFromKey<T[Key], Rest>
	: T[Key]
	: any
	: K extends `${infer Key}[${infer _Index}].${infer Rest}`
	? Key extends keyof T
	? T[Key] extends (infer U)[]
	? Rest extends NestedKeyOf<U>
	? GetTypeFromKey<U, Rest>
	: U
	: any
	: any
	: K extends `${infer Key}[${infer _Index}]`
	? Key extends keyof T
	? T[Key] extends (infer U)[]
	? U
	: any
	: any
	: K extends keyof T
	? T[K]
	: any;

export type UpdaterT<T, K extends AnyNestedKeyOf<T>> =
	| ((prevValue: GetTypeFromKey<T, K>) => GetTypeFromKey<T, K>)
	| GetTypeFromKey<T, K>;

export type UpdateCache = 'localStorage' | 'localCache' | "both";

export type MobxUpdateInstance<T extends Identifiable = any> = <K extends NestedKeyOf<T>>(
	id: string | number,
	key: K,
	updater: UpdaterT<T, K>,
	idKey?: string,
	cacheId?: string,
	updateCache?: UpdateCache
) => void;

export class MobxUpdater {
	constructor(annotations: AnnotationsMap<{ [key: string]: any; }, never> = {}) {
		makeAutoObservable(this, annotations, { autoBind: true });
	}

	/** 
	 * Method to get update function for array or object
	 *
	 * @param arrayOrObject - Array or object to update.
	 * @returns Function for state update.
	 */
	getUpdater<T extends Identifiable>(arrayOrObject: T[] | Record<string, T>) {
		return <K extends NestedKeyOf<T>>(
			id: string | number,
			key: K,
			updater: UpdaterT<T, K>
		) => {
			this.updateState(arrayOrObject, id, key, updater);
		};
	}

	/** 
	 * Method for updating element state in array or object.
	 *
	 * @param arrayOrObject - Array or object to update.
	 * @param id - Element identifier to update.
	 * @param key - Key or path for update.
	 * @param updater - Update function or new value for update.
	 */
	updateState<T extends Identifiable, K extends NestedKeyOf<T>>(
		arrayOrObject: T[] | Record<string, T>,
		id: string | number,
		key: K,
		updater: UpdaterT<T, K>,
		idKey?: string,
		cacheId?: string,
		updateCache?: UpdateCache
	) {
		const item = Array.isArray(arrayOrObject)
			? arrayOrObject.find((item) => (item as any)?.[idKey || 'id'] === id)
			: arrayOrObject[id];

		if (item) this.deepUpdate(item, key, updater, cacheId, updateCache);
	}

	/**
	 * Helper method for deep update by path.
	 * If path or key doesn't exist, they will be created.
	 *
	 * @param obj - Object to perform update on.
	 * @param key - Path or key for update.
	 * @param updater - Function or new value for update.
	 */
	private deepUpdate<T, K extends NestedKeyOf<T>>(
		obj: T,
		key: K,
		updater: UpdaterT<T, K>,
		cacheId?: string,
		updateCache?: UpdateCache
	) {
		const keys = key.split(".") as string[];
		const lastKey = keys.pop() as string;

		const target = keys.reduce((acc, k) => {
			if (k.includes("[")) {
				const [arrayKey, index] = k.split(/\[|\]/).filter(Boolean);
				if (!acc[arrayKey]) acc[arrayKey] = [];
				if (!acc[arrayKey][Number(index)]) acc[arrayKey][Number(index)] = {};
				return acc[arrayKey][Number(index)];
			}
			if (!acc[k]) acc[k] = {};
			return acc[k];
		}, obj as any);

		if (target && lastKey) {
			if (typeof updater === "function") {
				const prevValue = target[lastKey as keyof typeof target];
				target[lastKey as keyof typeof target] = (updater as (prevValue: any) => any)(prevValue);
			} else target[lastKey as keyof typeof target] = updater;
		}

		if (cacheId && (updateCache === "localStorage" || updateCache === "both")) {
			saiLocalStorageUpdater(cacheId, (currentCache: any) => {
				if (!currentCache) return obj;

				this.applyCacheUpdate(currentCache, obj as any, key);
				return currentCache;
			});
		}

		if (cacheId && (updateCache === "localCache" || updateCache === "both")) {
			saiLocalCacheUpdater(cacheId, (currentCache: any) => {
				if (!currentCache) return obj;

				this.applyCacheUpdate(currentCache, obj as any, key);
				return currentCache;
			});
		}
	}

	/**
	 * Helper method to apply the same update to cache object
	 * @param cacheObj - Cache object to update
	 * @param sourceObj - Source object with updated value
	 * @param key - Path that was updated
	 */
	private applyCacheUpdate<T>(cacheObj: any, sourceObj: T, key: string) {
		const keys = key.split(".") as string[];
		const lastKey = keys.pop() as string;

		const cacheTarget = keys.reduce((acc, k) => {
			if (k.includes("[")) {
				const [arrayKey, index] = k.split(/\[|\]/).filter(Boolean);
				if (!acc[arrayKey]) acc[arrayKey] = [];
				if (!acc[arrayKey][Number(index)]) acc[arrayKey][Number(index)] = {};
				return acc[arrayKey][Number(index)];
			}
			if (!acc[k]) acc[k] = {};
			return acc[k];
		}, cacheObj as any);

		const sourceTarget = keys.reduce((acc, k) => {
			if (k.includes("[")) {
				const [arrayKey, index] = k.split(/\[|\]/).filter(Boolean);
				return acc?.[arrayKey]?.[Number(index)];
			}
			return acc?.[k];
		}, sourceObj as any);

		if (cacheTarget && sourceTarget && lastKey) {
			cacheTarget[lastKey] = sourceTarget[lastKey];
		}
	}
}

/**
 * Function for convenient array or object state update.
 * (Works only with MobX arrays)
 *
 * Telegram: https://t.me/nics51
 * 
 * @example
 * const commentsUpdate: MobxUpdateInstance<Comment> = useMobxUpdate(commentsList)
 * 
 * onClick={() => {
 * 	commentsUpdate(comment.id, "count", (prev) => prev+1) // prev++ DOESN'T WORK
 * }
 * 
 * Enjoy using ;)
 *
 * @param arrayOrObjectGetter - Array or object to update.
 * @param annotations - MobX annotations object, use as { passed name: observable... }
 * @returns Function for element state update.
 */
export const useMobxUpdate = <T extends Identifiable>(
	arrayOrObjectGetter: () => T[] | Record<string, T> | T[] | Record<string, T>,
	annotations: AnnotationsMap<{ [key: string]: any; }, never> = {},
): MobxUpdateInstance<T> => {
	const updater = new MobxUpdater(annotations);

	return <K extends NestedKeyOf<T>>(
		id: string | number,
		key: K,
		updaterFn: UpdaterT<T, K>,
		idKey?: string
	) => {
		const arrayOrObject = typeof arrayOrObjectGetter === 'function'
			? arrayOrObjectGetter()
			: arrayOrObjectGetter;

		updater.updateState(arrayOrObject, id, key, updaterFn, idKey);
	};
};