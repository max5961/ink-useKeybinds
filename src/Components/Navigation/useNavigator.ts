import { useEffect, useRef, useState } from "react";
import { Navigator, Initializer } from "./Navigator.js";
import { shallowEqualArrays } from "shallow-equal";
import { useKeybinds } from "../../use-keybinds/useKeybinds.js";
import { useEvent } from "../../use-keybinds/useEvent.js";
import {
    NAVIGATOR_EVENTS,
    viKeybinds,
    arrowKeybinds,
} from "./navigatorConstants.js";

type Opts<T extends string = string> = {
    initialFocus?: T;
    keybinds?: "vi" | "arrow" | "none";
};

type Return<T extends string = string> = {
    node: T;
    util: Omit<
        { [P in keyof Navigator]: Navigator[P] },
        "getIteration" | "getSize"
    >;
};

export function useNavigator<T extends string = string>(
    initializer: Initializer,
    opts: Opts<T> = {},
): Return<T> {
    const navigator = useRef<Navigator>(
        new Navigator(initializer, opts.initialFocus),
    );
    const initializerRef = useRef<Initializer>(initializer);

    const [node, setNode] = useState<string>(navigator.current.getLocation());

    useEffect(() => {
        if (!shallowEqualArrays(initializer, initializerRef.current)) {
            const compare = () => {
                return {
                    focus: navigator.current.getLocation(),
                    size: navigator.current.getSize(),
                    iter: navigator.current.getIteration(),
                };
            };

            const initial = compare();

            navigator.current = new Navigator(initializer, initial.focus);
            initializerRef.current = initializer;

            let next = compare();

            if (initial.focus === next.focus) return;

            let i = 0;
            let max = next.size;
            while (next.iter !== next.size - 1 && i <= max) {
                ++i;
                navigator.current.next();
                next = compare();
            }

            setNode(navigator.current.getLocation());
        }
    }, [initializer]);

    // prettier-ignore
    const keybinds = opts.keybinds === "vi"
            ? viKeybinds
            : opts.keybinds === "arrow"
              ? arrowKeybinds
              : {};

    useKeybinds(keybinds, {
        priority:
            !opts.keybinds || opts.keybinds === "arrow" ? "never" : "default",
    });

    useEvent(NAVIGATOR_EVENTS.up, () => {
        setNode(navigator.current.up());
    });

    useEvent(NAVIGATOR_EVENTS.down, () => {
        setNode(navigator.current.down());
    });

    useEvent(NAVIGATOR_EVENTS.left, () => {
        setNode(navigator.current.left());
    });

    useEvent(NAVIGATOR_EVENTS.right, () => {
        setNode(navigator.current.right());
    });

    useEvent(NAVIGATOR_EVENTS.next, () => {
        setNode(navigator.current.next());
    });

    useEvent(NAVIGATOR_EVENTS.prev, () => {
        setNode(navigator.current.prev());
    });

    return {
        node: node as T,
        util: {
            getLocation: navigator.current.getLocation,
            up: navigator.current.up,
            down: navigator.current.down,
            left: navigator.current.left,
            right: navigator.current.right,
            next: navigator.current.next,
            prev: navigator.current.prev,
        },
    };
}
