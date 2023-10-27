import { Workflow, WorkflowOptions } from '../workflows';

export class Worker<
  TEventData,
  TConnectionType,
  TConnections extends Record<string, TConnectionType>,
> {
  workflow: Workflow<TEventData, TConnectionType, TConnections>;
  options: WorkflowOptions<TEventData, TConnectionType, TConnections>;
  constructor(
    workflow: Workflow<TEventData, TConnectionType, TConnections>,
    options: WorkflowOptions<TEventData, TConnectionType, TConnections>,
  ) {
    this.workflow = workflow;
    this.options = options;
  }
}
