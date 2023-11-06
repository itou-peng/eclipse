import { Trigger, Workflow, WorkflowOption } from './lib/workflows';
import { Evt } from 'evt';

export class Eclipse extends Evt<Trigger> {
  workflows: Workflow<unknown>[] = [];

  constructor() {
    super();
  }

  async register<EventData>(workflowOption: WorkflowOption<EventData>) {
    const workflow = new Workflow(workflowOption);
    this.workflows.push(workflow as Workflow<unknown>);
    this.$attach(
      (trigger) => (trigger.name === workflow.name ? [trigger.data] : null),
      (data) => {
        workflow.run(data as EventData);
      },
    );
  }

  trigger<EventData>(event: Trigger<EventData>) {
    this.post(event);
  }
}
