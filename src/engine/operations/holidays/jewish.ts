import { jdFromRd } from "../../pivot";
import { rdFromHebrew } from "../../calendars/hebrew";

// Hebrew dates are fixed in the Hebrew calendar; Gregorian dates wander.
export function roshHashanah(hebrewYear: number): number {
  return jdFromRd(rdFromHebrew(hebrewYear, 7, 1));
}

export function passover(hebrewYear: number): number {
  return jdFromRd(rdFromHebrew(hebrewYear, 1, 15));
}

export function yomKippur(hebrewYear: number): number {
  return jdFromRd(rdFromHebrew(hebrewYear, 7, 10));
}
