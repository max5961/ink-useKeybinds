import React from "react";

/*
 * This won't catch boolean, string, number types but that way errors will
 * fall through and be easier to trace
 * */
export function isRenderable(val: Function | React.ReactNode): boolean {
    if (React.isValidElement(val)) {
        return true;
    } else if (val === null) {
        return true;
    } else if (typeof val !== "object" && typeof val !== "function") {
        return true;
    } else {
        return false;
    }
}

// WAS OVERTHINKING IT BUT JUST IN CASE
// function isRenderable(val: Function | React.ReactNode): boolean {
//     if (typeof val === "function") {
//         if (React.isValidElement(val)) throw new Error("!");
//         return false;
//     }
//
//     if (val !== null && typeof val === "object") {
//         const sym = (val as any).$$typeof;
//
//         if (sym === Symbol.for("react.memo")) {
//             if (React.isValidElement(val)) throw new Error("!");
//             return false;
//         }
//
//         if (sym === Symbol.for("react.forward_ref")) {
//             if (React.isValidElement(val)) throw new Error("!");
//             return false;
//         }
//     }
//
//     return true;
// }
