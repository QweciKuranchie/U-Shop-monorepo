import assert from "node:assert/strict";
import test from "node:test";
import { safeAuthPath } from "./safe-auth-path.ts";

test("keeps local post-auth paths and query parameters", () => {
  assert.equal(safeAuthPath("/dashboard/orders?status=new", "/dashboard"), "/dashboard/orders?status=new");
  assert.equal(safeAuthPath("/create-store?type=student", "/dashboard"), "/create-store?type=student");
});

test("rejects external and malformed redirect targets", () => {
  for (const value of ["https://evil.example", "//evil.example", "/\\evil.example", "", "javascript:alert(1)"]) {
    assert.equal(safeAuthPath(value, "/dashboard"), "/dashboard");
  }
});
