export function equalInitializers(a: string[][], b: string[][]): boolean {
    if (a.length !== b.length) return false;

    for (let y = 0; y < a.length; ++y) {
        if (a[y].length !== b[y].length) return false;

        for (let x = 0; x < a[y].length; ++x) {
            if (a[y][x] !== b[y][x]) return false;
        }
    }

    return true;
}
