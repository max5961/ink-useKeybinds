import React from "react";
import { Text } from "ink";
import { UseFormReturn } from "./useFormInput.js";
import { Props } from "../../../node_modules/ink/build/components/Text.js";
import chalk from "chalk";

type Color = Exclude<Props["color"], undefined>;

type InputProps = {
    text: UseFormReturn;
    mask?: boolean;
    onSubmit?: (stdin: string) => unknown;
    onEnter?: (stdin: string) => unknown;
    onKeypress?: (stdin: string) => unknown;
    placeholder?: string;
    color?: Color;
    cursorColor?: Color;
};

export function Input({
    text,
    mask,
    placeholder,
    onSubmit,
    onEnter,
    onKeypress,
    color = "cyan",
    cursorColor = "blue",
}: InputProps): React.ReactNode {
    let { str, idx, emitter } = text;

    if (color === "") {
        color = "white";
    }

    emitter.removeAllListeners();
    onSubmit && emitter.on("submit", onSubmit);
    onEnter && emitter.on("enter", onEnter);
    onKeypress && emitter.on("keypress", onKeypress);

    let before: string, cursor: string, after: string;
    before = cursor = after = "";

    for (let i = 0; i < str.length; ++i) {
        const char = mask ? "*" : str[i];

        if (i < idx) {
            before += char;
        } else if (i === idx && str[i] !== "\n") {
            cursor += char;
        } else {
            after += char;
        }
    }

    // Prevent collapsing height
    if (!str.length && !text.insert) {
        return (
            <Text color="grey" dimColor>
                {placeholder || " "}
            </Text>
        );
    }

    if (!cursor) {
        /* non breaking space*/
        cursor = "\u2007";
    }

    before = chalk[color](before);

    if (text.insert) {
        cursor = chalk.inverse(chalk[cursorColor](cursor));
    } else {
        // cursor = chalk[color](" ");
        cursor = "";
    }

    if (after.length) {
        after = chalk[color](after);
    }

    const val = `${before}${cursor}${after}`;

    return <Text>{val}</Text>;
}
