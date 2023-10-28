// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Trigger<TEventData = void> = {
  name: string;
  data: () => TEventData;
};
