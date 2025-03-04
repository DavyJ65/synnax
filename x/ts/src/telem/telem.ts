// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { z } from "zod";

import { type Stringer } from "@/primitive";
import { addSamples } from "@/telem/series";

export type TZInfo = "UTC" | "local";

export type TimeStampStringFormat =
  | "ISO"
  | "ISODate"
  | "ISOTime"
  | "time"
  | "preciseTime"
  | "date"
  | "shortDate"
  | "dateTime";

export type DateComponents = [number?, number?, number?];

const remainder = <T extends TimeStamp | TimeSpan>(
  value: T,
  divisor: TimeSpan | TimeStamp,
): T => {
  const ts = new TimeStamp(divisor);
  if (
    ![
      TimeSpan.DAY,
      TimeSpan.HOUR,
      TimeSpan.MINUTE,
      TimeSpan.SECOND,
      TimeSpan.MILLISECOND,
      TimeSpan.MICROSECOND,
      TimeSpan.NANOSECOND,
    ].some((s) => s.equals(ts))
  ) {
    throw new Error(
      "Invalid argument for remainder. Must be an even TimeSpan or Timestamp",
    );
  }
  const v = value.valueOf() % ts.valueOf();
  return (value instanceof TimeStamp ? new TimeStamp(v) : new TimeSpan(v)) as T;
};

/**
 * Represents a UTC timestamp. Synnax uses a nanosecond precision int64 timestamp.
 *
 * DISCLAIMER: JavaScript stores all numbers as 64-bit floating point numbers, so we expect a
 * expect a precision drop from nanoseconds to quarter microseconds when communicating
 * with the server. If this is a problem, please file an issue with the Synnax team.
 * Caveat emptor.
 *
 * @param value - The timestamp value to parse. This can be any of the following:
 *
 * 1. A number representing the number of milliseconds since the Unix epoch.
 * 2. A javascript Date object.
 * 3. An array of numbers satisfying the DateComponents type, where the first element is the
 *   year, the second is the month, and the third is the day. To increaase resolution
 *   when using this method, use the add method. It's important to note that this initializes
 *   a timestamp at midnight UTC, regardless of the timezone specified.
 * 4. An ISO compliant date or date time string. The time zone component is ignored.
 *
 * @param tzInfo - The timezone to use when parsing the timestamp. This can be either "UTC" or
 * "local". This parameter is ignored if the value is a Date object or a DateComponents array.
 *
 * @example ts = new TimeStamp(1 * TimeSpan.HOUR) // 1 hour after the Unix epoch
 * @example ts = new TimeStamp([2021, 1, 1]) // 1/1/2021 at midnight UTC
 * @example ts = new TimeStamp([2021, 1, 1]).add(1 * TimeSpan.HOUR) // 1/1/2021 at 1am UTC
 * @example ts = new TimeStamp("2021-01-01T12:30:00Z") // 1/1/2021 at 12:30pm UTC
 */
export class TimeStamp extends Number implements Stringer {
  constructor(value?: CrudeTimeStamp, tzInfo: TZInfo = "UTC") {
    if (value == null) return TimeStamp.now();
    else if (value instanceof Date)
      super(value.getTime() * TimeStamp.MILLISECOND.valueOf());
    else if (typeof value === "string")
      super(TimeStamp.parseDateTimeString(value, tzInfo).valueOf());
    else if (Array.isArray(value)) super(TimeStamp.parseDate(value));
    else {
      let offset = 0;
      if (value instanceof Number) value = value.valueOf();
      if (tzInfo === "local") offset = TimeStamp.utcOffset.valueOf();
      super(value.valueOf() + offset);
    }
  }

  private static parseDate([year = 1970, month = 1, day = 1]: DateComponents): number {
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);
    // We truncate here to only get the date component regardless of the time zone.
    return new TimeStamp(date.getTime() * TimeStamp.MILLISECOND.valueOf())
      .truncate(TimeStamp.DAY)
      .valueOf();
  }

  private static parseTimeString(time: string, tzInfo: TZInfo = "UTC"): number {
    const [hours, minutes, mbeSeconds] = time.split(":");
    let seconds = "00";
    let milliseconds: string | undefined = "00";
    if (mbeSeconds != null) [seconds, milliseconds] = mbeSeconds.split(".");
    let base = TimeStamp.hours(parseInt(hours ?? "00", 10))
      .add(TimeStamp.minutes(parseInt(minutes ?? "00", 10)))
      .add(TimeStamp.seconds(parseInt(seconds ?? "00", 10)))
      .add(TimeStamp.milliseconds(parseInt(milliseconds ?? "00", 10)));
    if (tzInfo === "local") base = base.add(TimeStamp.utcOffset);
    return base.valueOf();
  }

  private static parseDateTimeString(str: string, tzInfo: TZInfo = "UTC"): number {
    if (!str.includes("/") && !str.includes("-"))
      return TimeStamp.parseTimeString(str, tzInfo);
    const d = new Date(str);
    // Essentialy to note that this makes the date midnight in UTC! Not local!
    // As a result, we need to add the tzInfo offset back in.
    if (!str.includes(":")) d.setUTCHours(0, 0, 0, 0);
    return new TimeStamp(
      d.getTime() * TimeStamp.MILLISECOND.valueOf(),
      tzInfo,
    ).valueOf();
  }

  fString(format: TimeStampStringFormat = "ISO", tzInfo: TZInfo = "UTC"): string {
    switch (format) {
      case "ISODate":
        return this.toISOString(tzInfo).slice(0, 10);
      case "ISOTime":
        return this.toISOString(tzInfo).slice(11, 23);
      case "time":
        return this.timeString(false, tzInfo);
      case "preciseTime":
        return this.timeString(true, tzInfo);
      case "date":
        return this.dateString(tzInfo);
      case "dateTime":
        return `${this.dateString(tzInfo)} ${this.timeString(false, tzInfo)}`;
      default:
        return this.toISOString(tzInfo);
    }
  }

  private toISOString(tzInfo: TZInfo = "UTC"): string {
    if (tzInfo === "UTC") return this.date().toISOString();
    return this.sub(TimeStamp.utcOffset).date().toISOString();
  }

  private timeString(milliseconds: boolean = false, tzInfo: TZInfo = "UTC"): string {
    const iso = this.toISOString(tzInfo);
    return milliseconds ? iso.slice(11, 23) : iso.slice(11, 19);
  }

  private dateString(tzInfo: TZInfo = "UTC"): string {
    const date = this.date();
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.toLocaleString("default", { day: "numeric" });
    return `${month} ${day}`;
  }

  static get utcOffset(): TimeSpan {
    return new TimeSpan(new Date().getTimezoneOffset() * TimeStamp.MINUTE.valueOf());
  }

  /**
   * @returns a TimeSpan representing the amount time elapsed since
   * the other timestamp.
   * @param other - The other timestamp.
   */
  static since(other: TimeStamp): TimeSpan {
    return new TimeStamp().span(other);
  }

  /** @returns A JavaScript Date object representing the TimeStamp. */
  date(): Date {
    return new Date(this.milliseconds());
  }

  /**
   * Checks if the TimeStamp is equal to another TimeStamp.
   *
   * @param other - The other TimeStamp to compare to.
   * @returns True if the TimeStamps are equal, false otherwise.
   */
  equals(other: CrudeTimeStamp): boolean {
    return this.valueOf() === new TimeStamp(other).valueOf();
  }

  /**
   * Creates a TimeSpan representing the duration between the two timestamps.
   *
   * @param other - The other TimeStamp to compare to.
   * @returns A TimeSpan representing the duration between the two timestamps.
   *   The span is guaranteed to be positive.
   */
  span(other: CrudeTimeStamp): TimeSpan {
    return this.range(other).span;
  }

  /**
   * Creates a TimeRange spanning the given TimeStamp.
   *
   * @param other - The other TimeStamp to compare to.
   * @returns A TimeRange spanning the given TimeStamp that is guaranteed to be
   *   valid, regardless of the TimeStamp order.
   */
  range(other: CrudeTimeStamp): TimeRange {
    return new TimeRange(this, other).makeValid();
  }

  /**
   * Creates a TimeRange starting at the TimeStamp and spanning the given
   * TimeSpan.
   *
   * @param other - The TimeSpan to span.
   * @returns A TimeRange starting at the TimeStamp and spanning the given
   *   TimeSpan. The TimeRange is guaranteed to be valid.
   */
  spanRange(other: CrudeTimeSpan): TimeRange {
    return this.range(this.add(other)).makeValid();
  }

  /**
   * Checks if the TimeStamp represents the unix epoch.
   *
   * @returns True if the TimeStamp represents the unix epoch, false otherwise.
   */
  get isZero(): boolean {
    return this.valueOf() === 0;
  }

  /**
   * Checks if the TimeStamp is after the given TimeStamp.
   *
   * @param other - The other TimeStamp to compare to.
   * @returns True if the TimeStamp is after the given TimeStamp, false
   *   otherwise.
   */
  after(other: CrudeTimeStamp): boolean {
    return this.valueOf() > new TimeStamp(other).valueOf();
  }

  /**
   * Checks if the TimeStamp is after or equal to the given TimeStamp.
   *
   * @param other - The other TimeStamp to compare to.
   * @returns True if the TimeStamp is after or equal to the given TimeStamp,
   *   false otherwise.
   */
  afterEq(other: CrudeTimeStamp): boolean {
    return this.valueOf() >= new TimeStamp(other).valueOf();
  }

  /**
   * Checks if the TimeStamp is before the given TimeStamp.
   *
   * @param other - The other TimeStamp to compare to.
   * @returns True if the TimeStamp is before the given TimeStamp, false
   *   otherwise.
   */
  before(other: CrudeTimeStamp): boolean {
    return this.valueOf() < new TimeStamp(other).valueOf();
  }

  /**
   * Checks if TimeStamp is before or equal to the current timestamp.
   *
   * @param other - The other TimeStamp to compare to.
   * @returns True if TimeStamp is before or equal to the current timestamp,
   *   false otherwise.
   */
  beforeEq(other: CrudeTimeStamp): boolean {
    return this.valueOf() <= new TimeStamp(other).valueOf();
  }

  /**
   * Adds a TimeSpan to the TimeStamp.
   *
   * @param span - The TimeSpan to add.
   * @returns A new TimeStamp representing the sum of the TimeStamp and
   *   TimeSpan.
   */
  add(span: CrudeTimeSpan): TimeStamp {
    return new TimeStamp(this.valueOf() + span.valueOf());
  }

  /**
   * Subtracts a TimeSpan from the TimeStamp.
   *
   * @param span - The TimeSpan to subtract.
   * @returns A new TimeStamp representing the difference of the TimeStamp and
   *   TimeSpan.
   */
  sub(span: CrudeTimeSpan): TimeStamp {
    return new TimeStamp(this.valueOf() - span.valueOf());
  }

  /**
   * @returns The number of milliseconds since the unix epoch.
   */
  milliseconds(): number {
    return this.valueOf() / TimeStamp.MILLISECOND.valueOf();
  }

  toString(): string {
    return this.date().toISOString();
  }

  /**
   * @returns A new TimeStamp that is the remainder of the TimeStamp divided by the
   * given span. This is useful in cases where you want only part of a TimeStamp's value
   * i.e. the hours, minutes, seconds, milliseconds, microseconds, and nanoseconds but
   * not the days, years, etc.
   *
   * @param divisor - The TimeSpan to divide by. Must be an even TimeSpan or TimeStamp. Even
   * means it must be a day, hour, minute, second, millisecond, or microsecond, etc.
   *
   * @example TimeStamp.now().remainder(TimeStamp.DAY) // => TimeStamp representing the current day
   */
  remainder(divisor: TimeSpan | TimeStamp): TimeStamp {
    return remainder(this, divisor);
  }

  truncate(span: TimeSpan | TimeStamp): TimeStamp {
    return this.sub(this.remainder(span));
  }

  /**
   * @returns A new TimeStamp representing the current time in UTC. It's important to
   * note that this TimeStamp is only accurate to the millisecond level (that's the best
   * JavaScript can do).
   */
  static now(): TimeStamp {
    return new TimeStamp(new Date());
  }

  /** @returns a new TimeStamp n nanoseconds after the unix epoch */
  static nanoseconds(value: number): TimeStamp {
    return new TimeStamp(value);
  }

  /* One nanosecond after the unix epoch */
  static readonly NANOSECOND = TimeStamp.nanoseconds(1);

  /** @returns a new TimeStamp n microseconds after the unix epoch */
  static microseconds(value: number): TimeStamp {
    return TimeStamp.nanoseconds(value * 1000);
  }

  /** One microsecond after the unix epoch */
  static readonly MICROSECOND = TimeStamp.microseconds(1);

  /** @returns a new TimeStamp n milliseconds after the unix epoch */
  static milliseconds(value: number): TimeStamp {
    return TimeStamp.microseconds(value * 1000);
  }

  /** One millisecond after the unix epoch */
  static readonly MILLISECOND = TimeStamp.milliseconds(1);

  /** @returns a new TimeStamp n seconds after the unix epoch */
  static seconds(value: number): TimeStamp {
    return TimeStamp.milliseconds(value * 1000);
  }

  /** One second after the unix epoch */
  static readonly SECOND = TimeStamp.seconds(1);

  /** @returns a new TimeStamp n minutes after the unix epoch */
  static minutes(value: number): TimeStamp {
    return TimeStamp.seconds(value * 60);
  }

  /** One minute after the unix epoch */
  static readonly MINUTE = TimeStamp.minutes(1);

  /** @returns a new TimeStamp n hours after the unix epoch */
  static hours(value: number): TimeStamp {
    return TimeStamp.minutes(value * 60);
  }

  /** One hour after the unix epoch */
  static readonly HOUR = TimeStamp.hours(1);

  /** @returns a new TimeStamp n days after the unix epoch */
  static days(value: number): TimeStamp {
    return TimeStamp.hours(value * 24);
  }

  /** One day after the unix epoch */
  static readonly DAY = TimeStamp.days(1);

  /** The maximum possible value for a timestamp */
  static readonly MAX = new TimeStamp(9122272036554776000);

  /** The minimum possible value for a timestamp */
  static readonly MIN = new TimeStamp(0);

  /** The unix epoch */
  static readonly ZERO = new TimeStamp(0);

  /** A zod schema for validating timestamps */
  static readonly z = z.union([
    z.instanceof(Number).transform((n) => new TimeStamp(n)),
    z.number().transform((n) => new TimeStamp(n)),
    z.instanceof(TimeStamp),
  ]);
}

/** TimeSpan represents a nanosecond precision duration. */
export class TimeSpan extends Number implements Stringer {
  constructor(value: CrudeTimeSpan) {
    if (value instanceof Number) super(value.valueOf());
    else super(value);
  }

  remainder(divisor: TimeSpan): TimeSpan {
    return remainder(this, divisor);
  }

  truncate(span: TimeSpan): TimeSpan {
    return new TimeSpan(Math.trunc(this.valueOf() / span.valueOf()) * span.valueOf());
  }

  toString(): string {
    const totalDays = this.truncate(TimeSpan.DAY);
    const totalHours = this.truncate(TimeSpan.HOUR);
    const totalMinutes = this.truncate(TimeSpan.MINUTE);
    const totalSeconds = this.truncate(TimeSpan.SECOND);
    const totalMilliseconds = this.truncate(TimeSpan.MILLISECOND);
    const totalMicroseconds = this.truncate(TimeSpan.MICROSECOND);
    const totalNanoseconds = this.truncate(TimeSpan.NANOSECOND);
    const days = totalDays;
    const hours = totalHours.sub(totalDays);
    const minutes = totalMinutes.sub(totalHours);
    const seconds = totalSeconds.sub(totalMinutes);
    const milliseconds = totalMilliseconds.sub(totalSeconds);
    const microseconds = totalMicroseconds.sub(totalMilliseconds);
    const nanoseconds = totalNanoseconds.sub(totalMicroseconds);

    let str = "";
    if (!days.isZero) str += `${days.days}d `;
    if (!hours.isZero) str += `${hours.hours}h `;
    if (!minutes.isZero) str += `${minutes.minutes}m `;
    if (!seconds.isZero) str += `${seconds.seconds}s `;
    if (!milliseconds.isZero) str += `${milliseconds.milliseconds}ms `;
    if (!microseconds.isZero) str += `${microseconds.microseconds}µs `;
    if (!nanoseconds.isZero) str += `${nanoseconds.nanoseconds}ns`;
    return str.trim();
  }

  /** @returns the decimal number of days in the timespan */
  get days(): number {
    return this.valueOf() / TimeSpan.DAY.valueOf();
  }

  /** @returns the decimal number of hours in the timespan */
  get hours(): number {
    return this.valueOf() / TimeSpan.HOUR.valueOf();
  }

  /** @returns the decimal number of minutes in the timespan */
  get minutes(): number {
    return this.valueOf() / TimeSpan.MINUTE.valueOf();
  }

  /** @returns The number of seconds in the TimeSpan. */
  get seconds(): number {
    return this.valueOf() / TimeSpan.SECOND.valueOf();
  }

  /** @returns The number of milliseconds in the TimeSpan. */
  get milliseconds(): number {
    return this.valueOf() / TimeSpan.MILLISECOND.valueOf();
  }

  get microseconds(): number {
    return this.valueOf() / TimeSpan.MICROSECOND.valueOf();
  }

  get nanoseconds(): number {
    return this.valueOf();
  }

  /**
   * Checks if the TimeSpan represents a zero duration.
   *
   * @returns True if the TimeSpan represents a zero duration, false otherwise.
   */
  get isZero(): boolean {
    return this.valueOf() === 0;
  }

  /**
   * Checks if the TimeSpan is equal to another TimeSpan.
   *
   * @returns True if the TimeSpans are equal, false otherwise.
   */
  equals(other: CrudeTimeSpan): boolean {
    return this.valueOf() === new TimeSpan(other).valueOf();
  }

  /**
   * Adds a TimeSpan to the TimeSpan.
   *
   * @returns A new TimeSpan representing the sum of the two TimeSpans.
   */
  add(other: CrudeTimeSpan): TimeSpan {
    return new TimeSpan(this.valueOf() + new TimeSpan(other).valueOf());
  }

  /**
   * Creates a TimeSpan representing the duration between the two timestamps.
   *
   * @param other
   */
  sub(other: CrudeTimeSpan): TimeSpan {
    return new TimeSpan(this.valueOf() - new TimeSpan(other).valueOf());
  }

  /**
   * Creates a TimeSpan representing the given number of nanoseconds.
   *
   * @param value - The number of nanoseconds.
   * @returns A TimeSpan representing the given number of nanoseconds.
   */
  static nanoseconds(value: number = 1): TimeSpan {
    return new TimeSpan(value);
  }

  /** A nanosecond. */
  static readonly NANOSECOND = TimeSpan.nanoseconds(1);

  /**
   * Creates a TimeSpan representing the given number of microseconds.
   *
   * @param value - The number of microseconds.
   * @returns A TimeSpan representing the given number of microseconds.
   */
  static microseconds(value: number = 1): TimeSpan {
    return TimeSpan.nanoseconds(value * 1000);
  }

  /** A microsecond. */
  static readonly MICROSECOND = TimeSpan.microseconds(1);

  /**
   * Creates a TimeSpan representing the given number of milliseconds.
   *
   * @param value - The number of milliseconds.
   * @returns A TimeSpan representing the given number of milliseconds.
   */
  static milliseconds(value: number = 1): TimeSpan {
    return TimeSpan.microseconds(value * 1000);
  }

  /** A millisecond. */
  static readonly MILLISECOND = TimeSpan.milliseconds(1);

  /**
   * Creates a TimeSpan representing the given number of seconds.
   *
   * @param value - The number of seconds.
   * @returns A TimeSpan representing the given number of seconds.
   */
  static seconds(value: number = 1): TimeSpan {
    return TimeSpan.milliseconds(value * 1000);
  }

  /** A second. */
  static readonly SECOND = TimeSpan.seconds(1);

  /**
   * Creates a TimeSpan representing the given number of minutes.
   *
   * @param value - The number of minutes.
   * @returns A TimeSpan representing the given number of minutes.
   */
  static minutes(value: number): TimeSpan {
    return TimeSpan.seconds(value.valueOf() * 60);
  }

  /** A minute. */
  static readonly MINUTE = TimeSpan.minutes(1);

  /**
   * Creates a TimeSpan representing the given number of hours.
   *
   * @param value - The number of hours.
   * @returns A TimeSpan representing the given number of hours.
   */
  static hours(value: number): TimeSpan {
    return TimeSpan.minutes(value * 60);
  }

  /** Represents an hour. */
  static readonly HOUR = TimeSpan.hours(1);

  /**
   * Creates a TimeSpan representing the given number of days.
   *
   * @param value - The number of days.
   * @returns A TimeSpan representing the given number of days.
   */
  static days(value: number): TimeSpan {
    return TimeSpan.hours(value * 24);
  }

  /** Represents a day. */
  static readonly DAY = TimeSpan.days(1);

  /** The maximum possible value for a TimeSpan. */
  static readonly MAX = new TimeSpan(this.MAX_SAFE_INTEGER);

  /** The minimum possible value for a TimeSpan. */
  static readonly MIN = new TimeSpan(-this.MAX_SAFE_INTEGER);

  /** The zero value for a TimeSpan. */
  static readonly ZERO = new TimeSpan(0);

  /** A zod schema for validating and transforming timespans */
  static readonly z = z.union([
    z.instanceof(Number).transform((n) => new TimeSpan(n)),
    z.number().transform((n) => new TimeSpan(n)),
    z.instanceof(TimeSpan),
  ]);
}

/** Rate represents a data rate in Hz. */
export class Rate extends Number implements Stringer {
  constructor(value: CrudeRate) {
    if (value instanceof Number) super(value.valueOf());
    else super(value);
  }

  /** @returns a pretty string representation of the rate in the format "X Hz". */
  toString(): string {
    return `${this.valueOf()} Hz`;
  }

  /** @returns The number of seconds in the Rate. */
  equals(other: CrudeRate): boolean {
    return this.valueOf() === new Rate(other).valueOf();
  }

  /**
   * Calculates the period of the Rate as a TimeSpan.
   *
   * @returns A TimeSpan representing the period of the Rate.
   */
  get period(): TimeSpan {
    return TimeSpan.seconds(1 / this.valueOf());
  }

  /**
   * Calculates the number of samples in the given TimeSpan at this rate.
   *
   * @param duration - The duration to calculate the sample count from.
   * @returns The number of samples in the given TimeSpan at this rate.
   */
  sampleCount(duration: CrudeTimeSpan): number {
    return new TimeSpan(duration).seconds * this.valueOf();
  }

  /**
   * Calculates the number of bytes in the given TimeSpan at this rate.
   *
   * @param span - The duration to calculate the byte count from.
   * @param density - The density of the data in bytes per sample.
   * @returns The number of bytes in the given TimeSpan at this rate.
   */
  byteCount(span: CrudeTimeSpan, density: CrudeDensity): number {
    return this.sampleCount(span) * new Density(density).valueOf();
  }

  /**
   * Calculates a TimeSpan given the number of samples at this rate.
   *
   * @param sampleCount - The number of samples in the span.
   * @returns A TimeSpan that corresponds to the given number of samples.
   */
  span(sampleCount: number): TimeSpan {
    return TimeSpan.seconds(sampleCount / this.valueOf());
  }

  /**
   * Calculates a TimeSpan given the number of bytes at this rate.
   *
   * @param size - The number of bytes in the span.
   * @param density - The density of the data in bytes per sample.
   * @returns A TimeSpan that corresponds to the given number of bytes.
   */
  byteSpan(size: Size, density: CrudeDensity): TimeSpan {
    return this.span(size.valueOf() / density.valueOf());
  }

  /**
   * Creates a Rate representing the given number of Hz.
   *
   * @param value - The number of Hz.
   * @returns A Rate representing the given number of Hz.
   */
  static hz(value: number): Rate {
    return new Rate(value);
  }

  /**
   * Creates a Rate representing the given number of kHz.
   *
   * @param value - The number of kHz.
   * @returns A Rate representing the given number of kHz.
   */
  static khz(value: number): Rate {
    return Rate.hz(value * 1000);
  }

  /** A zod schema for validating and transforming rates */
  static readonly z = z.union([
    z.number().transform((n) => new Rate(n)),
    z.instanceof(Number).transform((n) => new Rate(n)),
    z.instanceof(Rate),
  ]);
}

/** Density represents the number of bytes in a value. */
export class Density extends Number implements Stringer {
  /**
   * Creates a Density representing the given number of bytes per value.
   *
   * @class
   * @param value - The number of bytes per value.
   * @returns A Density representing the given number of bytes per value.
   */
  constructor(value: CrudeDensity) {
    if (value instanceof Number) super(value.valueOf());
    else super(value);
  }

  length(size: Size): number {
    return size.valueOf() / this.valueOf();
  }

  size(sampleCount: number): Size {
    return new Size(sampleCount * this.valueOf());
  }

  /** Unknown/Invalid Density. */
  static readonly UNKNOWN = new Density(0);

  /** 64 bits per value. */
  static readonly BIT64 = new Density(8);

  /** 32 bits per value. */
  static readonly BIT32 = new Density(4);

  /** 16 bits per value. */
  static readonly BIT16 = new Density(2);

  /** 8 bits per value. */
  static readonly BIT8 = new Density(1);

  /** A zod schema for validating and transforming densities */
  static readonly z = z.union([
    z.number().transform((n) => new Density(n)),
    z.instanceof(Number).transform((n) => new Density(n)),
    z.instanceof(Density),
  ]);
}

/**
 * TimeRange is a range of time marked by a start and end timestamp. A TimeRange
 * is start inclusive and end exclusive.
 *
 * @property start - A TimeStamp representing the start of the range.
 * @property end - A Timestamp representing the end of the range.
 */
export class TimeRange implements Stringer {
  /**
   * The starting TimeStamp of the TimeRange.
   *
   * Note that this value is not guaranteed to be before or equal to the ending value.
   * To ensure that this is the case, call TimeRange.make_valid().
   *
   * In most cases, operations should treat start as inclusive.
   */
  start: TimeStamp;

  /**
   * The starting TimeStamp of the TimeRange.
   *
   * Note that this value is not guaranteed to be before or equal to the ending value.
   * To ensure that this is the case, call TimeRange.make_valid().
   *
   * In most cases, operations should treat end as exclusive.
   */
  end: TimeStamp;

  /**
   * Creates a TimeRange from the given start and end TimeStamps.
   *
   * @param start - A TimeStamp representing the start of the range.
   * @param end - A TimeStamp representing the end of the range.
   */
  constructor(start: CrudeTimeStamp, end: CrudeTimeStamp) {
    this.start = new TimeStamp(start);
    this.end = new TimeStamp(end);
  }

  /** @returns The TimeSpan occupied by the TimeRange. */
  get span(): TimeSpan {
    return new TimeSpan(this.end.valueOf() - this.start.valueOf());
  }

  /**
   * Checks if the timestamp is valid i.e. the start is before the end.
   *
   * @returns True if the TimeRange is valid.
   */
  get isValid(): boolean {
    return this.start.valueOf() <= this.end.valueOf();
  }

  /**
   * Makes sure the TimeRange is valid i.e. the start is before the end.
   *
   * @returns A TimeRange that is valid.
   */
  makeValid(): TimeRange {
    return this.isValid ? this : this.swap();
  }

  /**
   * Checks if the TimeRange has a zero span.
   *
   * @returns True if the TimeRange has a zero span.
   */
  get isZero(): boolean {
    return this.span.isZero;
  }

  /**
   * Creates a new TimeRange with the start and end swapped.
   *
   * @returns A TimeRange with the start and end swapped.
   */
  swap(): TimeRange {
    return new TimeRange(this.end, this.start);
  }

  /**
   * Checks if the TimeRange is equal to the given TimeRange.
   *
   * @param other - The TimeRange to compare to.
   * @returns True if the TimeRange is equal to the given TimeRange.
   */
  equals(other: TimeRange): boolean {
    return this.start.equals(other.start) && this.end.equals(other.end);
  }

  toString(): string {
    return `${this.start.toString()} - ${this.end.toString()}`;
  }

  overlapsWith(other: TimeRange): boolean {
    other = other.makeValid();
    const rng = this.makeValid();
    if (other.start.equals(rng.start)) return true;
    if (other.end.equals(this.start) || other.start.equals(this.end)) return false;
    return (
      this.contains(other.end) ||
      this.contains(other.start) ||
      other.contains(this.start) ||
      other.contains(this.end)
    );
  }

  contains(other: TimeRange): boolean;

  contains(ts: CrudeTimeStamp): boolean;

  contains(other: TimeRange | CrudeTimeStamp): boolean {
    if (other instanceof TimeRange)
      return this.contains(other.start) && this.contains(other.end);
    return this.start.beforeEq(other) && this.end.after(other);
  }

  /** The maximum possible time range. */
  static readonly MAX = new TimeRange(TimeStamp.MIN, TimeStamp.MAX);

  /** The minimum possible time range. */
  static readonly MIN = new TimeRange(TimeStamp.MAX, TimeStamp.MIN);

  /** A zero time range. */
  static readonly ZERO = new TimeRange(TimeStamp.ZERO, TimeStamp.ZERO);

  /** A zod schema for validating and transforming time ranges */
  static readonly z = z.union([
    z
      .object({ start: TimeStamp.z, end: TimeStamp.z })
      .transform((v) => new TimeRange(v.start, v.end)),
    z.instanceof(TimeRange),
  ]);
}

/** DataType is a string that represents a data type. */
export class DataType extends String implements Stringer {
  constructor(value: CrudeDataType) {
    if (
      value instanceof DataType ||
      typeof value === "string" ||
      typeof value.valueOf() === "string"
    ) {
      super(value.valueOf());
      return;
    } else {
      const t = DataType.ARRAY_CONSTRUCTOR_DATA_TYPES.get(value.constructor.name);
      if (t != null) {
        super(t.valueOf());
        return;
      }
    }
    super(DataType.UNKNOWN.valueOf());
    throw new Error(`unable to find data type for ${value.toString()}`);
  }

  /**
   * @returns the TypedArray constructor for the DataType.
   */
  get Array(): NativeTypedArrayConstructor {
    const v = DataType.ARRAY_CONSTRUCTORS.get(this.toString());
    if (v == null)
      throw new Error(`unable to find array constructor for ${this.valueOf()}`);
    return v;
  }

  equals(other: DataType): boolean {
    return this.valueOf() === other.valueOf();
  }

  /** @returns a string representation of the DataType. */
  toString(): string {
    return this.valueOf();
  }

  get density(): Density {
    const v = DataType.DENSITIES.get(this.toString());
    if (v == null) throw new Error(`unable to find density for ${this.valueOf()}`);
    return v;
  }

  /**
   * Checks whether the given TypedArray is of the same type as the DataType.
   *
   * @param array - The TypedArray to check.
   * @returns True if the TypedArray is of the same type as the DataType.
   */
  checkArray(array: NativeTypedArray): boolean {
    return array.constructor === this.Array;
  }

  toJSON(): string {
    return this.toString();
  }

  get usesBigInt(): boolean {
    return DataType.BIG_INT_TYPES.some((t) => t.equals(this));
  }

  /** Represents an Unknown/Invalid DataType. */
  static readonly UNKNOWN = new DataType("unknown");
  /** Represents a 64-bit floating point value. */
  static readonly FLOAT64 = new DataType("float64");
  /** Represents a 32-bit floating point value. */
  static readonly FLOAT32 = new DataType("float32");
  /** Represents a 64-bit signed integer value. */
  static readonly INT64 = new DataType("int64");
  /** Represents a 32-bit signed integer value. */
  static readonly INT32 = new DataType("int32");
  /** Represents a 16-bit signed integer value. */
  static readonly INT16 = new DataType("int16");
  /** Represents a 8-bit signed integer value. */
  static readonly INT8 = new DataType("int8");
  /** Represents a 64-bit unsigned integer value. */
  static readonly UINT64 = new DataType("uint64");
  /** Represents a 32-bit unsigned integer value. */
  static readonly UINT32 = new DataType("uint32");
  /** Represents a 16-bit unsigned integer value. */
  static readonly UINT16 = new DataType("uint16");
  /** Represents a 8-bit unsigned integer value. */
  static readonly UINT8 = new DataType("uint8");
  /** Represents a 64-bit unix epoch. */
  static readonly TIMESTAMP = new DataType("timestamp");

  static readonly ARRAY_CONSTRUCTORS: Map<string, NativeTypedArrayConstructor> =
    new Map<string, NativeTypedArrayConstructor>([
      [DataType.UINT8.toString(), Uint8Array],
      [DataType.UINT16.toString(), Uint16Array],
      [DataType.UINT32.toString(), Uint32Array],
      [DataType.UINT64.toString(), BigUint64Array],
      [DataType.FLOAT32.toString(), Float32Array],
      [DataType.FLOAT64.toString(), Float64Array],
      [DataType.INT8.toString(), Int8Array],
      [DataType.INT16.toString(), Int16Array],
      [DataType.INT32.toString(), Int32Array],
      [DataType.INT64.toString(), BigInt64Array],
      [DataType.TIMESTAMP.toString(), BigInt64Array],
    ]);

  static readonly ARRAY_CONSTRUCTOR_DATA_TYPES: Map<string, DataType> = new Map<
    string,
    DataType
  >([
    [Uint8Array.name, DataType.UINT8],
    [Uint16Array.name, DataType.UINT16],
    [Uint32Array.name, DataType.UINT32],
    [BigUint64Array.name, DataType.UINT64],
    [Float32Array.name, DataType.FLOAT32],
    [Float64Array.name, DataType.FLOAT64],
    [Int8Array.name, DataType.INT8],
    [Int16Array.name, DataType.INT16],
    [Int32Array.name, DataType.INT32],
    [BigInt64Array.name, DataType.INT64],
  ]);

  static readonly DENSITIES = new Map<string, Density>([
    [DataType.UINT8.toString(), Density.BIT8],
    [DataType.UINT16.toString(), Density.BIT16],
    [DataType.UINT32.toString(), Density.BIT32],
    [DataType.UINT64.toString(), Density.BIT64],
    [DataType.FLOAT32.toString(), Density.BIT32],
    [DataType.FLOAT64.toString(), Density.BIT64],
    [DataType.INT8.toString(), Density.BIT8],
    [DataType.INT16.toString(), Density.BIT16],
    [DataType.INT32.toString(), Density.BIT32],
    [DataType.INT64.toString(), Density.BIT64],
    [DataType.TIMESTAMP.toString(), Density.BIT64],
  ]);

  static readonly BIG_INT_TYPES = [DataType.INT64, DataType.UINT64, DataType.TIMESTAMP];

  /** A zod schema for a DataType. */
  static readonly z = z.union([
    z.string().transform((v) => new DataType(v)),
    z.instanceof(DataType),
  ]);
}

/**
 * The Size of an elementy in bytes.
 */
export class Size extends Number implements Stringer {
  constructor(value: CrudeSize) {
    super(value.valueOf());
  }

  /** @returns true if the Size is larger than the other size. */
  largerThan(other: CrudeSize): boolean {
    return this.valueOf() > other.valueOf();
  }

  /** @returns true if the Size is smaller than the other sisze. */
  smallerThan(other: CrudeSize): boolean {
    return this.valueOf() < other.valueOf();
  }

  add(other: CrudeSize): Size {
    return Size.bytes(this.valueOf() + other.valueOf());
  }

  sub(other: CrudeSize): Size {
    return Size.bytes(this.valueOf() - other.valueOf());
  }

  /**
   * Creates a Size from the given number of bytes.
   *
   * @param value - The number of bytes.
   * @returns A Size representing the given number of bytes.
   */
  static bytes(value: CrudeSize = 1): Size {
    return new Size(value);
  }

  /** A single byte */
  static readonly BYTE = new Size(1);

  /**
   * Creates a Size from the given number if kilobytes.
   *
   * @param value - The number of kilobytes.
   * @returns A Size representing the given number of kilobytes.
   */
  static kilobytes(value: CrudeSize = 1): Size {
    return Size.bytes(value.valueOf() * 1e3);
  }

  /** A kilobyte */
  static readonly KILOBYTE = Size.kilobytes(1);

  /**
   * Creates a Size from the given number of megabytes.
   *
   * @param value - The number of megabytes.
   * @returns A Size representing the given number of megabytes.
   */
  static megabytes(value: CrudeSize = 1): Size {
    return Size.kilobytes(value.valueOf() * 1e3);
  }

  /** A megabyte */
  static readonly MEGABYTE = Size.megabytes(1);

  /**
   * Creates a Size from the given number of gigabytes.
   *
   * @param value - The number of gigabytes.
   * @returns A Size representing the given number of gigabytes.
   */
  static gigabytes(value: CrudeSize = 1): Size {
    return Size.megabytes(value.valueOf() * 1e3);
  }

  /** A gigabyte */
  static readonly GIGABYTE = Size.gigabytes(1);

  /**
   * Creates a Size from the given number of terabytes.
   *
   * @param value - The number of terabytes.
   * @returns  A Size representing the given number of terabytes.
   */
  static terabytes(value: CrudeSize): Size {
    return Size.gigabytes(value.valueOf() * 1e3);
  }

  /** A terabyte. */
  static readonly TERABYTE = Size.terabytes(1);

  /** The zero value for Size */
  static readonly ZERO = new Size(0);

  /** A zod schema for a Size. */
  static readonly z = z.union([
    z.number().transform((v) => new Size(v)),
    z.instanceof(Size),
  ]);

  isZero(): boolean {
    return this.valueOf() === 0;
  }
}

export type CrudeTimeStamp =
  | TimeStamp
  | TimeSpan
  | number
  | Date
  | string
  | DateComponents
  | Number;
export type TimeStampT = number;
export type CrudeTimeSpan = TimeSpan | TimeStamp | number | Number;
export type TimeSpanT = number;
export type CrudeRate = Rate | number | Number;
export type RateT = number;
export type CrudeDensity = Density | number | Number;
export type DensityT = number;
export type CrudeDataType = DataType | string | NativeTypedArray;
export type DataTypeT = string;
export type CrudeSize = Size | number | Number;
export type SizeT = number;
export interface CrudeTimeRange {
  start: TimeStampT;
  end: TimeStampT;
}

export const nativeTypedArray = z.union([
  z.instanceof(Uint8Array),
  z.instanceof(Uint16Array),
  z.instanceof(Uint32Array),
  z.instanceof(BigUint64Array),
  z.instanceof(Float32Array),
  z.instanceof(Float64Array),
  z.instanceof(Int8Array),
  z.instanceof(Int16Array),
  z.instanceof(Int32Array),
  z.instanceof(BigInt64Array),
]);

export type NativeTypedArray = z.infer<typeof nativeTypedArray>;

type NativeTypedArrayConstructor =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | BigUint64ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | BigInt64ArrayConstructor;
type TelemValue = number | bigint;

export const convertDataType = (
  source: DataType,
  target: DataType,
  value: TelemValue,
  offset: number | bigint = 0,
): TelemValue => {
  if (source.usesBigInt && !target.usesBigInt) return Number(value) - Number(offset);
  if (!source.usesBigInt && target.usesBigInt) return BigInt(value) - BigInt(offset);
  return addSamples(value, -offset);
};
