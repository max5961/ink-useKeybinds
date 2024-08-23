import { Key } from "ink";
import { KbConfig, Command, Binding } from "./useKeybinds.js";
import EventEmitter from "events";

export class KeyBinds<T extends KbConfig = KbConfig> {
    private config: T;
    private register: string;
    private command: Command<T> | null;
    private keyRegister: string;

    constructor(config: T) {
        this.register = "";
        this.keyRegister = "";
        this.command = null;
        this.config = config;
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

    private setCommand(command: Command<T>): void {
        this.clearRegister();
        this.command = command;
    }

    getCommand(): Command<T> | null {
        return this.command;
    }

    getRegister(): string {
        return this.register;
    }

    getKeyRegister(): string {
        return this.keyRegister;
    }

    handleStdIn(input: string, key: Key): void {
        this.clearCommand();
        this.pushRegister(input);

        for (const objKey in this.config) {
            const binding = this.config[objKey];

            if (Array.isArray(binding)) {
                for (const b of binding) {
                    const match = this.checkMatch(b, key);
                    if (match) return this.setCommand(objKey as Command<T>);
                }
            } else {
                const match = this.checkMatch(binding as Binding, key);
                if (match) return this.setCommand(objKey as Command<T>);
            }
        }
    }

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
