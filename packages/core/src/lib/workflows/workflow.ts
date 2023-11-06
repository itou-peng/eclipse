import { Worker } from '../workers';

export type WorkflowOption<TEventData> = {
  id: string;
  name: string;
  // logLevel?: LogLevel;
  run: (data: TEventData) => Promise<void> | void;
};

export class Workflow<TEventData> {
  options: WorkflowOption<TEventData>;

  constructor(options: WorkflowOption<TEventData>) {
    this.options = options;
  }

  get id() {
    return this.options.id;
  }

  get name() {
    return this.options.name;
  }

  async run(data: TEventData) {
    const worker = new Worker(this, this.options);
    return worker.run(data);
  }
}
