import { Audio } from 'expo-av';

const SOURCES = {
  bell:  require('../../assets/sounds/bell.wav'),
  chime: require('../../assets/sounds/chime.wav'),
} as const;

export async function playPreview(sound: 'bell' | 'chime'): Promise<void> {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound: av } = await Audio.loadAsync(SOURCES[sound]);
    await av.playAsync();
    av.setOnPlaybackStatusUpdate(status => {
      if (status.isLoaded && status.didJustFinish) {
        av.unloadAsync();
      }
    });
  } catch {
    // silently ignore if audio unavailable
  }
}
