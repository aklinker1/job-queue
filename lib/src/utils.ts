import { sep } from "node:path";
import { serializeError } from "serialize-error";
import process from "node:process";

export function stringifyError(err: unknown): string {
  return JSON.stringify(serializeError(err)).replaceAll(
    process.cwd() + sep,
    "",
  ).replaceAll("file://", "");
}
