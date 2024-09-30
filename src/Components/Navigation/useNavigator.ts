import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    focus: FocusMap<T>;
    util: Omit<
        { [P in keyof Navigator]: Navigator[P] },
        "getIteration" | "getSize"
    >;
};

type FocusMap<T extends string = string> = {
    [P in T]: boolean;
};

export function useNavigator<T extends string = string>(
    initializer: Initializer,
    opts: Opts<T> = {},
): Return<T> {
    const KEYBINDS_TYPE = opts.keybinds || "arrow";

    const navigator = useRef<Navigator>(
        new Navigator(initializer, opts.initialFocus),
    );
    const [node, setNode] = useState<string>(navigator.current.getLocation());

    const initializerRef = useRef<Initializer>(initializer);
    const possibleNodes: string[] = getPossibleNodes();

    function getPossibleNodes(): string[] {
        return initializer
            .flatMap((i) => {
                return i.map((j) => (j ? j : null));
            })
            .filter((i) => i !== null);
    }

    function getFocusMap(): FocusMap {
        return Object.fromEntries(
            possibleNodes.map((currNode: string) => {
                if (currNode === node) {
                    return [currNode, true];
                }
                return [currNode, false];
            }),
        );
    }

    useEffect(() => {
        if (!shallowEqualArrays(initializer, initializerRef.current)) {
            const initialIter = navigator.current.getIteration();

            // Navigator accepts an initial focus, but if the initial focus does
            // not exist in the initializer, focus defaults to the first node
            navigator.current = new Navigator(initializer, initialIter);
            initializerRef.current = initializer;

            const nextIter = navigator.current.getIteration();
            const nextSize = navigator.current.getSize();

            if (initialIter === nextIter) {
                // still need to update node, in case iteration stays the same, but name changes
                setNode(navigator.current.getLocation());
                return;
            }

            // Initializer size has decreased AND shifted initialIter out of range,
            // so shift focus to the last node in the new Navigator
            if (nextSize <= initialIter) {
                setNode(navigator.current.moveToIteration(nextSize - 1));
            }
        }
    }, [initializer]);

    // prettier-ignore
    const keybinds = KEYBINDS_TYPE === "vi"
            ? viKeybinds
            : KEYBINDS_TYPE === "arrow"
              ? arrowKeybinds
              : {};

    useKeybinds(keybinds, {
        priority: KEYBINDS_TYPE === "none" ? "never" : "default",
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
        focus: getFocusMap(),
        util: {
            getLocation: navigator.current.getLocation,
            moveToIteration: navigator.current.moveToIteration,
            up: navigator.current.up,
            down: navigator.current.down,
            left: navigator.current.left,
            right: navigator.current.right,
            next: navigator.current.next,
            prev: navigator.current.prev,
        },
    };
}
