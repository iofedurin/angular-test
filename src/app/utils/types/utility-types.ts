/**
 * Like Required<T> but only for given set of keys (for recursive version see `DeepMakeRequired`)
 */
export type MakeRequired<T, Keys extends keyof T> = { [K in Keys]-?: T[K] } & T;
