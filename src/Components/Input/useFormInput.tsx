import { useEffect, useRef, useState } from "react";
import {
    useKeybinds,
    Binding,
    KeyBindEvent,
    KeyBinds,
} from "../../use-keybinds/useKeybinds.js";
import { KEYCODES, Key } from "../../use-keybinds/Keycodes.js";
import { randomUUID } from "crypto";
import EventEmitter from "events";
import { usePage } from "../Sequence/SequenceUnit/PageContext.js";
import { Priority } from "../../use-keybinds/KeybindProcessingGate.js";

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
    stdin: string | null;
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
        stdin: null,
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

    let isPageFocus = true;
    try {
        const pageCtx = usePage();
        isPageFocus = pageCtx.isFocus;
    } catch (_) {}

    const priority = ((): Priority => {
        if (!ACTIVE) return "never";
        if (!isPageFocus) return "never";

        return state.insert ? "textinput" : "default";
    })();
    const config = state.insert ? insertKb : normalKb;
    const { onEvent } = useKeybinds<typeof insertKb | typeof normalKb>(config, {
        priority,
    });

    const mounted = useRef(false);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }

        if (state.insert) {
            emitter.emit("enter", state.stdin);
        } else {
            emitter.emit("submit", state.stdin);
        }
    }, [state.insert]);

    onEvent(ENTER_ID as KeyBindEvent<typeof normalKb>, (stdin: string) => {
        setState((prev) => {
            return { ...prev, stdin, insert: true };
        });
    });

    onEvent(EXIT_ID as KeyBindEvent<typeof insertKb>, (stdin: string) => {
        setState((prev) => {
            return { ...prev, stdin, insert: false, idx: prev.str.length };
        });
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

    onEvent("keypress", (stdin: string) => {
        if (state.insert) {
            emitter.emit("keypress", stdin);
        }

        const invalidChars = [KEYCODES.esc, KEYCODES.insert, KEYCODES.return];
        for (const invalidChar of invalidChars) {
            if (invalidChar === stdin) {
                return;
            }
        }

        let nextStringInput = state.str;

        if (state.insert) {
            nextStringInput = `${state.str.slice(0, state.idx)}${stdin}${state.str.slice(state.idx)}`;
        }

        const nextIdx = stdin ? state.idx + stdin.length : state.idx;

        if (nextIdx !== state.idx && state.insert) {
            setState({
                ...state,
                str: nextStringInput,
                idx: nextIdx,
            });
        }
    });

    function clearText(): void {
        setState((prev) => {
            return { ...prev, str: "", idx: 0 };
        });
        // setState({ ...state, str: "", idx: 0 });
    }

    function setText(newText: string): void {
        setState((prev) => {
            return { ...prev, str: newText, idx: newText.length };
        });
        // setState({ ...state, str: newText, idx: newText.length });
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
