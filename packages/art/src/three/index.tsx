/**
 * Procedural 3-D versions of the art (no downloaded models). Loaded only by 2.5-D / 3-D renderers,
 * so the 2-D app never pulls in three.js. Units: 1 = about one plate width.
 */
import type { ThreeElements } from '@react-three/fiber';
import { HAIR, SKIN, FOOD, WOOD, type Look, type ItemKind } from '..';

type GroupProps = ThreeElements['group'];

const lambert = (color: string) => <meshLambertMaterial color={color} />;

export function Item3D({ kind, ...props }: GroupProps & { kind: ItemKind }) {
  switch (kind) {
    case 'biscuit':
      return (
        <group {...props}>
          <mesh castShadow position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.06, 20]} />
            {lambert(FOOD.biscuit.base)}
          </mesh>
          <mesh position={[0, 0.061, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.004, 20]} />
            {lambert(FOOD.biscuit.hi)}
          </mesh>
        </group>
      );
    case 'orange':
      return (
        <group {...props}>
          <mesh castShadow position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.15, 16, 12]} />
            {lambert(FOOD.orange.base)}
          </mesh>
          <mesh position={[0.04, 0.3, 0]} rotation={[0, 0, -0.6]}>
            <boxGeometry args={[0.1, 0.02, 0.05]} />
            {lambert(FOOD.leaf.base)}
          </mesh>
        </group>
      );
    case 'lemon':
      return (
        <group {...props}>
          <mesh castShadow position={[0, 0.12, 0]} scale={[1.35, 1, 1]}>
            <sphereGeometry args={[0.12, 16, 12]} />
            {lambert(FOOD.lemon.base)}
          </mesh>
        </group>
      );
    case 'chocolate':
      return (
        <group {...props}>
          <mesh castShadow position={[0, 0.05, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.16]} />
            {lambert(FOOD.chocolate.base)}
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.1, 0.104, 0.164]} />
            {lambert('#E85D75')}
          </mesh>
        </group>
      );
  }
}

export function Plate3D({ highlight, ...props }: GroupProps & { highlight?: string }) {
  return (
    <group {...props}>
      <mesh receiveShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.5, 0.38, 0.06, 32]} />
        {lambert(highlight ?? '#FFFFFF')}
      </mesh>
      <mesh receiveShadow position={[0, 0.061, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.004, 32]} />
        {lambert('#E4E9F2')}
      </mesh>
    </group>
  );
}

export function Bag3D({ highlight, ...props }: GroupProps & { highlight?: string }) {
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position={[0, 0.25, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.3, 0.36, 0.5, 4]} />
        {lambert(highlight ?? '#E2B77E')}
      </mesh>
    </group>
  );
}

export function Table3D({ w, d, ...props }: GroupProps & { w: number; d: number }) {
  const legs: [number, number][] = [
    [-w / 2 + 0.2, -d / 2 + 0.2],
    [w / 2 - 0.2, -d / 2 + 0.2],
    [-w / 2 + 0.2, d / 2 - 0.2],
    [w / 2 - 0.2, d / 2 - 0.2],
  ];
  return (
    <group {...props}>
      <mesh receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[w, 0.16, d]} />
        {lambert(WOOD.top)}
      </mesh>
      {legs.map(([x, z], i) => (
        <mesh key={i} position={[x, -0.9, z]}>
          <boxGeometry args={[0.14, 1.5, 0.14]} />
          {lambert(WOOD.edge)}
        </mesh>
      ))}
    </group>
  );
}

/** A low-poly child: body, head, hair. Uses the same `Look` as the 2-D figure. */
export function Kid3D({ look, ...props }: GroupProps & { look: Look }) {
  const skin = SKIN[look.skin].base;
  const hair = HAIR[look.hair];
  return (
    <group {...props}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.7, 16]} />
        {lambert(look.top)}
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.27, 20, 16]} />
        {lambert(skin)}
      </mesh>
      <mesh position={[0, 1.02, -0.02]} scale={[1.05, 0.85, 1.05]}>
        <sphereGeometry args={[0.27, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {lambert(hair)}
      </mesh>
      {look.hairStyle === 'ponytails' &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.3, 0.9, -0.05]}>
            <sphereGeometry args={[0.09, 10, 8]} />
            {lambert(hair)}
          </mesh>
        ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.09, 0.97, 0.245]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          {lambert('#2B2B40')}
        </mesh>
      ))}
    </group>
  );
}
