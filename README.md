# lit-draggable

DRAFT ONLY!

An async directive that uses the [pointer-tracker](https://github.com/GoogleChromeLabs/pointer-tracker) library to track pointer events to implement dragging behaviors in lit templates.

## Install

Not yet published to NPM! So you will have to install from git repository:

```bash
npm add git@github.com:GoogleChromeLabs/pointer-tracker.git
```

## Usage

```js
import { draggable } from 'lit-draggable';

// use it in a template...
    public render(): TemplateResult {
        const dragHandler = draggable({
            onStart: (event: DraggableEvent) => {
                // handle start of drag
            },
            onMove: (event: MoveEvent) => {
                // handle end of drag
            },
        });

        return html`
            <div id="container">
                <div id="dragMe" ${dragHandler}>Drag Me</div>
            </div>
        `;
    }
```

Note that this directive does not do any actual modification of your DOM, and as such is agnostic of usage in SVG or HTML elements. Instead it just hooks up the event handlers and processes start/end events and captures the deltas between each pointer move event.

For a more complete demo see the [demo/index.ts](./demo/index.ts).
