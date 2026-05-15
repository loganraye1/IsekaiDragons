import { useEffect, useState } from "react";
import { Image, type ImageStyle, type StyleProp } from "react-native";
import {
  fireHatchlingSpineAnimations,
  type FireHatchlingSpineAnimationId
} from "../data/fireHatchlingSpineAnimations";

export function SpineFrameDragon({
  animationId,
  reducedMotion,
  style
}: {
  animationId: FireHatchlingSpineAnimationId;
  reducedMotion: boolean;
  style?: StyleProp<ImageStyle>;
}) {
  const animation = fireHatchlingSpineAnimations[animationId] ?? fireHatchlingSpineAnimations.idle_loop;
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0);

    if (reducedMotion || animation.frames.length <= 1) {
      return;
    }

    const frameDurationMs = Math.max(24, Math.round(1000 / animation.fps));
    const timer = setInterval(() => {
      setFrameIndex((currentFrame) => {
        const nextFrame = currentFrame + 1;
        if (nextFrame < animation.frames.length) {
          return nextFrame;
        }
        return animation.loop ? 0 : currentFrame;
      });
    }, frameDurationMs);

    return () => clearInterval(timer);
  }, [animation.fps, animation.frames.length, animation.loop, animationId, reducedMotion]);

  const safeFrameIndex = reducedMotion
    ? 0
    : Math.min(frameIndex, Math.max(0, animation.frames.length - 1));

  return (
    <Image
      accessibilityLabel={`Fire hatchling Spine frame animation: ${animation.id}`}
      resizeMode="contain"
      source={animation.frames[safeFrameIndex]}
      style={style}
    />
  );
}
