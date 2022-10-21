import { jsonDispatch } from "jsonDispatch";
import { assertEquals } from "asserts";

import * as target from "./test2.ts";
// import { hello } from "./test2.ts";

const dispatch = jsonDispatch({ ...target });
// console.log({ ...target });

Deno.test("test_dispatch", async () =>
  assertEquals(
    await dispatch({
      hello: {},
    }),
    { hello: "world" },
  ));
