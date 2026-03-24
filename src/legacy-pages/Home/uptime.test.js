import { describe, expect, it } from "vitest";

import { formatUptimeDays } from "./uptime";

describe("formatUptimeDays", () => {
  it("returns 1d on the launch day", () => {
    expect(formatUptimeDays(new Date("2026-03-22T08:00:00+08:00"))).toBe("1d");
  });

  it("returns 2d on the next day", () => {
    expect(formatUptimeDays(new Date("2026-03-23T08:00:00+08:00"))).toBe("2d");
  });

  it("never returns less than 1d before launch day", () => {
    expect(formatUptimeDays(new Date("2026-03-21T08:00:00+08:00"))).toBe("1d");
  });
});
