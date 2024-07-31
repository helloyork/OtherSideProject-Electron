import { CalledActionResult } from "@/lib/game/game/dgame";
import Isolated from "@/lib/ui/elements/isolated";
import TypingEffect from "@/lib/ui/elements/player/typeing-effect";
import { toHex } from "@/lib/util/data";
import React, { useState } from "react";

export default function Say({
  action,
  onClick,
}: Readonly<{
  action: CalledActionResult<"character:say">;
  onClick?: () => void;
}>) {
  const { node } = action;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleComplete = () => {
    setCurrentWordIndex((prevIndex) => prevIndex + 1);
    if (currentWordIndex === node.getContent().text.length - 1) {
      setIsFinished(true);
    }
  };

  function onElementClick() {
    if (isFinished) {
      if (onClick) onClick();
    } else {
      setIsFinished(true);
    }
  }

  return (
    <Isolated>
      {node.getContent().state.display &&
        <div className="fixed bottom-0 w-[calc(100%-40px)] h-[calc(33%-40px)] bg-white m-4 box-border rounded-md shadow-md flex items-center justify-center" onClick={onElementClick}>
          <div className="absolute top-0 left-0 p-1.25 rounded-br-md m-4">
            {node.getContent().character.name}
          </div>
          <div className="text-center max-w-[80%] mx-auto">
            {
              node.getContent().text.map((word, index) => {
                if (isFinished) return (
                  <span key={index} style={{
                    color: typeof word.config.color === "string" ? word.config.color : toHex(word.config.color)
                  }}>
                    {word.text}
                  </span>
                );
                if (index > currentWordIndex) return null;
                return (
                  <span key={index} style={{
                    color: toHex(word.config.color)
                  }}>
                    <TypingEffect text={word.text} onComplete={index === currentWordIndex ? handleComplete : undefined} speed={50} />
                  </span>
                );
              })
            }
          </div>
        </div>
      }
    </Isolated>
  );
};