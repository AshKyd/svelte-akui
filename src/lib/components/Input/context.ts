export const INPUT_GROUP_CONTEXT = Symbol('INPUT_GROUP_CONTEXT');

export interface InputGroupContext {
	readonly joined: boolean;
	readonly size: 'small' | 'medium' | 'large';
}
