import { useEffect, useRef, useState } from "react";
import { Key, KB } from "./InputStream.js";

export default function useKeybinds<T extends KbConfig = any>(
    handler: (cmd: Command<typeof kbConfig> | null) => void,
    kbConfig: T,
    opts?: UseKbOpts,
): Data<T> {
    /* Set default opts but override if provided */
    opts = { trackState: false, pause: false, ...opts };

    const [data, setData] = useState<Data<T>>({
        register: "",
        command: "",
    });

    const unsubscribers = useRef<(() => void)[]>([]);

    useEffect(() => {
        const unsubscribe = KB.subscribe(getKeybindState);
        unsubscribers.current.push(unsubscribe);
        return () => {
            unsubscribers.current.forEach((u) => {
                u();
            });
        };
    }, []); // only on mount/unmount (on trackState change would cause excess listeners )

    function getKeybindState() {
        KB.processKeybinds(kbConfig);

        const register = KB.getRegister() || "";
        const command = KB.getCommand() || null;

        handler(command);

        if (opts?.trackState) {
            setData({
                ...data,
                register,
                command: command ?? "",
            });
        }
    }

    return data;
}

export type KbHandler<T extends KbConfig = any> = (
    cmd: Command<T> | null,
) => void;

export type KbConfig = {
    [key: string]: Binding[] | Binding;
};

export type Binding = { key?: keyof Key; input?: string };

export type UseKbOpts = {
    /* Default false. returns { register: string; command: string }
     * 'register' stores the last 1-2 alphanumeric key presses and is wiped out
     * when a command is matched
     * 'command' is the last command to have been matched */
    trackState?: boolean;

    /* Default false. Toggle this hooks ability to respond to std input */
    pause?: boolean;
};

type Data<T extends KbConfig> = {
    register: string;
    command: Command<T> | "";
};

export type Command<T extends Readonly<KbConfig>> = keyof T;

export type Handler<T extends KbConfig = any> = (
    cmd: Command<T> | null,
) => void;
