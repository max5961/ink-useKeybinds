// import { Key } from "./KeypressRegister.js";
// import { KbConfig } from "./useKeybinds.js";
// import EventEmitter from "events";
//
// class InputRegister extends EventEmitter {
//     private listening: boolean;
//     private charRegister: string;
//     private keyRegister: Key;
//     private command: string | null;
//     private shouldProcess: boolean;
//
//     constructor() {
//         super();
//         this.listening = false;
//         this.charRegister = "";
//         this.keyRegister = newKeyRegister();
//         this.command = null;
//         this.shouldProcess = true;
//     }
//
//     public subscribe(listener) {
//         this.addListener("KEY_DOWN", listener);
//
//         return () => {
//             this.removeListener("KEY_DOWN", listener);
//             /* Will pause listening if there are no KEY_DOWN event listeners
//              * synchronously added after removing */
//             this.emit("APP_STATUS");
//         };
//     }
//
//     public getCommand(): string | null {
//         return this.command;
//     }
//
//     private setCommand(command: string): void {
//         this.command = command;
//
//         /* Setting these would prevent more deeply nested useKeybinds hooks from
//          * properly responding to KEY_DOWN events */
//         // this.register = "";
//         // this.keyRegister = newKeyRegister();
//     }
//
//     public setShouldProcess(b: boolean): void {
//         this.shouldProcess = b;
//     }
//
//     /* Doesn't modify anything, just checks to see if the register and keyRegister
//      * match anything in the config, in which case the command is updated */
//     public processKeybinds(config: KbConfig): void {
//         if (!this.shouldProcess) return;
//
//         for (const command in config) {
//             const binding = config[command];
//
//             let match: boolean = false;
//             if (Array.isArray(binding)) {
//                 match = binding.some((b) => this.checkMatch(b));
//             } else {
//                 match = this.checkMatch(binding);
//             }
//
//             if (match) return this.setCommand(command);
//         }
//     }
//
//     private checkMatch(binding: Binding): boolean {
//         // Prevent ctrl + f triggering 'f' for example
//         if (this.keyRegister.ctrl) {
//             if (binding.key && binding.input) {
//                 return (
//                     this.keyRegister[binding.key] &&
//                     this.charRegister === binding.input
//                 );
//             }
//
//             // Special key only
//             if (binding.key && !binding.input) {
//                 return this.keyRegister[binding.key];
//             }
//
//             return false;
//         }
//
//         if (binding.key && binding.input) {
//             return (
//                 this.keyRegister[binding.key] &&
//                 this.charRegister === binding.input
//             );
//         }
//
//         // Char input only
//         if (!binding.key && binding.input) {
//             return this.charRegister === binding.input;
//         }
//
//         return false;
//     }
//
//     private pushRegister(s: string): void {
//         if (this.charRegister.length >= 2) {
//             this.charRegister = "";
//         }
//         this.charRegister += s;
//     }
//
//     private handleKeypress = (input: string, key: ReadlineKey): void => {
//         this.command = null;
//
//         // SIGINT
//         if (key.ctrl && input === "c") {
//             this.removeAllListeners();
//             process.stdin.pause();
//             process.exit();
//         }
//
//         /* Update state then process the state */
//         input && this.pushRegister(input);
//         this.keyRegister = {
//             esc: false,
//             ctrl: key.ctrl,
//             backspace: key.name === "backspace",
//             return: key.name === "return",
//             delete: key.name === "delete",
//             tab: key.name === "tab",
//             up: key.name === "up",
//             down: key.name === "down",
//             left: key.name === "left",
//             right: key.name === "right",
//         } satisfies Key;
//
//         this.emit("KEY_DOWN");
//     };
//
//     /* emitKeypressEvents has a significant delay when processing ESC keypresses
//      * so this is the callback for the process.stdin.on("data", cb); instead which
//      * processes it normally. */
//     private handleEscKeypress = (key: string): void => {
//         this.command = null;
//
//         if (key !== ESCAPE_KEY) {
//             return;
//         }
//
//         /* Clear register and keyRegister for ESC only */
//         this.charRegister = "";
//         this.keyRegister = { ...newKeyRegister(), esc: true };
//
//         this.emit("KEY_DOWN");
//     };
//
//     listen = (): void => {
//         if (this.listening) {
//             return;
//         }
//
//         process.stdin.on("keypress", this.handleKeypress);
//         process.stdin.on("data", this.handleEscKeypress);
//         this.on("APP_STATUS", this.handleAppStatus);
//
//         this.listening = true;
//     };
//
//     private pause = (): void => {
//         process.stdin.removeListener("keypress", this.handleKeypress);
//         process.stdin.removeListener("data", this.handleEscKeypress);
//         this.removeListener("APP_STATUS", this.handleAppStatus);
//
//         this.listening = false;
//     };
//
//     /* Since keeping listeners running would */
//     private handleAppStatus = (): void => {
//         if (this.listeners("KEY_DOWN").length === 0) {
//             this.pause();
//         }
//     };
// }
//
// function newKeyRegister(): Key {
//     return {
//         esc: false,
//         ctrl: false,
//         backspace: false,
//         return: false,
//         delete: false,
//         tab: false,
//         up: false,
//         down: false,
//         left: false,
//         right: false,
//     };
// }
//
// type ReadlineKey = { name: KeyName; ctrl: boolean };
// type KeyName =
//     | "ctrl"
//     | "backspace"
//     | "delete"
//     | "tab"
//     | "up"
//     | "down"
//     | "left"
//     | "right"
//     | "return"
//     | "esc";
