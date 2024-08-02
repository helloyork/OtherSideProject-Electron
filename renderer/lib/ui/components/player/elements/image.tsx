import { Image as GameImage, ImagePosition } from "@/lib/game/game/elements/image";
import { Image as ReactImage } from "@nextui-org/react";
import Isolated from "@/lib/ui/elements/isolated";
import { useAspectRatio } from "@/lib/ui/providers/ratio";
import clsx from "clsx";

export default function Image({
  image
}: Readonly<{
  image: GameImage;
}>) {
  const { ratio } = useAspectRatio();

  const {
    src,
    position,
    height,
    width,
    scale,
    rotation,
  } = image.config;

  const isCommonPosition = image.isCommonImagePosition(position);
  const isCoord2D = image.isCoord2D(position);
  const isAlign = image.isAlign(position);

  const left = isCommonPosition ? (
    position === ImagePosition.left ? "25.33%" :
      position === ImagePosition.center ? "50%" :
        position === ImagePosition.right ? "75.66%" : undefined
  ) : isCoord2D ? position.x : isAlign ? `${position.xalign * 100}%` : undefined;

  const top = isCommonPosition ? "50%" : isCoord2D ? position.y : isAlign ? `${position.yalign * 100}%` : undefined;

  const transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;

  return (
    <div className={
      clsx("fixed inset-0 flex items-center justify-center z-0")
    } style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed'
    }}>
      <div style={{
        width: `${ratio.w}px`,
        height: `${ratio.h}px`,
        position: 'relative'
      }}>

        <img
          className=""
          src={src}
          width={width}
          height={height}
          style={{
            transform,
            left,
            top,
            position: 'absolute'
          }}
        />
      </div>
    </div>
  );
};