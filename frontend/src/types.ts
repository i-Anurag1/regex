export type Token={kind:string;value:string;start:number;end:number};
export type Node={id:number;kind:string;start:number;end:number;value?:string;children:Node[]};
export type Edge={from:number;to:number;symbol:string};
export type GraphState={id:number;start:boolean;accept:boolean;[key:string]:unknown};
export type Graph={states:GraphState[];transitions:Edge[];start:number;accepts:number[];alphabet:string[];subset_steps?:unknown[];minimization_steps?:unknown[]};
export type Compilation={regex:string;tokens:Token[];ast:Node;nfa:Graph;dfa:Graph;minimized_dfa:Graph;stats:Record<string,number>};
