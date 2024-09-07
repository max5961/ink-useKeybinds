import React from "react";
import { render } from "ink";
import App from "./App.js";
import { KeybindProcessingGate } from "src/use-keybinds/KeybindProcessingGate.js";

render(
    <KeybindProcessingGate>
        <App />
    </KeybindProcessingGate>,
);
