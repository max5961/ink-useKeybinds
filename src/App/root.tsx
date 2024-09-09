import React from "react";
import { Box, render } from "ink";
import App from "./App.js";
import { KeybindProcessingGate } from "../use-keybinds/KeybindProcessingGate.js";
import { KeybindsProvider } from "../use-keybinds/KeybindsProvider.js";
import { keybinds } from "./initialData.js";
import { CommandLine } from "../Components/Command/CommandLine.js";

const commands = {
    foo: null,
    bar: null,
};

render(
    <KeybindProcessingGate>
        <KeybindsProvider config={keybinds}>
            <CommandLine {...{ commands }}>
                <Box
                    width="100"
                    height="100"
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    alignItems="center"
                    borderStyle="round"
                >
                    <App />
                    <CommandLine.Prompt />
                </Box>
            </CommandLine>
        </KeybindsProvider>
    </KeybindProcessingGate>,
);
