import { jdFromRd } from "../../pivot";
import { rdFromIslamic } from "../../calendars/islamic";

// Arithmetic Islamic dates — actual observances may shift by a day depending
// on lunar sighting in different regions. v2 adds an astronomical option.
export function eidAlFitr(islamicYear: number): number {
  return jdFromRd(rdFromIslamic(islamicYear, 10, 1));
}

export function eidAlAdha(islamicYear: number): number {
  return jdFromRd(rdFromIslamic(islamicYear, 12, 10));
}

export function ramadanStart(islamicYear: number): number {
  return jdFromRd(rdFromIslamic(islamicYear, 9, 1));
}
