import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { lightTokens } from '../theme/tokens';

interface IconProps {
  size?: number;
  color: string;
}

export function SignalMark({ size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" pointerEvents="none">
      <Circle cx="10" cy="10" r="8" fill={lightTokens.sage} />

      <Path
        d="
          M10 2
          A8 8 0 0 1 10 18
          A4 4 0 0 1 10 10
          A4 4 0 0 0 10 2
          Z
        "
        fill={lightTokens.terra}
      />
    </Svg>
  );
}

export function Leaf({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path d="M4 16C4 8.5 8.5 4 16 4C16 11.5 11.5 16 4 16Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M4 16L11.5 8.5" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  );
}

export function Moon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path
        d="M11.1,3.7 A7,7 0 0,1 15.9,13.3 A5.5,5.5 0 0,0 11.1,3.7 Z"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Sun({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Circle cx="10" cy="10" r="3.5" stroke={color} strokeWidth={1.5}/>
      <Path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  );
}

export function Heart({ size = 20, color, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? color : 'none'} pointerEvents="none">
      <Path
        d="M10 16.5C5 13.5 2 10 2 7C2 4.5 4 3 6 3C7.5 3 9 3.9 10 5.2C11 3.9 12.5 3 14 3C16 3 18 4.5 18 7C18 10 15 13.5 10 16.5Z"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Settings({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path d="M3 5h2M9 5h8M3 10h8M15 10h2M3 15h2M9 15h8" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
      <Circle cx="7" cy="5" r="2" stroke={color} strokeWidth={1.5}/>
      <Circle cx="13" cy="10" r="2" stroke={color} strokeWidth={1.5}/>
      <Circle cx="7" cy="15" r="2" stroke={color} strokeWidth={1.5}/>
    </Svg>
  );
}

export function Bolt({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function Flame({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path d="M10 18c-4 0-6-2.5-6-5.5 0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 1-7 4-8-1 3 1 5 2 6 .5-1 .5-2 .5-2 1.5 1.5 2.5 3.5 2.5 5.5C17 15.5 14 18 10 18z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function Close({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path d="M5 5l10 10M15 5L5 15" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  );
}

export function Check({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path d="M4 10l5 5 7-8" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function ChevR({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path d="M7 4l6 6-6 6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function ChevL({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path d="M13 4L7 10l6 6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function Plus({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path d="M10 4v12M4 10h12" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  );
}

export function Edit({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path d="M13 3l4 4-9 9H4v-4l9-9z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function Trash({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" pointerEvents="none">
      <Path d="M3 5h14M8 5V3h4v2M6 5l1 12h6l1-12" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
