/** Most roles one sheet draws as hills. */
export const MAX_HILLS = 8;

/*
 * The relief: a plane displaced in the vertex shader, one gaussian hill per
 * role (height = months in the role), the loupe magnifying the ground under
 * it. World space: x east, y up (height * HEIGHT_SCALE), z south (northing).
 */
export const vertexShader = /* glsl */ `
uniform vec4 uHills[${MAX_HILLS}];
uniform int uCount;
uniform vec2 uLoupe;
uniform float uRadius;
uniform float uCoast;
uniform float uHeight;
uniform int uHot;
uniform float uHotLift;
uniform int uCurrent;
varying float vH;
varying vec2 vP;
varying vec3 vN;
varying float vHot;
varying float vCur;

// The highest hill at s (x) and that hill's gradient there (yz), in one pass.
vec3 hills(vec2 s) {
  vec3 m = vec3(0.0);
  for (int i = 0; i < ${MAX_HILLS}; i++) {
    if (i >= uCount) break;
    vec4 h = uHills[i];
    vec2 sigma = vec2(h.z, 30.0);
    vec2 d = (s - h.xy) / sigma;
    float v = h.w * exp(-0.5 * dot(d, d));
    if (v > m.x) m = vec3(v, -v * d / sigma);
  }
  return m;
}

// How much hill k owns this point: 1 where it is the highest ground.
float owns(int k, vec2 s, float m) {
  if (k < 0 || k >= uCount || m < 0.5) return 0.0;
  vec4 h = uHills[k];
  vec2 d = (s - h.xy) / vec2(h.z, 30.0);
  float v = h.w * exp(-0.5 * dot(d, d));
  return smoothstep(0.9, 1.0, v / m) * smoothstep(0.4, 1.6, v);
}

void main() {
  vec2 q = position.xy;
  // Under the loupe the ground at q comes from s, nearer the lens centre.
  vec2 e = q - uLoupe;
  float r = length(e * vec2(1.0, 0.9));
  bool lensed = uRadius > 0.0 && r < uRadius;
  float k = lensed ? 0.5 + 0.5 * (r * r) / (uRadius * uRadius) : 1.0;
  vec2 s = uLoupe + e * k;
  vec3 hg = q.x > uCoast ? vec3(0.0) : hills(s);
  float h = hg.x;
  // The slope at q is the hill's gradient at s through the lens (chain rule).
  vec2 g = hg.yz;
  if (lensed) g = k * g + e * vec2(1.0, 0.81) * dot(e, g) / (uRadius * uRadius);
  vN = normalize(vec3(-g.x * uHeight, 1.0, -g.y * uHeight));
  vHot = q.x > uCoast ? 0.0 : owns(uHot, s, h);
  vCur = q.x > uCoast ? 0.0 : owns(uCurrent, s, h);
  vH = h;
  vP = q;
  // A hovered summit's rings rise as one, keeping their shape.
  float y = (h + uHotLift * vHot) * uHeight;
  gl_Position = projectionMatrix * viewMatrix * vec4(q.x, y, q.y, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uPaper;
uniform vec3 uTints[8];
uniform vec3 uContour;
uniform vec3 uGrid;
uniform vec3 uBoundary;
uniform vec3 uSea;
uniform vec3 uInk;
uniform float uCoast;
uniform float uX0;
uniform float uYearW;
uniform vec2 uLoupe;
uniform float uRing;
uniform float uRadius;
uniform float uHotMix;
uniform vec4 uCut;
uniform float uRevision;
uniform vec3 uRevColor;
varying float vH;
varying vec2 vP;
varying vec3 vN;
varying float vHot;
varying float vCur;

float line(float v, float width) {
  float w = fwidth(v) * width;
  return 1.0 - smoothstep(0.0, w, abs(fract(v - 0.5) - 0.5));
}

void main() {
  bool outside = vP.y < 0.0 || vP.y > 460.0;
  if (outside && vH < 1.0) discard;

  vec3 c;
  if (vP.x > uCoast) {
    c = uSea;
    // Hachure that widens away from the coast.
    float d = vP.x - uCoast;
    float k = sqrt(d * 1.25 + 1.0);
    c = mix(c, uGrid, line(k, 1.0) * 0.8);
  } else {
    float f = vH / 2.0;
    float lv = floor(f);
    c = lv < 1.0 ? uPaper : uTints[int(clamp(lv - 1.0, 0.0, 7.0))];
    // Shade only darkens, so lit slopes never glare brighter than the paper.
    c *= 0.9 + 0.12 * clamp(dot(normalize(vN), normalize(vec3(-0.55, 0.75, -0.45))), -1.0, 0.6);
    vec2 g = vec2((vP.x - uX0) / uYearW, vP.y / 46.0);
    c = mix(c, uGrid, max(line(g.x, 1.0), line(g.y, 1.0)) * 0.35);
    float dash = step(fract(vP.x / 15.5), 0.55);
    float bd = (1.0 - smoothstep(0.0, 1.2, abs(vP.y - 230.0))) * dash;
    c = mix(c, uBoundary, bd * 0.7);
    // Revision purple: hatch over the current summit, a strip at the coast.
    float hatch = line((vP.x + vP.y) / 5.0, 1.0) * vCur * step(1.0, vH) * 0.55;
    float strip = step(uCoast - 10.0, vP.x) * 0.4;
    c = mix(c, uRevColor, max(hatch, strip) * uRevision);
    float hot = vHot * uHotMix;
    float index = (mod(floor(f + 0.5), 4.0) == 0.0 ? 2.4 : 1.2) * (1.0 + 0.6 * hot);
    c = mix(c, mix(uContour, uGrid, hot), line(f, index) * step(0.5, f) * 0.95);
    // The section line a work transect cuts, under the cutting plane.
    float cut = 1.0 - smoothstep(1.5, 1.5 + fwidth(vP.y) * 1.5, abs(vP.y - uCut.x));
    cut *= step(uCut.y, vP.x) * step(vP.x, uCut.z);
    c = mix(c, uGrid, cut * 0.85 * uCut.w);
    float coast = 1.0 - smoothstep(0.0, fwidth(vP.x) * 1.6, abs(vP.x - uCoast));
    c = mix(c, uGrid, coast);
  }

  if (uRing > 0.0) {
    vec2 d = vP - uLoupe;
    d.y *= 0.9;
    float r = length(d);
    float ring = 1.0 - smoothstep(0.0, fwidth(r) * 1.4, abs(r - uRadius));
    float halo = 1.0 - smoothstep(0.0, fwidth(r) * 1.0, abs(r - uRadius - 4.0));
    float cross = (1.0 - smoothstep(0.0, fwidth(d.x) * 1.2, abs(d.x))) * step(abs(d.y), 5.0)
      + (1.0 - smoothstep(0.0, fwidth(d.y) * 1.2, abs(d.y))) * step(abs(d.x), 5.0);
    c = mix(c, uInk, clamp(ring + halo * 0.45 + cross, 0.0, 1.0) * 0.9);
  }

  gl_FragColor = vec4(c, 1.0);
}
`;
