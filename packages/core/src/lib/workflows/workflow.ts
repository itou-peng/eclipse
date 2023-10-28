import { Trigger } from './trigger';
import { Worker } from '../workers';

export type WorkflowOption<TEventData> = {
  id: string;
  name: string;
  // logLevel?: LogLevel;
  trigger: Trigger<TEventData>;
  run: (event: TEventData) => Promise<void>;
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

  get trigger() {
    return this.options.trigger;
  }

  async run(trigger: Trigger<TEventData>) {
    const worker = new Worker(this, this.options);
    return worker.run(trigger.data());
  }
}
