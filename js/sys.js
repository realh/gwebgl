// Anything that depends on the underlying platform goes here so it can be
// swapped out. This version runs on gjs/gi, but forks might prefer to use
// node.
import GLib from 'gi://GLib';

const byteArray = imports.byteArray;

// gjs is going to support TextEncoder/TextDecoder, but it's probably not
// available in mainstream releases yet
export function bytesToString(b) {
    return byteArray.toString(b);
}

export function stringToBytes(s) {
    return byteArray.fromString(s);
}

export function loadText(fileName) {
    const b = GLib.file_get_contents(fileName)[1];
    return bytesToString(b);
}

export function saveText(fileName, text) {
    const b = stringToBytes(text);
    GLib.file_set_contents(fileName, b);
}

export function mkDirWithParents(dirname) {
    GLib.mkdir_with_parents(dirname, 0o755);
}

// Command line arguments excluding the runner (eg 'gjs') and script filename
export const cmdArgs = ARGV;

// gjs doesn't have console (yet) either
export const consoleLog = globalThis.log;
export const consolePrint = globalThis.print;
export const consoleError = globalThis.logError;

export function consoleWarn(...args) {
    printerr('WARNING:', ...args);
}
