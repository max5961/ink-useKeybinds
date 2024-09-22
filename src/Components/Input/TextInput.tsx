import React from "react";
import { Text } from "ink";
import { Return } from "./useTextInput.js";
import { Props as TextProps } from "../../../node_modules/ink/build/components/Text.js";
import chalk from "chalk";

type Color = Exclude<TextProps["color"], undefined>;

type Props = {
    inputState: Return["inputState"];
    mask?: boolean;
    onSubmit?: (stdin: string) => unknown;
    onEnter?: (stdin: string) => unknown;
    onKeypress?: (stdin: string) => unknown;
    placeholder?: string;
    color?: Color;
    cursorColor?: Color;
};

/*
 * TODO
 * Add truncate option that applies to the Text component
 *
 * Add ref to Box wrapping Text that measures the width and slices/shifts text so
 * that excess chars at the end stay within viewing window during editing
 *
 * Consider that TextInput should always be single line truncated component and that
 * TextArea should be the same as TextInput but with wrap and handles more key presses
 * such as return and arrow keys while the normal TextInput would ignore those keys
 * for adding to the text string
 *
 * useFormInput would still handle both TextInput and TextArea
 *
 * TextArea could have height/width props and excess lines could be sliced away
 * from the view during editing which would be easy to calculate with a simple
 * for loop.  The same as done in the TextInput component and this implies that the
 * TextArea would have wrap on, but would detect when to insert a \n automatically
 * */

export function TextInput({
    inputState,
    mask,
    placeholder,
    onSubmit,
    onEnter,
    onKeypress,
    color = "",
    cursorColor = "",
}: Props): React.ReactNode {
    let { text, idx, emitter } = inputState;

    color = normalizeColor(color);
    cursorColor = normalizeColor(cursorColor);

    emitter.removeAllListeners();
    onSubmit && emitter.on("submit", onSubmit);
    onEnter && emitter.on("enter", onEnter);
    onKeypress && emitter.on("keypress", onKeypress);

    let before: string, cursor: string, after: string;
    before = cursor = after = "";

    for (let i = 0; i < text.length; ++i) {
        const char = mask ? "*" : text[i];

        if (i < idx) {
            before += char;
        } else if (i === idx && text[i] !== "\n") {
            cursor += char;
        } else {
            after += char;
        }
    }

    // Prevent collapsing height
    if (!text.length && !inputState.insert) {
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

    if (inputState.insert) {
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

function normalizeColor(color: string): string {
    if (color === "" || !chalk[color]) return "white";
    return color;
}
