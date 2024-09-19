import React from "react";
import { Box, render } from "ink";
import App from "./App.js";
import { KeybindProcessingGate } from "../use-keybinds/KeybindProcessingGate.js";

export const commands = {
    foo: null,
    bar: null,
};

render(
    <KeybindProcessingGate>
        <App />
    </KeybindProcessingGate>,
);
