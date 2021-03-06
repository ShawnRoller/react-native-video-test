import * as React from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import VideoView from './video-view';
import styles from './styles';

type Props = {
  children: React.ReactNode;
  videoURLs: string[];
  shouldStartVideo?: boolean;
  startDelaySeconds?: number;
}

const IdleVideo = (props: Props) => {
  const [videoIndex, setVideoIndex] = React.useState(0);
  const [showingVideo, setShowingVideo] = React.useState(false);
  const [timerSeconds, setTimerSeconds] = React.useState(0);
  const [currentURL, setCurrentURL] = React.useState<string>('');
  const timerTick = React.useRef<() => void>();
  const { children, startDelaySeconds = 0, videoURLs, shouldStartVideo = true } = props;

  const tick = React.useCallback(() => {
    setTimerSeconds((seconds) => seconds + 1);

    if (timerSeconds >= startDelaySeconds) {
      setShowingVideo(true);
    } else {
      setShowingVideo(false);
    }
  }, [timerSeconds, startDelaySeconds, setShowingVideo]);

  if (startDelaySeconds) {
    timerTick.current = tick;
  }

  React.useEffect(() => {
    if (startDelaySeconds === 0) {
      setShowingVideo(true);
    }
  }, [startDelaySeconds]);

  React.useEffect(() => {
    if (startDelaySeconds === 0 || showingVideo || !shouldStartVideo) {
      return;
    }
    const id = setInterval(
      () => timerTick.current && timerTick.current(),
      1000,
    );
    // eslint-disable-next-line consistent-return
    return () => clearInterval(id);
  }, [startDelaySeconds, showingVideo, shouldStartVideo]);

  const onVideoEnd = React.useCallback(() => {
    if (videoURLs.length) {
      const newVideoIndex = videoIndex >= videoURLs.length ? 0 : videoIndex + 1;
      setVideoIndex(newVideoIndex);
    }
  }, [videoURLs, videoIndex, setVideoIndex]);

  const onTouch = () => {
    setShowingVideo(false);
    setTimerSeconds(0);
  };

  const onError = () => {
    onVideoEnd();
  };

  React.useEffect(() => {
    const nextURL = videoURLs.length > videoIndex ? videoURLs[videoIndex] : '';
    setCurrentURL(nextURL);
  }, [videoURLs, videoIndex, setCurrentURL]);

  return (
    <TouchableWithoutFeedback
      style={styles.container}
      onPress={onTouch}
      activeOpacity={1}
    >
      {children}
      {(showingVideo && !!currentURL && !!currentURL.length) ? (
        <View style={styles.videoContainer}>
          <VideoView
            videoURL={currentURL}
            onEnd={videoURLs.length === 1 ? () => { } : onVideoEnd}
            onError={onError}
            repeat={videoURLs.length === 1}
          />
        </View>
      ) : null}
    </TouchableWithoutFeedback>
  );
};

export default IdleVideo;
