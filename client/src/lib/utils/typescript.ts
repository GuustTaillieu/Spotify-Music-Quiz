export type CompleteRecord<T, K> = {
  [P in keyof T]: K;
};
