'use client'

import React, { useState, useCallback } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon } from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';

interface CardItem {
  id: string;
  content: string;
  columnId: string;
}

interface Column {
  id: string;
  title: string;
  cards: CardItem[];
}

const SortableCard: React.FC<CardItem> = ({ id, content }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-2 cursor-move">
        <CardContent className="p-2">{content}</CardContent>
      </Card>
    </div>
  );
};

interface DroppableColumnProps {
  column: Column;
  cards: CardItem[];
  addCard: (columnId: string, content: string) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ column, cards, addCard }) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const handleAddCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('newCard') as HTMLInputElement;
    if (input.value.trim()) {
      addCard(column.id, input.value.trim());
      input.value = '';
    }
  };

  return (
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-lg w-64 flex flex-col h-full">
      <h2 className="font-semibold mb-2">{column.title}</h2>
      <SortableContext items={cards} strategy={verticalListSortingStrategy}>
        <div className="min-h-[200px] flex-grow overflow-y-auto">
          {cards.map((card) => (
            <SortableCard key={card.id} {...card} />
          ))}
        </div>
      </SortableContext>
      <form onSubmit={handleAddCard} className="mt-2">
        <Input
          name="newCard"
          type="text"
          placeholder="New card"
          className="mb-2"
        />
        <Button type="submit" className="w-full">
          <PlusIcon className="mr-2 h-4 w-4" /> Add Card
        </Button>
      </form>
    </div>
  );
};

export default function TrelloBoard() {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'column1', title: 'To Do', cards: [] },
    { id: 'column2', title: 'In Progress', cards: [] },
    { id: 'column3', title: 'Review', cards: [] },
    { id: 'column4', title: 'Done', cards: [] },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setColumns((prevColumns) => {
      const activeColumnIndex = prevColumns.findIndex((col) => 
        col.cards.some((card) => card.id === activeId)
      );
      const overColumnIndex = prevColumns.findIndex((col) => col.id === overId || col.cards.some((card) => card.id === overId));

      if (activeColumnIndex !== overColumnIndex) {
        // Moving between columns
        const newColumns = [...prevColumns];
        const activeColumn = newColumns[activeColumnIndex];
        const overColumn = newColumns[overColumnIndex];
        const activeCardIndex = activeColumn.cards.findIndex((card) => card.id === activeId);

        const [movedCard] = activeColumn.cards.splice(activeCardIndex, 1);
        movedCard.columnId = overColumn.id;

        const overCardIndex = overColumn.cards.findIndex((card) => card.id === overId);
        if (overCardIndex === -1) {
          // If dropped on column or column is empty, add to end
          overColumn.cards.push(movedCard);
        } else {
          // If dropped on card, insert before that card
          overColumn.cards.splice(overCardIndex, 0, movedCard);
        }

        return newColumns;
      } else {
        // Reordering within the same column
        const column = prevColumns[activeColumnIndex];
        const oldIndex = column.cards.findIndex((card) => card.id === activeId);
        const newIndex = column.cards.findIndex((card) => card.id === overId);

        const newColumns = [...prevColumns];
        newColumns[activeColumnIndex].cards = arrayMove(column.cards, oldIndex, newIndex);

        return newColumns;
      }
    });

    setActiveId(null);
  }, []);

  const addCard = useCallback((columnId: string, content: string) => {
    const newCard: CardItem = { id: Date.now().toString(), content, columnId };
    setColumns(prevColumns => prevColumns.map(col => {
      if (col.id === columnId) {
        return { ...col, cards: [...col.cards, newCard] };
      }
      return col;
    }));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trello-like Board</h1>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4">
          {columns.map(column => (
            <DroppableColumn key={column.id} column={column} cards={column.cards} addCard={addCard} />
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <Card className="mb-2 cursor-move">
              <CardContent className="p-2">
                {columns.flatMap(col => col.cards).find(card => card.id === activeId)?.content}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}