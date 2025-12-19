/**
 * Common utility types
 */

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface Identifiable {
  id: string;
}

export type WithId<T> = T & Identifiable;
export type WithTimestamps<T> = T & Timestamped;
