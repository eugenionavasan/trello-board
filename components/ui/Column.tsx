import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon } from 'lucide-react';
import DraggableCard from './DraggableCard';
import { Column as ColumnType, CardItem, ItemTypes } from './types';

interface ColumnProps {
  column: ColumnType;
  moveCard: (dragIndex: number, hoverIndex: number, sourceColumnId: string, targetColumnId: string) => void;
  addCard: (columnId: string, content: string) => void;
}

const Column: React.FC<ColumnProps> = ({ column, moveCard, addCard }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop<CardItem, void, { handlerId: string | symbol | null }>({
    accept: ItemTypes.CARD,
    drop(item: CardItem, monitor) {
      const didDrop = monitor.didDrop();
      if (didDrop) return;
      
      if (item.columnId !== column.id) {
        moveCard(item.index, column.cards.length, item.columnId, column.id);
      }
    },
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
  });

  drop(ref);

  return (
    <div ref={ref} className="bg-gray-100 p-4 rounded-lg w-64 flex flex-col h-[400px]">
      <h2 className="font-semibold mb-2">{column.title}</h2>
      <div className="flex-grow overflow-y-auto mb-4">
        {column.cards.map((card, index) => (
          <DraggableCard 
            key={card.id} 
            card={{...card, index}} 
            moveCard={moveCard} 
          />
        ))}
      </div>
      <div className="mt-auto">
        <Input
          type="text"
          placeholder="New card"
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              const target = e.target as HTMLInputElement;
              if (target.value.trim()) {
                addCard(column.id, target.value.trim());
                target.value = '';
              }
            }
          }}
          className="mb-2"
        />
        <Button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
            if (input.value.trim()) {
              addCard(column.id, input.value.trim());
              input.value = '';
            }
          }}
          className="w-full"
        >
          <PlusIcon className="mr-2 h-4 w-4" /> Add Card
        </Button>
      </div>
    </div>
  );
};

export default Column;