import { useMemo } from 'react'
import { Color, ShaderMaterial } from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`

const fragmentShader = /* glsl */ `
  uniform vec3 uBase; uniform vec3 uRim;
  varying vec3 vN; varying vec3 vV;
  void main(){
    float f = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 4.0);
    float top = smoothstep(0.2, 1.0, vN.y) * 0.25;       // light from above
    gl_FragColor = vec4(uBase + uBase*top*3.0 + uRim * f, 1.0);
  }`

// Dark silhouette material with a bright rim light around the edges (used for the runner).
export function useRimMaterial(base, rim, rimIntensity = 1.1) {
  return useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uBase: { value: new Color(base) },
          uRim: { value: new Color(rim).multiplyScalar(rimIntensity) },
        },
        vertexShader,
        fragmentShader,
        toneMapped: false,
      }),
    [base, rim, rimIntensity],
  )
}
