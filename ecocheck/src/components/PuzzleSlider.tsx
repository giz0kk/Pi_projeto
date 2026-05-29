import { useCallback, useEffect, useRef, useState } from "react";
import type { ChallengeState } from "../types";
import { HumanBehaviorValidator } from "../services/HumanBehaviorValidator";

interface PuzzleSliderProps {
  challenge: ChallengeState;
  onSuccess: (positionX: number, validator: HumanBehaviorValidator) => void;
  onFail: (message: string) => void;
  disabled?: boolean;
}

/**
 * PuzzleSlider
 * ------------
 * Exibe imagem com recorte e trilho. O usuario arrasta a peca ate encaixar.
 * Registra movimento no HumanBehaviorValidator durante o drag.
 */
export function PuzzleSlider({
  challenge,
  onSuccess,
  onFail,
  disabled,
}: PuzzleSliderProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const validatorRef = useRef(new HumanBehaviorValidator());
  const trackRef = useRef<HTMLDivElement>(null);
  const maxX = challenge.width - challenge.pieceSize;

  const resetPiece = useCallback(() => {
    setOffsetX(0);
    validatorRef.current.reset();
  }, []);

  useEffect(() => {
    resetPiece();
  }, [challenge.challengeId, resetPiece]);

  const pointerDown = (clientX: number, clientY: number) => {
    if (disabled) return;
    setDragging(true);
    validatorRef.current.start();
    validatorRef.current.addSample(clientX, clientY);
  };

  const pointerMove = (clientX: number, clientY: number) => {
    if (!dragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(maxX, clientX - rect.left - challenge.pieceSize / 2));
    setOffsetX(x);
    validatorRef.current.addSample(clientX, clientY);
  };

  const pointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const analysis = validatorRef.current.analyze();
    if (!analysis.ok) {
      onFail(analysis.reason || "Comportamento suspeito.");
      resetPiece();
      return;
    }
    onSuccess(offsetX, validatorRef.current);
  };

  return (
    <div className="space-y-3">
      <div
        className="relative overflow-hidden rounded-xl border border-eco-mint/80 bg-eco-cream shadow-inner"
        style={{ width: challenge.width, height: challenge.height }}
      >
        {challenge.background ? (
          <img
            src={challenge.background}
            alt=""
            className="h-full w-full object-cover select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-eco-mint/40 to-eco-emerald/20"
            aria-hidden
          />
        )}

        {challenge.piece && (
          <img
            src={challenge.piece}
            alt=""
            className="absolute select-none touch-none"
            style={{
              width: challenge.pieceSize,
              height: challenge.pieceSize,
              left: offsetX,
              top: challenge.pieceY,
              cursor: disabled ? "not-allowed" : dragging ? "grabbing" : "grab",
              transition: dragging ? "none" : "left 0.15s ease",
              filter: "drop-shadow(0 8px 16px rgba(10,61,46,0.25))",
            }}
            draggable={false}
            onMouseDown={(e) => {
              e.preventDefault();
              pointerDown(e.clientX);
            }}
            onTouchStart={(e) => {
              pointerDown(e.touches[0].clientX);
            }}
          />
        )}
      </div>

      <div
        ref={trackRef}
        className="relative h-11 rounded-full bg-gradient-to-r from-slate-100 to-eco-cream border border-eco-mint/70"
        style={{ width: challenge.width }}
        onMouseMove={(e) => pointerMove(e.clientX)}
        onMouseUp={pointerUp}
        onMouseLeave={() => dragging && pointerUp()}
        onTouchMove={(e) => pointerMove(e.touches[0].clientX)}
        onTouchEnd={pointerUp}
      >
        <div className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-eco-forest/80 pointer-events-none">
          Arraste a peça para encaixar →
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-gradient-to-br from-eco-forest to-eco-emerald shadow-md border-2 border-white flex items-center justify-center text-white text-lg cursor-grab active:cursor-grabbing"
          style={{
            left: offsetX + challenge.pieceSize / 2 - 18,
            transition: dragging ? "none" : "left 0.15s ease",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            pointerDown(e.clientX);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            pointerDown(e.touches[0].clientX);
          }}
          role="slider"
          aria-valuenow={offsetX}
          aria-valuemin={0}
          aria-valuemax={maxX}
          aria-label="Arrastar peca do puzzle"
        >
          ⋮⋮
        </div>
      </div>
    </div>
  );
}
