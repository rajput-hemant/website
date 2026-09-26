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
varying float vH;
varying vec2 vP;
varying vec3 vN;

float hills(vec2 q) {
  float m = 0.0;
  for (int i = 0; i < ${MAX_HILLS}; i++) {
    if (i >= uCount) break;
    vec4 h = uHills[i];
    vec2 d = (q - h.xy) / vec2(h.z, 30.0);
    m = max(m, h.w * exp(-0.5 * dot(d, d)));
  }
  return m;
}

float ground(vec2 q) {
  if (q.x > uCoast) return 0.0;
  vec2 d = q - uLoupe;
  d.y *= 0.9;
  float r = length(d);
  if (uRadius > 0.0 && r < uRadius) {
    vec2 e = q - uLoupe;
    e *= 0.5 + 0.5 * (r * r) / (uRadius * uRadius);
    return hills(uLoupe + e);
  }
  return hills(q);
}

void main() {
  vec2 q = position.xy;
  float h = ground(q);
  float gx = ground(q + vec2(2.0, 0.0)) - ground(q - vec2(2.0, 0.0));
  float gz = ground(q + vec2(0.0, 2.0)) - ground(q - vec2(0.0, 2.0));
  vN = normalize(vec3(-gx * uHeight * 0.25, 1.0, -gz * uHeight * 0.25));
  vH = h;
  vP = q;
  gl_Position = projectionMatrix * viewMatrix * vec4(q.x, h * uHeight, q.y, 1.0);
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
varying float vH;
varying vec2 vP;
varying vec3 vN;

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
    c *= 0.8 + 0.3 * dot(normalize(vN), normalize(vec3(-0.55, 0.75, -0.45)));
    vec2 g = vec2((vP.x - uX0) / uYearW, vP.y / 46.0);
    c = mix(c, uGrid, max(line(g.x, 1.0), line(g.y, 1.0)) * 0.35);
    float dash = step(fract(vP.x / 15.5), 0.55);
    float bd = (1.0 - smoothstep(0.0, 1.2, abs(vP.y - 230.0))) * dash;
    c = mix(c, uBoundary, bd * 0.7);
    float index = mod(floor(f + 0.5), 4.0) == 0.0 ? 2.4 : 1.2;
    c = mix(c, uContour, line(f, index) * step(0.5, f) * 0.95);
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
