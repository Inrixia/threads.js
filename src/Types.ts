import { MessagePort } from "worker_threads";

import type { Thread } from "./Thread";

export type InternalFunctions = {
	runQueue: Thread["_runQueue"];
	stopExecution: Thread["stopExecution"];
	require: Thread["require"]
	_getThreadReferenceData: Thread["_getThreadReferenceData"]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnsafeReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnsafeParameters<T> = T extends (...args: infer P) => any ? P : never;

export type PromisefulModule<M extends ThreadExports> = { 
	// eslint-disable-next-line @typescript-eslint/ban-types
	[K in keyof M]: M[K] extends Function ? 
		UnsafeReturnType<M[K]> extends PromiseLike<unknown> ?
			(...args: UnsafeParameters<M[K]>) => UnsafeReturnType<M[K]>
			: (...args: UnsafeParameters<M[K]>) => Promise<UnsafeReturnType<M[K]>>
		: () => Promise<M[K]>
} & InternalFunctions

export type ThreadExports = {
	[key: string]: unknown
}

export type ThreadData = undefined | unknown

export type ThreadModule<E extends ThreadExports = ThreadExports, D = unknown> = NodeJS.Module & { 
	thread: Thread<E, D>,
	exports: E
}

export type ThreadOptions<T> = {
	threadInfo?: string;
	eval?: boolean;
	sharedArrayBuffer?: SharedArrayBuffer;
	data?: T;
	count?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnknownFunction = (...args: any[]) => Promise<any>;


export type ThreadInfo = {
	workerPort: MessagePort;
	workerData: {
		sharedArrayBuffer: SharedArrayBuffer;
	};
	transfers: [MessagePort];
};

export type Messages = {
	Reject: {
		type: "reject";
		data: Error;
		promiseKey: number;
	};
	Resolve: {
		type: "resolve";
		data: Array<unknown>;
		promiseKey: number;
	};
	Event: {
		type: "event";
		eventName: string;
		args: Array<unknown>;
		promiseKey: number;
	};
	Call: {
		func: keyof ThreadExports;
		type: "call";
		data: Array<unknown>;
		promiseKey: number;
	};
	Queue: {
		func: keyof ThreadExports;
		type: "queue";
		data: Array<unknown>;
		promiseKey: number;
	};
	UncaughtErr: {
		type: "uncaughtErr";
		err: Error;
	};
	Exit: {
		type: "exit";
		code: number;
	};
};

export type AnyMessage = Messages[keyof Messages];