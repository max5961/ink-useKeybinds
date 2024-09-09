import { useState } from "react";
import {
    useKeybinds,
    Binding,
    KeyBindEvent,
    KeyBinds,
} from "../../use-keybinds/useKeybinds.js";
import { KEYCODES, Key } from "../../use-keybinds/Keycodes.js";
import { randomUUID } from "crypto";
import EventEmitter from "events";

const kb = {
    return: { key: "return" },
    left: { key: "left" },
    right: { key: "right" },
    backspace: { key: "backspace" },
    tab: { key: "tab" },
    keypress: {
        notKey: ["return", "left", "right", "up", "down", "backspace", "tab"],
        notInput: [],
    },
} satisfies KeyBinds;

export type InputState = {
    str: string;
    idx: number;
    insert: boolean;
};

type Opts = {
    enter?: Binding | Binding[];
    exit?: Binding | Binding[];
    defaultVal?: string;
    active?: boolean;
};

export type UseFormReturn = {
    emitter: EventEmitter;
    clearText: () => void;
    setText: (newText: string) => void;
} & InputState;

export function useFormInput(opts?: Opts): UseFormReturn {
    const [ID] = useState(randomUUID());
    const [emitter] = useState(new EventEmitter());

    const [state, setState] = useState<InputState>({
        str: opts?.defaultVal || "",
        idx: opts?.defaultVal?.length || 0,
        insert: false,
    });

    const ENTER: Binding | Binding[] = opts?.enter || [
        { key: "return" },
        { input: "i" },
    ];

    const EXIT: Binding | Binding[] = opts?.exit || [
        { key: "return" },
        { key: "esc" },
    ];

    const ACTIVE = opts?.active === undefined ? true : opts?.active;

    /*
     * Get normal keybindings
     * */
    const ENTER_ID = `ENTER_${ID}`;
    const normalKb = {} satisfies KeyBinds;
    normalKb[ENTER_ID] = ENTER;

    /*
     * Get insert keybindings
     * */
    const notKey: Key[] = [];
    const notInput: string[] = [];
    for (const b of [...(Array.isArray(EXIT) ? EXIT : [EXIT])]) {
        b.key && notKey.push(b.key);
        b.input && notInput.push(b.input);

        if (b.key && kb[b.key]) {
            delete kb[b.key];
        }

        if (b.notKey) {
            for (const kk in kb) {
                for (const bk in b.notKey) {
                    if (bk === kk) continue;
                    delete kb[kk];
                }
            }
        }
    }

    const EXIT_ID = `EXIT_${ID}`;
    const insertKb = {
        ...kb,
        keypress: { notKey, notInput },
    } satisfies KeyBinds;
    insertKb[EXIT_ID] = EXIT;

    const priority = (() => {
        if (!ACTIVE) {
            return "never";
        }
        return state.insert ? "textinput" : "default";
    })();
    const config = state.insert ? insertKb : normalKb;
    const { onEvent } = useKeybinds<typeof insertKb | typeof normalKb>(config, {
        priority,
    });

    onEvent(ENTER_ID as KeyBindEvent<typeof normalKb>, (stdin: string) => {
        // TODO
        // This needs to be done in a way that the event is only emitted once
        // the state is actually changed
        setState({ ...state, insert: true });
        if (!state.insert) {
            emitter.emit("enter", stdin);
        }
    });

    onEvent(EXIT_ID as KeyBindEvent<typeof insertKb>, (stdin: string) => {
        // TODO
        // This needs to be done in a way that the event is only emitted once
        // the state is actually changed
        setState({ ...state, insert: false, idx: state.str.length });
        if (state.insert) {
            emitter.emit("submit", stdin);
        }
    });

    onEvent("left", () => {
        if (state.insert && state.idx > 0) {
            setState({ ...state, idx: state.idx - 1 });
        }
    });

    onEvent("right", () => {
        if (state.insert && state.idx < state.str.length) {
            setState({ ...state, idx: state.idx + 1 });
        }
    });

    onEvent("tab", () => {
        if (!state.insert) return;

        const nextStr = `${state.str}    `;

        setState({ ...state, idx: state.idx + 4, str: nextStr });
    });

    onEvent("backspace", () => {
        if (!state.insert) return;
        const { str, idx } = state;

        const nextIdx = idx > 0 ? idx - 1 : 0;
        const nextStr = str.slice(0, idx > 0 ? idx - 1 : 0) + str.slice(idx);

        setState({ ...state, str: nextStr, idx: nextIdx });
    });

    onEvent("keypress", (char: string) => {
        if (state.insert) {
            emitter.emit("keypress", char);
        }

        const invalidChars = [KEYCODES.esc, KEYCODES.insert, KEYCODES.return];
        for (const invalidChar of invalidChars) {
            if (invalidChar === char) {
                return;
            }
        }

        let nextStringInput = state.str;

        if (state.insert) {
            nextStringInput = `${state.str.slice(0, state.idx)}${char}${state.str.slice(state.idx)}`;
        }

        const nextIdx = char ? state.idx + char.length : state.idx;

        if (nextIdx !== state.idx && state.insert) {
            setState({
                ...state,
                str: nextStringInput,
                idx: nextIdx,
            });
        }
    });

    function clearText(): void {
        setState({ ...state, str: "", idx: 0 });
    }

    function setText(newText: string): void {
        setState({ ...state, str: newText, idx: newText.length });
    }

    return { ...state, emitter, clearText, setText };
}

// insert.onEvent("returnKey", () => {
//     if (!state.insert) return;
//
//     if (state.str.match(/\n {4}[\w\s]+$/gm)) {
//         setState({
//             ...state,
//             str: `${state.str}\n    `,
//             idx: state.idx + 5,
//         });
//     } else {
//         setState({ ...state, idx: state.idx + 1, str: `${state.str}\n` });
//     }
// });
