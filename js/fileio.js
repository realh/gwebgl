import GLib from "gi://GLib";

const byteArray = imports.byteArray;

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
