import { useState } from "react";
import useKeybinds, { Binding, Command, KbConfig } from "../../useKeybinds.js";
import { HEX_MAP, Key } from "../../HexMap.js";
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
} satisfies KbConfig;

export type InputState = {
    str: string;
    idx: number;
    insert: boolean;
};

type Opts = {
    enter?: Binding | Binding[];
    exit?: Binding | Binding[];
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
        str: "",
        idx: 0,
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

    const ENTER_ID = `ENTER_${ID}`;
    const normalKb = {} satisfies KbConfig;
    normalKb[ENTER_ID] = ENTER;

    const normal = useKeybinds(normalKb, {
        priority: state.insert ? "never" : "default",
    });
    normal.onCmd(ENTER_ID as Command<typeof normalKb>, () => {
        setState({ ...state, insert: true });
        if (!state.insert) {
            emitter.emit("enter");
        }
    });

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
    } satisfies KbConfig;
    insertKb[EXIT_ID] = EXIT;

    const insert = useKeybinds(insertKb, {
        priority: state.insert ? "textinput" : "never",
    });

    insert.onCmd(EXIT_ID as Command<typeof insertKb>, () => {
        setState({ ...state, insert: false, idx: state.str.length });
        if (state.insert) {
            emitter.emit("submit");
        }
    });

    insert.onCmd("left", () => {
        if (state.insert && state.idx > 0) {
            setState({ ...state, idx: state.idx - 1 });
        }
    });

    insert.onCmd("right", () => {
        if (state.insert && state.idx < state.str.length) {
            setState({ ...state, idx: state.idx + 1 });
        }
    });

    insert.onCmd("tab", () => {
        if (!state.insert) return;

        const nextStr = `${state.str}    `;

        setState({ ...state, idx: state.idx + 4, str: nextStr });
    });

    insert.onCmd("backspace", () => {
        if (!state.insert) return;
        const { str, idx } = state;

        const nextIdx = idx > 0 ? idx - 1 : 0;
        const nextStr = str.slice(0, idx > 0 ? idx - 1 : 0) + str.slice(idx);

        setState({ ...state, str: nextStr, idx: nextIdx });
    });

    insert.onCmd("keypress", (char: string) => {
        const invalidChars = [HEX_MAP.esc, HEX_MAP.insert, HEX_MAP.return];
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

// insert.onCmd("returnKey", () => {
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
