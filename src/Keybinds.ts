import { KbConfig, Binding } from "./useKeybinds.js";
import EventEmitter from "events";
import { Key } from "./InputStream.js";

export class KeyBinds {
    private register: string;
    private command: string | null;
    private keyRegister: string;
    private specKeyMap!: Key;
    private emitter: EventEmitter;

    constructor(emitter: EventEmitter) {
        this.register = "";
        this.keyRegister = "";
        this.command = null;
        this.specKeyMap = this.newSpecKeyMap();
        this.emitter = emitter;
    }

    private clearCommand(): void {
        this.command = null;
    }

    private clearRegister(): void {
        this.register = "";
    }

    private pushRegister(char: string): void {
        if (this.register.length >= 2) {
            this.clearRegister();
        }

        this.register += char;
    }

    private clearSpecKeyMap(): void {
        this.specKeyMap = this.newSpecKeyMap();
    }

    private setCommand(command: string): void {
        /* For obvious reasons, but also to prevent other instances of the
         * useKeybinds hook from triggering the same command.  Commands can
         * overwrite eachother depending on which hook is executed first */
        this.clearRegister();
        this.clearSpecKeyMap();

        this.command = command;
    }

    private newSpecKeyMap(): Key {
        return {
            delete: false,
            backspace: false,
            return: false,
            esc: false,
            up: false,
            down: false,
            left: false,
            right: false,
            tab: false,
            ctrl: false,
        };
    }

    getCommand(): string | null {
        return this.command;
    }

    getRegister(): string {
        return this.register;
    }

    getKeyRegister(): string {
        return this.keyRegister;
    }

    /* This is the StdInEmitter.on "input" callback */
    handleStdin(input: string, specKeyMap: Omit<Key, "esc">): void {
        // ...read stdin and update class state
        input && this.pushRegister(input);
        this.specKeyMap = { ...specKeyMap, esc: false };
        this.emitter.emit("NEW_DATA");
    }

    handleEscStdin(isPress: boolean): void {
        if (isPress) {
            this.specKeyMap = { ...this.newSpecKeyMap(), esc: true };
            this.clearRegister();
            this.emitter.emit("NEW_DATA");
        }
    }

    /* useKeybinds hook will subscribe itself to "new input recieved" */
    subscribe(listener) {
        this.emitter.removeListener("NEW_DATA", listener);
        this.emitter.on("NEW_DATA", listener);
        return () => {
            this.emitter.removeListener("NEW_DATA", listener);
        };
    }

    handleNormalCharInput(input: string) {
        this.clearCommand();
        this.pushRegister(input);
    }

    /* Main function.  Executed inside of useKeybinds hook on NEW_DATA event.  The
     * hook can then retrieve the data from the KeyBinds object */
    processKeybinds(config: KbConfig): void {
        for (const objKey in config) {
            const binding = config[objKey];

            if (Array.isArray(binding)) {
                for (const b of binding) {
                    const match = this.checkMatch(b, this.specKeyMap);
                    if (match) return this.setCommand(objKey);
                }
            } else {
                const match = this.checkMatch(
                    binding as Binding,
                    this.specKeyMap,
                );
                if (match) return this.setCommand(objKey);
            }
        }
    }

    // Need to change this to check key to keyMapping object that is created on input
    private checkMatch(binding: Binding, key: Key): boolean {
        // Prevent ctrl + f triggering 'f'
        if (key.ctrl) {
            return this.checkSpecialKeyMatch(binding, key);
        }

        // Char input only
        if (!binding.key && binding.input) {
            return this.register === binding.input;
        }

        return this.checkSpecialKeyMatch(binding, key);
    }

    private checkSpecialKeyMatch(binding: Binding, key: Key): boolean {
        if (binding.key && binding.input) {
            return key[binding.key] && this.register === binding.input;
        }

        // Special key only
        if (binding.key && !binding.input) {
            return key[binding.key];
        }

        return false;
    }
}
