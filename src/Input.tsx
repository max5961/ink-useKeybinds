import React from "react";
import { Text, Box } from "ink";
import { InputState } from "./useFormInput.js";
import { Props } from "../node_modules/ink/build/components/Text.js";
import chalk from "chalk";

type Color = Exclude<Props["color"], undefined>;

type InputProps = {
    text: InputState;
    placeholder?: string;
    color?: Color;
    cursorColor?: Color;
};

export default function Input({
    text,
    placeholder,
    color = "cyan",
    cursorColor = "blue",
}: InputProps): React.ReactNode {
    const { str, idx } = text;

    let before, cursor, after: string;
    before = cursor = after = "";

    for (let i = 0; i < str.length; ++i) {
        if (i < idx) {
            before += str[i];
        } else if (i === idx && str[i] !== "\n") {
            cursor += str[i];
        } else {
            after += str[i];
        }
    }

    // Prevent collapsing height
    if (!str.length && !text._insert) {
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

    if (text._insert) {
        cursor = chalk.inverse(chalk[cursorColor](cursor));
    } else {
        cursor = chalk[color](" ");
    }

    if (after.length) {
        after = chalk[color](after);
    }

    const val = `${before}${cursor}${after}`;

    return <Text>{val}</Text>;
}
