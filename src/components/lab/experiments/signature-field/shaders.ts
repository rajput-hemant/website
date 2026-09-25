export const RIPPLES = 8;
export const RIPPLE_LIFE = 2.4;
export const INTRO_END = 2.4;

export const vertexShader = /* glsl */ `
  #define RIPPLES ${RIPPLES}
  #define RIPPLE_LIFE ${RIPPLE_LIFE.toFixed(1)}

  uniform float uTime;
  uniform float uSize;
  uniform float uDpr;
  uniform float uRadius;
  uniform float uHalfWidth;
  uniform vec2 uPointer;
  uniform float uHover;
  uniform vec4 uRipples[RIPPLES];

  attribute vec4 aSeed;

  varying float vEnergy;
  varying float vAlpha;

  void main() {
    vec2 home = position.xy;

    float delay = (home.x / uHalfWidth * 0.5 + 0.5) * 0.6 + aSeed.z * 0.4;
    float t = clamp((uTime - delay) / 1.4, 0.0, 1.0);
    float settle = 1.0 - pow(1.0 - t, 4.0);
    float angle = aSeed.x * 6.2831853;
    float swirl = (1.0 - settle) * 2.2;
    float reach = mix(0.3, 1.0, aSeed.y) * uRadius * 2.6 * (1.0 - settle);
    vec2 p = home + vec2(cos(angle + swirl), sin(angle + swirl)) * reach;
    float energy = 1.0 - settle;

    vec2 away = p - uPointer;
    float dist = length(away) + 0.0001;
    float lensX = dist / uRadius;
    float lens = exp(-lensX * lensX) * uHover;
    p += away / dist * lens * uRadius * 0.42;
    energy += lens;

    for (int i = 0; i < RIPPLES; i++) {
      vec4 ripple = uRipples[i];
      float age = uTime - ripple.z;
      if (age < 0.0 || age > RIPPLE_LIFE) continue;
      vec2 offset = p - ripple.xy;
      float len = length(offset) + 0.0001;
      float bandX = (len - age * uRadius * 4.0) / (uRadius * 0.45);
      float band = exp(-bandX * bandX);
      float amount = band * ripple.w * pow(1.0 - age / RIPPLE_LIFE, 2.0);
      p += offset / len * amount * uRadius * 0.16;
      energy += amount * 0.6;
    }

    vEnergy = clamp(energy, 0.0, 1.0);
    vAlpha = smoothstep(0.0, 0.3, t);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
    gl_PointSize = uSize * mix(0.8, 1.2, aSeed.w) * (1.0 + vEnergy * 0.4) * uDpr;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uInk;

  varying float vEnergy;
  varying float vAlpha;

  void main() {
    float edge = 1.0 - smoothstep(0.28, 0.5, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(mix(uAccent, uInk, vEnergy * 0.5), edge * vAlpha);
    #include <colorspace_fragment>
  }
`;
