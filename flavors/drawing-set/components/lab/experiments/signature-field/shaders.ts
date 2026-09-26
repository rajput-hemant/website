export const RIPPLE_COUNT = 8;
/** Seconds a ripple stays visible; also how long the scene keeps rendering after the last one. */
export const RIPPLE_LIFETIME = 2.4;

/*
 * Positions are in "word units": the wordmark is 1 wide, centred on the origin.
 * `uScale` maps them to world units so the word always fits the stage.
 */
export const vertexShader = /* glsl */ `
#define RIPPLE_COUNT ${RIPPLE_COUNT}
#define RIPPLE_LIFETIME ${RIPPLE_LIFETIME.toFixed(2)}
#define TAU 6.28318530718

uniform float uTime;
uniform float uProgress;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform vec4 uRipples[RIPPLE_COUNT];
uniform float uScale;
uniform float uSize;
uniform float uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;

attribute vec3 aScatter;
// x: settle delay jitter, y: size, z: tone, w: phase
attribute vec4 aSeed;

varying vec3 vColor;
varying float vAlpha;
varying float vSoftness;
varying float vPointSize;

void main() {
  vec3 target = position;

  // Letters resolve left to right, like a signature being written.
  float delay = clamp(target.x + 0.5, 0.0, 1.0) * 0.45 + aSeed.x * 0.2;
  float local = clamp((uProgress - delay) / 0.35, 0.0, 1.0);
  float settle = 1.0 - pow(1.0 - local, 4.0);

  float phase = aSeed.w * TAU;
  vec3 drift = vec3(
    sin(uTime * 0.7 + phase),
    cos(uTime * 0.53 + phase * 1.3),
    sin(uTime * 0.41 + phase * 0.7)
  ) * 0.025;
  vec3 p = mix(aScatter + drift, target, settle);
  p.y += sin(settle * 3.14159) * (aSeed.x - 0.5) * 0.12;

  vec2 away = p.xy - uPointer;
  float dist = length(away);
  vec2 direction = away / max(dist, 1e-4);
  float lens = exp(-dist * dist / 0.0032) * uPointerStrength;
  vec3 offset = vec3(direction * lens * 0.026, lens * 0.05);

  float crest = 0.0;
  for (int i = 0; i < RIPPLE_COUNT; i++) {
    vec4 ripple = uRipples[i];
    float age = uTime - ripple.z;
    if (age < 0.0 || age > RIPPLE_LIFETIME) continue;
    vec2 fromOrigin = p.xy - ripple.xy;
    float radius = length(fromOrigin);
    float band = radius - age * 0.32;
    float envelope = exp(-band * band / 0.0032) * exp(-age * 1.6) * ripple.w;
    float height = sin(band * 90.0) * envelope;
    offset.xy += fromOrigin / max(radius, 1e-4) * height * 0.007;
    offset.z += height * 0.05;
    crest += abs(height);
  }
  p += offset;

  vec4 mvPosition = modelViewMatrix * vec4(p * uScale, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Particles away from the letter plane read as out of focus: larger, softer, fainter.
  vSoftness = clamp(abs(p.z) * 5.0, 0.0, 1.0);
  float size = uSize * uScale * mix(0.75, 1.2, aSeed.y) * (1.0 + vSoftness * 1.4);
  gl_PointSize = size * projectionMatrix[1][1] * uResolution * 0.5 / -mvPosition.z;

  float tone = smoothstep(0.7, 1.0, aSeed.z);
  vColor = mix(uColorA, uColorB, tone * 0.55);
  vAlpha = uOpacity * mix(0.3, 1.0, settle) * (1.0 - vSoftness * 0.55) * mix(0.7, 1.0, aSeed.y);
  vAlpha = min(1.0, vAlpha + crest * 0.35);

  if (gl_PointSize < 2.0) {
    vAlpha *= gl_PointSize / 2.0;
    gl_PointSize = 2.0;
  }
  vPointSize = gl_PointSize;
}
`;

export const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vSoftness;
varying float vPointSize;

void main() {
  float d = length(gl_PointCoord - 0.5);
  // One device pixel of antialiasing keeps even tiny points round.
  float edge = 0.5 - min(0.5, 1.0 / vPointSize);
  float alpha = vAlpha * (1.0 - smoothstep(mix(edge, 0.05, vSoftness), 0.5, d));
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(vColor, alpha);
  #include <colorspace_fragment>
}
`;
