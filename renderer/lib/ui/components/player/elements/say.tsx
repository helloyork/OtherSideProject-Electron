import { CalledActionResult } from "@/lib/game/game/dgame";
import Isolated from "@/lib/ui/elements/isolated";
import { toHex } from "@/lib/util/data";
import React from "react";

export default function Say({
  action,
  key,
  onClick,
}: Readonly<{
  action: CalledActionResult<"character:say">;
  key: any;
  onClick?: () => void;
}>) {
  const { node } = action;

  return (
    <Isolated key={key}>
      {node.getContent().config.display &&
        <div className="fixed bottom-0 w-full h-1/3 bg-blue-300  p-2.5 box-border" onClick={onClick}>
          <div className="absolute top-0 left-0 p-1.25 rounded-br-md">
            {node.getContent().character.name}
          </div>
          <div className="mt-5 text-center">
            {/* @TODO: Implement this */}
            {node.getContent().text.map((word, key) => {
              return (
                <span key={key} style={{
                  color: typeof word.config.color === "string" ? word.config.color : toHex(word.config.color)
                }}>
                  {word.text}
                </span>
              )
            })}
          </div>
        </div>
      }
    </Isolated>
  )
};