import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

const SOURCES = {
  bell:  require('../../assets/sounds/bell.wav'),
  chime: require('../../assets/sounds/chime.wav'),
} as const;

// Called once at app startup — keeps audio session configured so playPreview
// has no async setup work on the hot path.
export async function initAudio(): Promise<void> {
  try {
    await setAudioModeAsync({
      playsInSilentMode: false,
      shouldRouteThroughEarpiece: false,
    });
  } catch (e) {
    console.warn('[sound] initAudio failed:', e);
  }
}

let _player: AudioPlayer | null = null;

export function playPreview(sound: 'bell' | 'chime'): void {
  try {
    if (_player) {
      _player.remove();
      _player = null;
    }
    const player = createAudioPlayer(SOURCES[sound]);
    _player = player;
    const sub = player.addListener('playbackStatusUpdate', status => {
      if (status.didJustFinish) {
        sub.remove();
        player.remove();
        if (_player === player) _player = null;
      }
    });
    player.play();
  } catch (e) {
    console.warn('[sound] playPreview failed:', e);
  }
}
