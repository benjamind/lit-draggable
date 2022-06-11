import { css, html, LitElement, TemplateResult } from 'lit';
import { state } from 'lit/decorators/state.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { styleMap } from 'lit/directives/style-map.js';

import { draggable, DraggableEvent, MoveEvent } from '../src';

@customElement('lit-draggable-demo')
export class LitDraggableDemo extends LitElement {
    @state()
    private position = { x: 0, y: 0, offsetX: 0, offsetY: 0 };

    static styles = css`
        :host {
            position: absolute;
            inset: 100px;
            border: 1px solid white;
            background: #cccccc;
        }
        #container {
            width: 100%;
            height: 100%;

            position: relative;
        }
        #dragMe {
            border: 1px solid red;
            color: white;
            font-size: 20px;
            font-weight: bold;
            display: block;
            width: fit-content;
            touch-action: none;
            user-select: none;
            cursor: pointer;
            width: 50px;
            height: 50px;
            background-color: #cc0000;

            position: absolute;
            top: var(--position-y);
            left: var(--position-x);
        }
    `;

    public render(): TemplateResult {
        const dragHandler = draggable({
            onStart: (event: DraggableEvent) => {
                const el = event.target as HTMLElement;
                // compute position of dragged element
                const elementRect = el.getBoundingClientRect();
                // compute position of parent element
                const parentRect = el.parentElement!.getBoundingClientRect();

                // calculate offset between pointer event location and element
                const pointerOffsetX = elementRect.x - event.pageX0;
                const pointeroffsetY = elementRect.y - event.pageY0;

                // store offset of parent and pointer
                this.position.offsetX = parentRect.x - pointerOffsetX;
                this.position.offsetY = parentRect.y - pointeroffsetY;
            },
            onMove: (event: MoveEvent) => {
                // take page position and modify with previously calculated offset
                // to get new absolute position relative to parent
                this.position.x = event.pageX - this.position.offsetX;
                this.position.y = event.pageY - this.position.offsetY;
            },
        });

        const styles = {
            '--position-x': `${this.position.x}px`,
            '--position-y': `${this.position.y}px`,
        };

        return html`
            <div id="container" style=${styleMap(styles)}>
                <div id="dragMe" ${dragHandler}>Drag Me</div>
            </div>
        `;
    }
}
