import { useState } from "react";
import useKeybinds, { Binding, KbConfig } from "./useKeybinds.js";

const kb = {
    left: { key: "left" },
    right: { key: "right" },
    backspace: { key: "backspace" },
    tab: { key: "tab" },
    returnKey: { key: "return" },
} satisfies KbConfig;

export type InputState = {
    str: string;
    idx: number;
    _insert: boolean;
};

export function useFormInput(
    enter: Binding | Binding[],
    exit: Binding | Binding[],
) {
    const [state, setState] = useState<InputState>({
        str: "",
        idx: 0,
        _insert: false,
    });

    const { onCmd, command, register } = useKeybinds(kb, {
        priority: state._insert ? Infinity : -Infinity,
    });

    onCmd("left", () => {
        if (state._insert && state.idx > 0) {
            setState({ ...state, idx: state.idx - 1 });
        }
    });

    onCmd("right", () => {
        if (state._insert && state.idx < state.str.length) {
            setState({ ...state, idx: state.idx + 1 });
        }
    });

    onCmd("returnKey", () => {
        if (!state._insert) return;

        if (state.str.match(/\n {4}[\w\s]+$/gm)) {
            setState({
                ...state,
                str: `${state.str}\n    `,
                idx: state.idx + 5,
            });
        } else {
            setState({ ...state, idx: state.idx + 1, str: `${state.str}\n` });
        }
    });

    onCmd("tab", () => {
        if (!state._insert) return;

        const nextStr = `${state.str}    `;

        setState({ ...state, idx: state.idx + 4, str: nextStr });
    });

    onCmd("backspace", () => {
        if (!state._insert) return;
        const { str, idx } = state;

        const nextIdx = idx > 0 ? idx - 1 : 0;
        const nextStr = str.slice(0, idx > 0 ? idx - 1 : 0) + str.slice(idx);

        setState({ ...state, str: nextStr, idx: nextIdx });
    });

    onCmd("KEYPRESS", (char: string) => {
        let nextStringInput = state.str;

        if (state._insert) {
            nextStringInput = `${state.str.slice(0, state.idx)}${char}${state.str.slice(state.idx)}`;
        }

        const nextIdx = char ? state.idx + char.length : state.idx;

        if (nextIdx !== state.idx && state._insert) {
            setState({
                ...state,
                str: nextStringInput,
                idx: nextIdx,
            });
        }
    });

    const controlKb = { enter, exit } satisfies KbConfig;
    const control = useKeybinds(controlKb, {
        priority: 100,
    });
    control.onCmd("enter" as "KEYPRESS", () => {
        console.log("ayo enter");
        setState({ ...state, _insert: true });
    });
    control.onCmd("exit" as "KEYPRESS", () => {
        console.log("ayo exit");
        setState({ ...state, _insert: false });
    });

    return { state, command, register };
}
