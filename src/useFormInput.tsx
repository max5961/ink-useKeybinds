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
        idx: 1,
        _insert: false,
    });

    const config: KbConfig = {};
    if (state._insert) {
        Object.assign(config, kb, { exit });
    } else {
        Object.assign(config, { enter });
    }

    const { onCmd, command, register } = useKeybinds(config);

    onCmd("left" as "KEYPRESS", () => {
        if (state._insert && state.idx > 0) {
            setState({ ...state, idx: state.idx - 1 });
        }
    });

    onCmd("right" as "KEYPRESS", () => {
        if (state._insert && state.idx < state.str.length) {
            setState({ ...state, idx: state.idx + 1 });
        }
    });

    onCmd("returnKey" as "KEYPRESS", () => {
        if (!state._insert) return;

        const nextStr = `${state.str}\n`;

        setState({ ...state, idx: state.idx + 1, str: nextStr });
    });

    onCmd("tab" as "KEYPRESS", () => {
        if (!state._insert) return;

        const nextStr = `${state.str}    `;

        setState({ ...state, idx: state.idx + 4, str: nextStr });
    });

    onCmd("backspace" as "KEYPRESS", () => {
        if (!state._insert) return;
        const { str, idx } = state;

        const nextIdx = idx > 0 ? idx - 1 : 0;
        const nextStr = str.slice(0, idx > 0 ? idx - 1 : 0) + str.slice(idx);

        setState({ ...state, str: nextStr, idx: nextIdx });
    });

    onCmd("enter" as "KEYPRESS", () => {
        if (!state._insert) {
            setState({ ...state, _insert: true, idx: state.str.length });
        }
    });

    onCmd("exit" as "KEYPRESS", () => {
        if (state._insert) {
            setState({ ...state, _insert: false });
        }
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

    return { state, command, register };
}
