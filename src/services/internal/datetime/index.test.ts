import { test, expect } from "@jest/globals";
import {
   getBiweeklyOccurrenceLength,
   getNumberOfDaysInMonth,
   getWeeklyOccurrenceLength
} from ".";

/**
 * dayOfWeek 0-6
 * month 0-11
 */

test("31 days in January, 2021", () => {
   expect(getNumberOfDaysInMonth(0, 2021)).toBe(31);
});

test("30 days in April, 2021", () => {
   expect(getNumberOfDaysInMonth(3, 2021)).toBe(30);
});

test("Biweekly occurrences of Monday in February, 2021", () => {
   expect(getBiweeklyOccurrenceLength(1, 1, 2021)).toBe(2);
});

test("Biweekly occurrences of Monday in February, 2020 (Leap year)", () => {
   expect(getBiweeklyOccurrenceLength(1, 1, 2020)).toBe(2);
});

test("Biweekly occurrences of Saturday in May, 2020", () => {
   expect(getBiweeklyOccurrenceLength(6, 4, 2020)).toBe(3);
});

test("Weekly occurrences of Saturday in May, 2020", () => {
   expect(getWeeklyOccurrenceLength(6, 4, 2020)).toBe(5);
});

test("Weekly occurrences of Wednesday in July, 2011", () => {
   expect(getWeeklyOccurrenceLength(3, 6, 2011)).toBe(4);
});

test("Weekly occurrences of Wednesday in February, 2012", () => {
   expect(getWeeklyOccurrenceLength(3, 1, 2012)).toBe(5);
});
