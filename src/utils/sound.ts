import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const SOURCES = {
  bell:  require('../../assets/sounds/bell.wav'),
  chime: require('../../assets/sounds/chime.wav'),
} as const;

let _player: ReturnType<typeof createAudioPlayer> | null = null;

export async function playPreview(sound: 'bell' | 'chime'): Promise<void> {
  try {
    if (_player) {
      _player.remove();
      _player = null;
    }
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
    });
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
