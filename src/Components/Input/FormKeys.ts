import { Key } from "../../use-keybinds/Keycodes.js";
import { KeyBinds, Binding } from "../../use-keybinds/useKeybinds.js";

const defaultEnter: Binding[] = [{ key: "return" }, { input: "i" }];
const defaultExit: Binding[] = [{ key: "return" }, { key: "esc" }];

function getNormalKeybindings(
    ID: string,
    enterBinding: Binding | Binding[] = defaultEnter,
): [KeyBinds, string] {
    const ENTER = `ENTER_${ID}`;

    return [{ [ENTER]: enterBinding }, ENTER];
}

export const EVENTS = {
    return: "return",
    left: "left",
    right: "right",
    up: "up",
    down: "down",
    backspace: "backspace",
    tab: "tab",
    keypress: "keypress",
};

const getDefaultInsert = (): KeyBinds => {
    return {
        [EVENTS.return]: { key: "return" },
        [EVENTS.left]: { key: "left" },
        [EVENTS.right]: { key: "right" },
        [EVENTS.up]: { key: "up" },
        [EVENTS.down]: { key: "down" },
        [EVENTS.backspace]: { key: "backspace" },
        [EVENTS.tab]: { key: "tab" },
        [EVENTS.keypress]: {
            notKey: [
                "return",
                "left",
                "right",
                "up",
                "down",
                "backspace",
                "tab",
            ],
            notInput: [],
        },
    };
};

function getInsertKeybindings(
    ID: string,
    exitBinding: Binding | Binding[] = defaultExit,
): [KeyBinds, string] {
    const defaultInsert = getDefaultInsert();
    exitBinding = [
        ...(Array.isArray(exitBinding) ? exitBinding : [exitBinding]),
    ];

    const notKey: Key[] = [];
    const notInput: string[] = [];
    for (const b of exitBinding) {
        b.key && notKey.push(b.key);
        b.input && notInput.push(b.input);

        if (b.key && defaultInsert[b.key]) {
            delete defaultInsert[b.key];
        }

        if (b.notKey) {
            for (const kk in defaultInsert) {
                for (const bk in b.notKey) {
                    if (bk === kk) continue;
                    delete defaultInsert[kk];
                }
            }
        }
    }

    const EXIT = `EXIT_${ID}`;
    defaultInsert[EXIT] = exitBinding;

    return [defaultInsert, EXIT];
}

export default {
    getInsertKeybindings,
    getNormalKeybindings,
};
