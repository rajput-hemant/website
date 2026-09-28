/**
 * The cloth: a plane hung from its top edge. The vertex shader drapes it
 * (pleats that deepen toward the hem, a ripple from the pointer) and finds
 * the normal from the same function; the fragment shader weaves it cell by
 * cell from the pattern texture, so a hover only uploads the hot row.
 */
export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform vec2 uRip;
uniform float uDrape;
uniform vec2 uCloth;

varying vec2 vUv;
varying vec3 vNormal;

vec3 drape(vec2 p) {
  float t = (uCloth.y * 0.5 - p.y) / uCloth.y;
  float z = sin(p.x * 2.6 + 0.8) * 0.09 * (0.3 + t) * uDrape
    + sin(p.x * 6.1 + 1.7) * 0.03 * t * uDrape;
  if (uAmp > 0.0) {
    float d = distance(p, uRip);
    z += uAmp * sin(d * 7.0 - uTime * 9.0) * exp(-d * 1.4) * min(1.0, t * 3.0);
  }
  return vec3(p.x * (1.0 - 0.035 * t * uDrape), p.y, z);
}

void main() {
  vUv = uv;
  vec3 p = drape(position.xy);
  vec3 dx = drape(position.xy + vec2(0.01, 0.0)) - p;
  vec3 dy = drape(position.xy + vec2(0.0, 0.01)) - p;
  vNormal = normalize(mat3(modelMatrix) * normalize(cross(dx, dy)));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
uniform sampler2D uPattern;
uniform sampler2D uHot;
uniform vec2 uSize;
uniform vec2 uRepeat;
uniform float uWoven;
uniform float uBroken;
uniform vec3 uWeft;
uniform vec3 uWarp;
uniform vec3 uLabel;
uniform vec3 uYarn[5];
uniform vec3 uSky;
uniform vec3 uFloor;
uniform vec3 uSun;
uniform vec3 uSunDir;

varying vec2 vUv;
varying vec3 vNormal;

float hash(float n) {
  return fract(sin(n * 91.345) * 47453.5453);
}

vec3 yarn(float kind) {
  if (kind < 0.5) return uYarn[0];
  if (kind < 1.5) return uYarn[1];
  if (kind < 2.5) return uYarn[2];
  if (kind < 3.5) return uYarn[3];
  return uYarn[4];
}

void main() {
  // Rows count down from the rod, the order the picks were woven.
  vec2 g = vec2(vUv.x, 1.0 - vUv.y) * uSize * uRepeat;
  vec2 cell = floor(g);
  vec2 f = fract(g);
  vec2 at = mod(cell, uSize);
  vec4 pattern = texture2D(uPattern, (at + 0.5) / uSize);
  float id = floor(pattern.r * 255.0 + 0.5) - 1.0;
  float kind = floor(pattern.g * 255.0 + 0.5);

  if (uBroken >= 0.0 && abs(at.x - uBroken) < 0.5 && cell.x < uSize.x) {
    discard;
  }

  float row = cell.y / (uSize.y * uRepeat.y);
  vec3 color;
  if (row > uWoven) {
    // Below the fell: bare warp, not woven yet.
    if (f.x < 0.22 || f.x > 0.78) discard;
    color = uWarp * (0.75 + 0.25 * sin(3.14159 * f.x));
  } else if (id >= 0.0) {
    float hot = texture2D(uHot, vec2((id + 0.5) / 36.0, 0.5)).r;
    vec3 base = hot > 0.5 ? yarn(kind) : uWarp;
    float shade = 0.7 + 0.3 * sin(3.14159 * clamp((f.x - 0.1) / 0.8, 0.0, 1.0));
    float twist = 0.94 + 0.06 * step(0.5, fract(f.y * 3.0 + f.x));
    color = base * shade * twist;
    if (f.x < 0.1 || f.x > 0.9) color = uWeft * 0.72;
  } else {
    float shade = 0.78 + 0.22 * sin(3.14159 * f.y);
    color = uWeft * shade * (0.93 + 0.14 * hash(cell.y + 17.0 * floor(cell.y / uSize.y)));
  }

  // The sewn label near the hem, stitched round its edge.
  vec2 l = (vUv - vec2(0.62, 0.06)) / vec2(0.26, 0.055);
  if (l.x > 0.0 && l.x < 1.0 && l.y > 0.0 && l.y < 1.0) {
    color = uLabel;
    vec2 e = min(l, 1.0 - l) * vec2(0.26, 0.055) * 100.0;
    float edge = min(e.x, e.y);
    float along = l.x * 26.0 + l.y * 5.5;
    if (edge > 0.35 && edge < 0.6 && fract(along) < 0.55) {
      color = mix(uLabel, vec3(1.0, 0.93, 0.89), 0.55);
    }
  }

  vec3 n = normalize(gl_FrontFacing ? vNormal : -vNormal);
  vec3 light = mix(uFloor, uSky, n.y * 0.5 + 0.5)
    + uSun * max(dot(n, normalize(uSunDir)), 0.0);
  gl_FragColor = vec4(color * light, 1.0);
}
`;
