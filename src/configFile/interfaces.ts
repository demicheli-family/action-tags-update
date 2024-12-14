export interface WorkflowDispatchInputs {
    [key: string]: {
        description: string;
        required: boolean;
        type: string;
        options?: string[];
    };
}

export interface WorkflowDispatch {
    inputs: WorkflowDispatchInputs;
}

export interface WorkflowYaml {
    on?: {
        workflow_dispatch?: WorkflowDispatch;
    };
}
