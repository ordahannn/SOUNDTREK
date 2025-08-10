import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';

const iconWrapper = (name: React.ComponentProps<typeof MaterialIcons>['name']) =>
  ({ size = 24, color = '#000', ...rest }: { size?: number; color?: string }) =>
    <MaterialIcons name={name} size={size} color={color} {...rest} />;

export const Forward10Icon = iconWrapper('forward-10');
export const Replay10Icon = iconWrapper('replay-10');
export const PauseIcon = iconWrapper('pause');
export const PlayIcon = iconWrapper('play-arrow');
export const ChevronUpIcon = iconWrapper('keyboard-arrow-up');
export const ChevronDownIcon = iconWrapper('keyboard-arrow-down');
export const ArrowBackIcon = iconWrapper('arrow-back');
export const LyricsIcon = iconWrapper('lyrics');
export const PencilIcon = iconWrapper('edit');
export const TrashIcon = iconWrapper('delete');
export const CheckIcon = iconWrapper('check');