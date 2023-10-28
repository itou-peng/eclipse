import { Workflow, WorkflowOption } from '../workflows';

export class Worker<TEventData> {
  workflow: Workflow<TEventData>;
  options: WorkflowOption<TEventData>;
  constructor(
    workflow: Workflow<TEventData>,
    options: WorkflowOption<TEventData>,
  ) {
    this.workflow = workflow;
    this.options = options;
  }

  async run(data: TEventData) {
    return this.options.run(data);
  }
}
