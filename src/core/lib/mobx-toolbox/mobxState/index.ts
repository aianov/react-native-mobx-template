import { action, makeObservable, observable, onBecomeUnobserved } from 'mobx';
import { MobxStateOptions, MobxStateWithGetterAndSetter } from './types';


class MobxState<K extends string, T> {
	[key: string]: any;

	constructor(
		initialValue: T,
		name: K,
		options: MobxStateOptions = {}
	) {
		const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
		const resetValue = initialValue;

		this[name] = initialValue as this[K];

		this[`set${capitalizedName}`] = (newValue: T | ((prev: T) => T)) => {
			if (typeof newValue === "function") {
				this[name] = (newValue as (prev: T) => T)(this[name] as T) as this[K];
			} else {
				this[name] = newValue as this[K];
			}
		};

		makeObservable(this, {
			[name]: observable,
			[`set${capitalizedName}`]: action,
		} as any);

		if (options.reset) {
			onBecomeUnobserved(this, name, () => {
				this[name] = resetValue as this[K];
			});
		}
	}
}


/**
 * Creates MobX state with getter, setter, custom decorators and settings support.
 * 
 * Telegram: https://t.me/nics51
 *
 * First function call - pass initial state value and MobX options.
 * Second call - pass state name (key) that will be dynamically created.
 *
 * @example
 * // Create state with initial value 0
 * const count = mobxState(0)('count');
 *
 * // Now you can use `counter.counter` to get value
 * and counter.setCounter(newValue | (prevValue) => newValue) to change it.
 * or const { count: { count, setCount } } = counterStore
 * 
 * Also you can use setting { reset: true }
 * @example
 * const count = mobxState(0)('count', { reset: true })
 * 
 * Now your state 'count' will auto-reset to initial value passed in first argument.
 * Reset will happen only when you're in area where your state is not observed
 *
 * @param initialValue - initial value
 * @param annotations - MobX annotations object, use as { passed name: observable... }
 * @param options - additional options for makeAutoObservable (e.g., autoBind, deep...)
 * @returns Function that takes `name` parameter and returns state object with getter and setter of that `name`.
 */
export function mobxState<T>(
	initialValue: T
) {
	return <K extends string>(name: K, options?: MobxStateOptions): MobxStateWithGetterAndSetter<K, T> => {
		return new MobxState<K, T>(initialValue, name, options) as MobxStateWithGetterAndSetter<K, T>;
	};
}