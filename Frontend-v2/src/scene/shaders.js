// Full-screen quad: draws straight to clip space, no camera needed.
export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// Cross-fades two photos (A → B) with a slow zoom, pointer parallax driven by an optional depth map,
// a depth-aware reveal and a light vignette.
export const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uImgA, uDepA, uImgB, uDepB;
  uniform vec2  uAspectA, uAspectB;   // x = image aspect, y = has depth (0/1)
  uniform vec2  uFocusA, uFocusB;     // focal point (0..1) kept in frame on narrow screens
  uniform float uView;                // viewport aspect
  uniform float uMix;                 // 0 = A, 1 = B
  uniform float uAgeA, uAgeB;         // seconds each slide has been on screen
  uniform vec2  uPointer;             // smoothed, -1..1
  uniform float uStrength;

  // "object-fit: cover" with a focal point and zoom
  vec2 cover(vec2 uv, float imgAspect, vec2 focus, float zoom) {
    vec2 s = uView > imgAspect ? vec2(1.0, imgAspect / uView) : vec2(uView / imgAspect, 1.0);
    s /= zoom;
    vec2 off = (1.0 - s) * focus;
    return clamp(uv * s + off, 0.0, 1.0);
  }

  // A few fixed-point steps so the displacement follows the depth of the
  // pixel we actually land on (fewer stretch artefacts at the athlete's edge).
  vec2 parallax(vec2 uv, sampler2D dep, float hasDepth, vec2 shift) {
    if (hasDepth < 0.5) return uv - shift * 0.35;           // no depth map: plain pan
    vec2 p = uv;
    for (int i = 0; i < 4; i++) {
      float d = texture2D(dep, p).r;                        // 1 = near, 0 = far
      p = uv - shift * (d - 0.3);
    }
    return p;
  }

  vec4 slide(sampler2D img, sampler2D dep, vec2 meta, vec2 focus, float age, float push, out float depth) {
    float zoom = 1.08 + min(age, 9.0) * 0.006 + push;      // slow camera dolly + transition push
    vec2 uv = cover(vUv, meta.x, focus, zoom);
    vec2 shift = uPointer * uStrength * vec2(1.0, -0.6);
    uv = parallax(uv, dep, meta.y, shift);
    depth = meta.y > 0.5 ? texture2D(dep, uv).r : 0.5;
    return texture2D(img, uv);
  }

  void main() {
    float dA, dB;
    vec4 a = slide(uImgA, uDepA, uAspectA, uFocusA, uAgeA, uMix * 0.12, dA);
    vec4 b = slide(uImgB, uDepB, uAspectB, uFocusB, uAgeB, (1.0 - uMix) * 0.08, dB);

    // depth-aware reveal: far parts of the next photo arrive first, near parts last
    float t = smoothstep(dB * 0.55, dB * 0.55 + 0.45, uMix);
    vec4 col = mix(a, b, t);

    // gentle filmic grade + vignette
    col.rgb = pow(col.rgb, vec3(1.04));
    float v = smoothstep(1.25, 0.35, length((vUv - 0.5) * vec2(uView, 1.0) * 0.9));
    col.rgb *= mix(0.72, 1.0, v);
    gl_FragColor = vec4(col.rgb, 1.0);
  }
`
