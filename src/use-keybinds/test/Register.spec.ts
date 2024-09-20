import { describe, it, expect } from "vitest";
import Register from "../Register.js";
import { KeyBinds } from "../useKeybinds.js";
import { KEYCODES } from "../Keycodes.js";

const ctrl_plus_letters = {
    ctrlA: { key: "ctrl", input: "a" },
    ctrlB: { key: "ctrl", input: "b" },
    ctrlC: { key: "ctrl", input: "c" },
    ctrlD: { key: "ctrl", input: "d" },
    ctrlE: { key: "ctrl", input: "e" },
    ctrlF: { key: "ctrl", input: "f" },
    ctrlG: { key: "ctrl", input: "g" },
    ctrlH: { key: "ctrl", input: "h" },
    ctrlI: { key: "ctrl", input: "i" },
    ctrlJ: { key: "ctrl", input: "j" },
    ctrlK: { key: "ctrl", input: "k" },
    ctrlL: { key: "ctrl", input: "l" },
    ctrlM: { key: "ctrl", input: "m" },
    ctrlN: { key: "ctrl", input: "n" },
    ctrlO: { key: "ctrl", input: "o" },
    ctrlP: { key: "ctrl", input: "p" },
    ctrlQ: { key: "ctrl", input: "q" },
    ctrlR: { key: "ctrl", input: "r" },
    ctrlS: { key: "ctrl", input: "s" },
    ctrlT: { key: "ctrl", input: "t" },
    ctrlU: { key: "ctrl", input: "u" },
    ctrlV: { key: "ctrl", input: "v" },
    ctrlW: { key: "ctrl", input: "w" },
    ctrlX: { key: "ctrl", input: "x" },
    ctrlY: { key: "ctrl", input: "y" },
    ctrlZ: { key: "ctrl", input: "z" },
} satisfies KeyBinds;

describe("ctrl + lowercase a - z", () => {
    it(`ctrl + a`, () => {
        Register.handleKeypress("\u0001");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlA");
    });
    it("ctrl + b", () => {
        Register.handleKeypress("\u0002");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlB");
    });
    // ------ This will trigger a SIGINT -----
    // it("ctrl + c", () => {
    //     Register.handleKeypress("\u0003");
    //     Register.processConfig(ctrl_plus_letters);
    //     console.log(Register.getEvent());
    //     expect(Register.getEvent()).toBe("ctrlC");
    // });
    it("ctrl + d", () => {
        Register.handleKeypress("\u0004");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlD");
    });
    it("ctrl + e", () => {
        Register.handleKeypress("\u0005");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlE");
    });
    it("ctrl + f", () => {
        Register.handleKeypress("\u0006");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlF");
    });
    it("ctrl + g", () => {
        Register.handleKeypress("\u0007");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlG");
    });
    it("ctrl + h", () => {
        Register.handleKeypress("\u0008");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlH");
    });
    it("ctrl + i", () => {
        Register.handleKeypress("\u0009");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlI");
    });
    it("ctrl + j", () => {
        Register.handleKeypress("\u000A");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlJ");
    });
    it("ctrl + k", () => {
        Register.handleKeypress("\u000B");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlK");
    });
    it("ctrl + l", () => {
        Register.handleKeypress("\u000C");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlL");
    });
    it("ctrl + m", () => {
        Register.handleKeypress("\u000D");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlM");
    });
    it("ctrl + n", () => {
        Register.handleKeypress("\u000E");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlN");
    });
    it("ctrl + o", () => {
        Register.handleKeypress("\u000F");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlO");
    });
    it("ctrl + p", () => {
        Register.handleKeypress("\u0010");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlP");
    });
    it("ctrl + q", () => {
        Register.handleKeypress("\u0011");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlQ");
    });
    it("ctrl + r", () => {
        Register.handleKeypress("\u0012");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlR");
    });
    it("ctrl + s", () => {
        Register.handleKeypress("\u0013");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlS");
    });
    it("ctrl + t", () => {
        Register.handleKeypress("\u0014");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlT");
    });
    it("ctrl + u", () => {
        Register.handleKeypress("\u0015");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlU");
    });
    it("ctrl + v", () => {
        Register.handleKeypress("\u0016");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlV");
    });
    it("ctrl + w", () => {
        Register.handleKeypress("\u0017");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlW");
    });
    it("ctrl + x", () => {
        Register.handleKeypress("\u0018");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlX");
    });
    it("ctrl + y", () => {
        Register.handleKeypress("\u0019");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlY");
    });
    it("ctrl + z", () => {
        Register.handleKeypress("\u001A");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getEvent()).toBe("ctrlZ");
    });
});

describe("special key presses clear char register", () => {
    it("backspace", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.backspace);
        expect(Register.getCharRegister()).toBe("");
    });
    it("delete", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.delete);
        expect(Register.getCharRegister()).toBe("");
    });
    it("esc", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.esc);
        expect(Register.getCharRegister()).toBe("");
    });
    it("insert", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.insert);
        expect(Register.getCharRegister()).toBe("");
    });
    it("return", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.return);
        expect(Register.getCharRegister()).toBe("");
    });
    it("tab", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.tab);
        expect(Register.getCharRegister()).toBe("");
    });
    it("up", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.up);
        expect(Register.getCharRegister()).toBe("");
    });
    it("down", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.down);
        expect(Register.getCharRegister()).toBe("");
    });
    it("left", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.left);
        expect(Register.getCharRegister()).toBe("");
    });
    it("right", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.right);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f1", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f1);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f2", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f2);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f3", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f3);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f4", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f4);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f5", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f5);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f6", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f6);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f7", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f7);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f8", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f8);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f9", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f9);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f10", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f10);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f11", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f11);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f12", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(KEYCODES.f12);
        expect(Register.getCharRegister()).toBe("");
    });
});

const foobar = {
    foo: [{ input: "f" }, { input: "F" }, { input: "!@" }, { input: "#$" }],
    bar: [{ key: "ctrl", input: "b" }, { input: "bb" }, { input: "%^" }],
    baz: [{ key: "f1" }, { input: "Ba" }],
    quz: [{ input: "qQ" }, { input: "QQ" }],
} satisfies KeyBinds;

describe("Keybinds trigger commands correctly and clear char register after", () => {
    // foo
    it("'f' triggers 'foo'", () => {
        Register.handleKeypress("f");
        Register.processConfig(foobar);
        expect(Register.getEvent()).toBe("foo");
    });
    it("'F' triggers 'foo'", () => {
        Register.handleKeypress("F");
        Register.processConfig(foobar);
        expect(Register.getEvent()).toBe("foo");
    });
    it("'!@' triggers 'foo'", () => {
        Register.handleKeypress("!");
        Register.handleKeypress("@");
        Register.processConfig(foobar);
        expect(Register.getEvent()).toBe("foo");
    });
    it("'#$' triggers 'foo'", () => {
        Register.handleKeypress("#");
        Register.handleKeypress("$");
        Register.processConfig(foobar);
        expect(Register.getEvent()).toBe("foo");
    });

    // bar
    it("'ctrl + b' triggers 'bar'", () => {
        Register.handleKeypress("\u0002");
        Register.processConfig(foobar);
        expect(Register.getEvent()).toBe("bar");
    });
    it("'bb' triggers 'bar'", () => {
        Register.handleKeypress("b");
        Register.handleKeypress("b");
        Register.processConfig(foobar);
        expect(Register.getEvent()).toBe("bar");
    });
    it("'%^' triggers 'bar'", () => {
        Register.handleKeypress("%");
        Register.handleKeypress("^");
        Register.processConfig(foobar);
        expect(Register.getEvent()).toBe("bar");
    });

    // baz
    it("'f1' triggers 'baz'", () => {
        Register.handleKeypress(KEYCODES.f1);
        Register.processConfig(foobar);
        expect(Register.getEvent()).toBe("baz");
    });
    it("'Ba' triggers 'baz'", () => {
        Register.handleKeypress("B");
        Register.handleKeypress("a");
        Register.processConfig(foobar);
        expect(Register.getEvent()).toBe("baz");
    });

    // quz
    it("'qQ' triggers 'quz'", () => {
        Register.handleKeypress("q");
        Register.handleKeypress("Q");
        Register.processConfig(foobar);
        expect(Register.getEvent()).toBe("quz");
    });
    it("'QQ' triggers 'quz'", () => {
        Register.handleKeypress("Q");
        Register.handleKeypress("Q");
        Register.processConfig(foobar);
        expect(Register.getEvent()).toBe("quz");
    });
});

describe("notKey, notInput, and empty object", () => {
    it("empty object should trigger on any key press", () => {
        Register.handleKeypress("a");
        Register.processConfig({ press_any_key: {} });
        expect(Register.getEvent()).toBe("press_any_key");
    });

    const cfg1 = {
        not_esc_or_return: { notKey: ["esc", "return"] },
        esc_or_return: [{ key: "esc" }, { key: "return" }],
    } satisfies KeyBinds;

    it("anything but escape or return triggers command", () => {
        Register.handleKeypress("b");
        Register.processConfig(cfg1);
        expect(Register.getEvent()).toBe("not_esc_or_return");
    });

    it("esc or return triggers command", () => {
        Register.handleKeypress(KEYCODES.esc);
        Register.processConfig(cfg1);
        expect(Register.getEvent()).toBe("esc_or_return");
    });

    it("any key but 'a'", () => {
        Register.handleKeypress("b");
        Register.processConfig({ not_a: { notInput: ["a"] } });
        expect(Register.getEvent()).toBe("not_a");
    });
});
