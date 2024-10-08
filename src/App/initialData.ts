import { KeyBinds } from "../use-keybinds/useKeybinds.js";
import { randomUUID } from "crypto";

export type Item = {
    id: string;
    name: string;
    completed: boolean;
};

export const initialItems: Item[] = [
    { id: randomUUID(), name: "apple", completed: false },
    { id: randomUUID(), name: "banana", completed: false },
    { id: randomUUID(), name: "pear", completed: false },
    { id: randomUUID(), name: "milk", completed: false },
    { id: randomUUID(), name: "eggs", completed: false },
    { id: randomUUID(), name: "cereal", completed: false },
    { id: randomUUID(), name: "watermelon", completed: false },
    { id: randomUUID(), name: "pizza", completed: false },
    { id: randomUUID(), name: "ice cream", completed: false },
    { id: randomUUID(), name: "chips", completed: false },
    { id: randomUUID(), name: "soda", completed: false },
    { id: randomUUID(), name: "raisin bran", completed: false },
    { id: randomUUID(), name: "capn crunch", completed: false },
    { id: randomUUID(), name: "cantelope", completed: false },
    { id: randomUUID(), name: "bread", completed: false },
    { id: randomUUID(), name: "frozen pizzas", completed: false },
    { id: randomUUID(), name: "candy", completed: false },
    { id: randomUUID(), name: "pasta", completed: false },
];

export const keybinds = {
    quit: { input: "q" },
} satisfies KeyBinds;
