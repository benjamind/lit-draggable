import { LitElement } from 'lit';
import { nothing, AttributePart } from 'lit/html.js';
import { directive, PartInfo, PartType } from 'lit/directive.js';
import { AsyncDirective } from 'lit/async-directive.js';

import PointerTracker, { Pointer, InputEvent } from 'pointer-tracker';

export interface DraggableEvent {
    element: Element;
    target?: EventTarget;
    draggable: Draggable;
    pageX0: number;
    pageY0: number;
    clientX0: number;
    clientY0: number;
    pageX: number;
    pageY: number;
    clientX: number;
    clientY: number;
}

export interface MoveEvent extends DraggableEvent {
    dx: number;
    dy: number;
    dx0: number;
    dy0: number;
}
export interface EndEvent extends DraggableEvent {
    dx0: number;
    dy0: number;
    cancelled: boolean;
}

export type Options = {
    // if `true`, the `animate` is disabled
    disabled?: boolean;
    // data to pass to each callback
    data?: unknown;
    // Callback run when the `drag` starts
    onStart?: (event: DraggableEvent, data?: unknown) => void;
    // Callback run when the drag is complete
    onEnd?: (event: EndEvent, data?: unknown) => void;
    // Callback run when the drag is updated
    onMove?: (event: MoveEvent, data?: unknown) => void;
};

export class Draggable extends AsyncDirective {
    private host?: LitElement;

    private element?: HTMLElement;
    private options!: Options;

    constructor(part: PartInfo) {
        super(part);
        if (part.type === PartType.CHILD) {
            throw new Error(
                'The `draggable` directive must be used in attribute position.'
            );
        }
    }

    public render(_options?: (() => Options) | Options) {
        return nothing;
    }

    private _setOptions(options?: Options) {
        options = options ?? {};
        this.options = options;
    }

    private startPointer?: Pointer;

    private start = (pointer: Pointer, event: InputEvent): boolean => {
        if (this.options.disabled) {
            return false;
        }
        // only track single touch
        if (this.startPointer) {
            return false;
        }

        const startCallback = this.options.onStart;
        if (startCallback) {
            startCallback(
                {
                    draggable: this,
                    target: event.target || undefined,
                    element: this.element!,
                    clientX0: pointer.clientX,
                    clientY0: pointer.clientY,
                    pageX0: pointer.pageX,
                    pageY0: pointer.pageY,
                    clientX: pointer.clientX,
                    clientY: pointer.clientY,
                    pageX: pointer.pageX,
                    pageY: pointer.pageY,
                },
                this.options.data
            );
        }
        this.startPointer = pointer;
        // compute offset from element
        return true;
    };

    private move = (
        previousPointers: Pointer[],
        changedPointers: Pointer[],
        event: InputEvent
    ): void => {
        const moveCallback = this.options.onMove;
        if (moveCallback && this.startPointer) {
            for (const pointer of changedPointers) {
                const previous = previousPointers.find(
                    (p) => p.id === pointer.id
                );
                if (!previous) {
                    continue;
                }
                moveCallback(
                    {
                        draggable: this,
                        target: event.target || undefined,
                        element: this.element!,
                        clientX0: this.startPointer.clientX,
                        clientY0: this.startPointer.clientY,
                        pageX0: this.startPointer.pageX,
                        pageY0: this.startPointer.pageY,
                        dx0: pointer.pageX - this.startPointer.pageX,
                        dy0: pointer.pageY - this.startPointer.pageY,
                        dx: pointer.pageX - previous.pageX,
                        dy: pointer.pageY - previous.pageY,
                        clientX: pointer.clientX,
                        clientY: pointer.clientY,
                        pageX: pointer.pageX,
                        pageY: pointer.pageY,
                    },
                    this.options.data
                );
                this.host?.requestUpdate();
            }
        }
    };

    private end = (
        pointer: Pointer,
        event: InputEvent,
        cancelled: boolean
    ): void => {
        const endCallback = this.options.onEnd;
        if (endCallback && this.startPointer) {
            endCallback(
                {
                    draggable: this,
                    target: event.target || undefined,
                    element: this.element!,
                    clientX0: this.startPointer.clientX,
                    clientY0: this.startPointer.clientY,
                    pageX0: this.startPointer.pageX,
                    pageY0: this.startPointer.pageY,
                    dx0: pointer.pageX - this.startPointer.pageX,
                    dy0: pointer.pageY - this.startPointer.pageY,
                    clientX: pointer.clientX,
                    clientY: pointer.clientY,
                    pageX: pointer.pageX,
                    pageY: pointer.pageY,
                    cancelled,
                },
                this.options.data
            );
        }
        this.startPointer = undefined;
    };

    // @ts-expect-error -- unused for now
    private tracker?: PointerTracker;

    override update(
        part: AttributePart,
        [options]: Parameters<this['render']>
    ) {
        const firstUpdate = this.host === undefined;
        if (firstUpdate) {
            this.host = part.options?.host as LitElement;
            this.element = part.element;
            this.tracker = new PointerTracker(this.element, {
                start: this.start,
                move: this.move,
                end: this.end,
            });
        }
        if (firstUpdate || typeof options !== 'function') {
            this._setOptions(options as Options);
        }
        return this.render(options);
    }
}

export const draggable = directive(Draggable);
