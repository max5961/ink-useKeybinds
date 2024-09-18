import React from "react";
import { Box, render } from "ink";
import App from "./App.js";
import { KeybindProcessingGate } from "../use-keybinds/KeybindProcessingGate.js";
import { KeybindsProvider } from "../use-keybinds/KeybindsProvider.js";
import { keybinds } from "./initialData.js";
import { CommandLine } from "../Components/CommandLine/CommandLine.js";

export const commands = {
    foo: null,
    bar: null,
};

render(
    <KeybindProcessingGate>
        <KeybindsProvider config={keybinds}>
            <CommandLine commands={commands}>
                <Box
                    width="100"
                    height={40}
                    display="flex"
                    flexDirection="column"
                    borderStyle="round"
                >
                    <App />
                    <CommandLine.Prompt />
                </Box>
            </CommandLine>
        </KeybindsProvider>
    </KeybindProcessingGate>,
);
