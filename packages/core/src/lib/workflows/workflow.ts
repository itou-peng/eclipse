import { Trigger } from './trigger';

type RecordToObject<U, T extends Record<string, U>> = {
  [K in keyof T]: T[K];
};

export type WorkflowOptions<
  TEventData,
  TConnectionType,
  TConnections extends Record<string, TConnectionType>,
> = {
  id: string;
  name: string;
  apiKey?: string;
  endpoint?: string;
  // logLevel?: LogLevel;
  trigger: Trigger<TEventData>;
  connections?: TConnections;
  run: (
    event: TEventData,
    lib: RecordToObject<TConnectionType, TConnections>,
  ) => Promise<void>;
};

export class Workflow<
  TEventData,
  TConnectionType,
  TConnections extends Record<string, TConnectionType>,
> {
  options: WorkflowOptions<TEventData, TConnectionType, TConnections>;

  constructor(
    options: WorkflowOptions<TEventData, TConnectionType, TConnections>,
  ) {
    this.options = options;
  }

  get id() {
    return this.options.id;
  }

  get name() {
    return this.options.name;
  }

  get endpoint() {
    return this.options.endpoint;
  }

  get trigger() {
    return this.options.trigger;
  }

  private get lib(): RecordToObject<TConnectionType, TConnections> {
    return this.options.connections as RecordToObject<
      TConnectionType,
      TConnections
    >;
  }

  async listen() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async run(trigger: Trigger<TEventData>) {
    return this.options.run({} as TEventData, this.lib);
  }
}
