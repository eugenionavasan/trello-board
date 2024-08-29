import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { CardItem, ItemTypes } from './types';

interface DraggableCardProps {
  card: CardItem;
  moveCard: (dragIndex: number, hoverIndex: number, sourceColumnId: string, targetColumnId: string) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ card, moveCard }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: card,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop<CardItem, void, { handlerId: string | symbol | null }>({
    accept: ItemTypes.CARD,
    hover(item: CardItem) {
      if (item.id === card.id) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = card.index;
      const sourceColumnId = item.columnId;
      const targetColumnId = card.columnId;

      moveCard(dragIndex, hoverIndex, sourceColumnId, targetColumnId);
      item.index = hoverIndex;
      item.columnId = targetColumnId;
    },
  });

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="mb-2 cursor-move">
        <CardContent className="p-2">
          {card.content}
        </CardContent>
      </Card>
    </div>
  );
};

export default DraggableCard;