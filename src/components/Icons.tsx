import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export function Leaf({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M4 16C4 9 9 4 16 4c0 7-5 12-12 12z" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M4 16l8-8" stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
    </Svg>
  );
}

export function Moon({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M17 14A7 7 0 016 3a7 7 0 000 14 7 7 0 0011-3z" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function Sun({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="4" stroke={color} strokeWidth={1.4}/>
      <Path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
    </Svg>
  );
}

export function Heart({ size = 20, color = 'currentColor', filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? color : 'none'}>
      <Path d="M10 17s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function Settings({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="2.5" stroke={color} strokeWidth={1.4}/>
      <Path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
    </Svg>
  );
}

export function Bolt({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function Flame({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M10 18c-4 0-6-2.5-6-5.5 0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 1-7 4-8-1 3 1 5 2 6 .5-1 .5-2 .5-2 1.5 1.5 2.5 3.5 2.5 5.5C17 15.5 14 18 10 18z" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function More({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <Circle cx="4" cy="10" r="1.5"/>
      <Circle cx="10" cy="10" r="1.5"/>
      <Circle cx="16" cy="10" r="1.5"/>
    </Svg>
  );
}

export function Close({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M5 5l10 10M15 5L5 15" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    </Svg>
  );
}

export function Check({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M4 10l5 5 7-8" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function ChevR({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M7 4l6 6-6 6" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function ChevL({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M13 4L7 10l6 6" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function Plus({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M10 4v12M4 10h12" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    </Svg>
  );
}

export function Edit({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M13 3l4 4-9 9H4v-4l9-9z" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
