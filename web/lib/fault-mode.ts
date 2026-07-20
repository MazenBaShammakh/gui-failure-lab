export type FaultMode = "baseline" | "faulty";

const DEFAULT_MODE: FaultMode = "baseline";
// const DEFAULT_MODE: FaultMode = "faulty";

function isFaultMode(value: string | undefined): value is FaultMode {
    return value === "baseline" || value === "faulty";
}

// Global baseline/faulty switch, resolved server-side from FAULT_MODE (set via
// .env.local or the process environment). Every route serves a single URL per
// failure; the benchmark harness selects the condition by running the app
// with a given FAULT_MODE rather than by visiting a different path. Deliberately
// NOT read from a client-side store (localStorage/cookies) — this needs to be
// correct in the server-rendered HTML itself, before any client JS runs, since
// several failures in this lab are specifically about what's in the DOM/a11y
// tree as delivered.
export function getFaultMode(): FaultMode {
    return isFaultMode(process.env.FAULT_MODE)
        ? process.env.FAULT_MODE
        : DEFAULT_MODE;
}

export function isFaultActive(): boolean {
    return getFaultMode() === "faulty";
}
