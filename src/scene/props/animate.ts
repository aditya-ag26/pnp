/**
 * Motion for the hand-built props: flowers lean with a slow breeze; the heart
 * bobs and turns. Props opt in through the `swaying` / `floating` markers
 * in clay.ts.
 */
import type { Object3D } from 'three'

/** True for props that animateProps() should move. */
export const isAnimated = (prop: Object3D) => Boolean(prop.userData.sway || prop.userData.float)

/** @param t elapsed seconds */
export function animateProps(props: Object3D[], t: number) {
  props.forEach((prop, n) => {
    const rest = (prop.userData.rest ??= { rotation: prop.rotation.clone(), y: prop.position.y })
    if (prop.userData.float) {
      prop.position.y = rest.y + Math.sin(t * 1.3 + n) * 0.014
      prop.rotation.y = rest.rotation.y + Math.sin(t * 0.7 + n) * 0.55
      return
    }
    const amount = prop.userData.sway as number
    prop.rotation.x = rest.rotation.x + Math.sin(t * 0.9 + n * 1.7) * 0.035 * amount
    prop.rotation.z = rest.rotation.z + Math.sin(t * 1.25 + n * 2.3) * 0.055 * amount
  })
}
