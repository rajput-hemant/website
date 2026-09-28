import { PAD_VIEWS, padView, VIEW } from "@/flavors/press/lib/scene/views";

import type { SceneViews } from "@/lib/scene/session";

import { Fountain } from "./fountain";
import { HomeLoupe } from "./loupe";
import { pads } from "./pad";
import { Pile } from "./pile";
import { Roller } from "./roller";
import { Signatures } from "./signatures";
import { Stamp } from "./stamp";
import { Years } from "./years";

/** Every press view by placeholder id (docs/press.md, "3D"). */
export const pressViews: SceneViews = {
  [VIEW.loupe]: () => <HomeLoupe />,
  [VIEW.stamp]: () => <Stamp />,
  [VIEW.signatures]: () => <Signatures />,
  ...Object.fromEntries(
    Array.from({ length: PAD_VIEWS }, (_, i) => [padView(i), pads(i)])
  ),
  [VIEW.roller]: () => <Roller />,
  [VIEW.pile]: () => <Pile />,
  [VIEW.fountain]: () => <Fountain />,
  [VIEW.years]: () => <Years />,
};
