import React, { PropsWithRef, useEffect, useState } from "react";
import { Text } from "ink";
import { Return, useTextInput } from "./useTextInput.js";
import { Props as TextProps } from "../../../node_modules/ink/build/components/Text.js";
import chalk from "chalk";
import { Binding } from "../../use-keybinds/useKeybinds.js";
import { UseFormReturn } from "../Form/useForm.js";

export namespace TextInputTypes {
    export type Color = Exclude<TextProps["color"], undefined>;

    export type Props = {
        value: string;
        onChange: (value: string) => unknown;
        name?: string;
        nameFocused?: boolean;
        enterBinding?: Binding | Binding[];
        exitBinding?: Binding | Binding[];
        insertControl?: ReturnType<UseFormReturn["register"]>["insertControl"];
        active?: boolean;
        autoInsert?: boolean;
        mask?: boolean;
        onExit?: (stdin: string) => unknown;
        onEnter?: (stdin: string) => unknown;
        onKeypress?: (stdin: string) => unknown;
        placeholder?: string;
        color?: Color;
        cursorColor?: Color;
    };
}

export function TextInput(props: TextInputTypes.Props): React.ReactNode {
    const { value, onChange, mask, placeholder, color = "", cursorColor = "" } = props;

    const { nextValue, idx, insert } = useTextInput(props);

    useEffect(() => {
        if (nextValue !== value) {
            onChange(nextValue);
        }
    }, [nextValue, onChange]);

    return (
        <DisplayValue
            nextValue={nextValue}
            idx={idx}
            insert={insert}
            mask={mask}
            placeholder={placeholder}
            color={color}
            cursorColor={cursorColor}
        />
    );
}

const DisplayValue = React.memo(function (
    props: Omit<TextInputTypes.Props, "value" | "onChange"> & {
        nextValue: string;
        idx: number;
        insert: boolean;
    },
): React.ReactNode {
    let {
        nextValue,
        idx,
        insert,
        mask,
        placeholder,
        color = "",
        cursorColor = "",
    } = props;

    color = normalizeColor(color);
    cursorColor = normalizeColor(cursorColor);

    let before: string, cursor: string, after: string;
    before = cursor = after = "";

    for (let i = 0; i < nextValue.length; ++i) {
        const char = mask ? "*" : nextValue[i];

        if (i < idx) {
            before += char;
        } else if (i === idx && nextValue[i] !== "\n") {
            cursor += char;
        } else {
            after += char;
        }
    }

    // Prevent collapsing height
    if (!nextValue.length && !insert) {
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

    if (insert) {
        cursor = chalk.inverse(chalk[cursorColor](cursor));
    } else {
        // cursor = chalk[color](" ");
        cursor = "";
    }

    if (after.length) {
        after = chalk[color](after);
    }

    const displayValue = `${before}${cursor}${after}`;

    return <Text>{displayValue}</Text>;
});

function normalizeColor(color: string): string {
    if (color === "" || !chalk[color]) return "white";
    return color;
}

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
