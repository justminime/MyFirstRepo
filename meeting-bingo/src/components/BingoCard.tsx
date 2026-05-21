import type { BingoCard as BingoCardType, WinningLine } from '../types';
import { BingoSquare } from './BingoSquare';

interface Props {
  card: BingoCardType;
  winningLine: WinningLine | null;
  onSquareClick: (row: number, col: number) => void;
}

export function BingoCard({ card, winningLine, onSquareClick }: Props) {
  const winningIds = new Set(winningLine?.squares ?? []);

  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
      {card.squares.map((row, r) =>
        row.map((sq, c) => (
          <BingoSquare
            key={sq.id}
            word={sq.word}
            isFilled={sq.isFilled}
            isAutoFilled={sq.isAutoFilled}
            isFreeSpace={sq.isFreeSpace}
            isWinningSquare={winningIds.has(sq.id)}
            onClick={() => onSquareClick(r, c)}
          />
        )),
      )}
    </div>
  );
}
