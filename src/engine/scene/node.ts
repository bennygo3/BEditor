import type { Shape } from "../geometry/shape";

export type SceneNode =
| { type: "shape"; shape: Shape }
| { type: "group"; id: string; children: SceneNode[] };