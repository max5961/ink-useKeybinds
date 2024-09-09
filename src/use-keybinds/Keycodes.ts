export const KEYCODES = {
    backspace: "\x7F",
    delete: "\x1B[3~",
    esc: "\x1B",
    insert: "\x1B[2~",
    return: "\r",
    sigint: "\u0003",
    tab: "\t",
    up: "\x1B[A",
    down: "\x1B[B",
    right: "\x1B[C",
    left: "\x1B[D",
    f1: "\x1BOP",
    f2: "\x1BOQ",
    f3: "\x1BOR",
    f4: "\x1BOS",
    f5: "\x1B[15~",
    f6: "\x1B[17~",
    f7: "\x1B[18~",
    f8: "\x1B[19~",
    f9: "\x1B[20~",
    f10: "\x1B[21~",
    f11: "\x1B[23~",
    f12: "\x1B[24~",
} as const;

export function newKeyRegister(): NonAlphaKeys {
    const keyRegister = {} as NonAlphaKeys;
    for (const key in KEYCODES) {
        if (key !== KEYCODES.sigint) {
            keyRegister[key] = false;
        }
    }
    return keyRegister;
}

export type NonAlphaKeys = Omit<
    {
        [P in keyof typeof KEYCODES]: boolean;
    },
    "sigint"
> & { ctrl: boolean };

export type Key = keyof NonAlphaKeys;
// const s1 = "[";
// const s2 = "\\";
// const s3 = "]";
// const s4 = "^";
// const s5 = "_";
// const s6 = "?";
//
// console.log(s1.charCodeAt(0));
// console.log(s2.charCodeAt(0));
// console.log(s3.charCodeAt(0));
// console.log(s4.charCodeAt(0));
// console.log(s5.charCodeAt(0));
// console.log(s6.charCodeAt(0));
//
// console.log(String.fromCharCode(91));
// console.log(String.fromCharCode(92));
// console.log(String.fromCharCode(93));
// console.log(String.fromCharCode(94));
// console.log(String.fromCharCode(95));
// console.log(String.fromCharCode(63));
