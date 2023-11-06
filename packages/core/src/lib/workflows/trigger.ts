export interface Trigger<TEventData = unknown> {
  name: string;
  data: TEventData;
}
