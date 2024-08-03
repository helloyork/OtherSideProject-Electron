import { Image as GameImage, ImagePosition } from "@/lib/game/game/elements/image";
import { useAspectRatio } from "@/lib/ui/providers/ratio";
import clsx from "clsx";
import {Transform, TransformNameSpace} from "@lib/game/game/elements/transformNameSpace";
import { useEffect } from "react";
import { GameState } from "../player";
import { useAnimate } from "framer-motion";

export default function Image({
  image,
  state
}: Readonly<{
  image: GameImage;
  state: GameState;
}>) {
  const { ratio } = useAspectRatio();
  const [scope, animate] = useAnimate();

  const {
    src,
    position,
    height,
    width,
    scale,
    rotation,
  } = image.config;

  const { left, top } = Transform.positionToCSS(position);

  const transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;

  useEffect(() => {
    const listening = [
      GameState.EventTypes["event:image.show"],
      GameState.EventTypes["event:image.hide"]
    ];
    console.log("listening to", listening)
    const fc = listening.map((type) => {
      return state.events.on(type, async (target, transform) => {
        if (target !== image) return;
        if (type === GameState.EventTypes["event:image.show"]) {
          scope.current.style.opacity = "0";
        } // @TODO: add more cases
        await transform.animate(scope, animate);
        return true;
      });
    });
    return () => {
      fc.forEach((fc) => {
        state.events.off(GameState.EventTypes["event:image.show"], fc);
      });
    };
  }, []);

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
          ref={scope}
        />
      </div>
    </div>
  );
};