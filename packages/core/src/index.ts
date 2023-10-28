import { Workflow, WorkflowOption } from './lib/workflows';
import { Evt } from 'evt';

export class Eclipse extends Evt<string> {
  workflows: Workflow<unknown>[] = [];

  constructor() {
    super();
  }

  register(workflowOption: WorkflowOption<unknown>) {
    const workflow = new Workflow(workflowOption);
    this.workflows.push();
    this.attach(
      (eventName) => eventName === workflow.trigger.name,
      () => {
        workflow.run(workflow.trigger);
      },
    );
  }

  trigger(eventName: string) {
    this.post(eventName);
  }
}
