import { inkPrint } from "@/flavors/press/components/scene/print";
import { ShaderLib } from "three";
import { expect, test } from "vitest";

// The print hooks two chunks of the standard material; if three renames either,
// the sheet would show raw plate coverage instead of ink.
test("inks the plates in place of the standard map lookup", () => {
  const source = ShaderLib.physical.fragmentShader;
  const inked = inkPrint(source);
  expect(inked).not.toContain("#include <map_fragment>");
  expect(inked).toContain("uniform float printMis;");
  expect(inked).toContain("diffuseColor.rgb *= sRGBTransferEOTF");
  // The helpers read `map` and `vMapUv`, so they follow their declarations.
  expect(inked.indexOf("#include <map_pars_fragment>")).toBeLessThan(
    inked.indexOf("vec4 printPlate")
  );
  expect(inked.indexOf("#include <uv_pars_fragment>")).toBeLessThan(
    inked.indexOf("vec4 printPlate")
  );
  expect(inked.indexOf("vec4 printPlate")).toBeLessThan(
    inked.indexOf("vec2 pos = vec2(vMapUv")
  );
});
