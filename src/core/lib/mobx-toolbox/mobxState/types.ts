import { IEqualsComparer } from 'mobx';
import { Annotation } from 'mobx/dist/internal';

export type MobxStateWithGetterAndSetter<K, T> = { [Value in Extract<K, string>]: T } & SetterType<K, T>;
export type SetterType<K, T> = { [SetterName in `set${Capitalize<Extract<K, string>>}`]: (newValue: T | ((prev: T) => T)) => void };
export interface MobxStateOptions { reset?: boolean; }
export type MakeObservableOptions = Omit<CreateObservableOptions, 'proxy'>;
export type CreateObservableOptions = { name?: string; equals?: IEqualsComparer<any>; deep?: boolean; defaultDecorator?: Annotation; proxy?: boolean; autoBind?: boolean; };
