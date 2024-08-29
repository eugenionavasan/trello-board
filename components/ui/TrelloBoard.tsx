"use client"

import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Column from './Column';
import { Column as ColumnType, CardItem } from './types';

const TrelloBoard: React.FC = () => {
  const [columns, setColumns] = useState<ColumnType[]>([
    { id: 'column1', title: 'To Do', cards: [] },
    { id: 'column2', title: 'In Progress', cards: [] },
    { id: 'column3', title: 'Review', cards: [] },
    { id: 'column4', title: 'Done', cards: [] },
  ]);

  const moveCard = useCallback((dragIndex: number, hoverIndex: number, sourceColumnId: string, targetColumnId: string) => {
    setColumns(prevColumns => {
      const newColumns = JSON.parse(JSON.stringify(prevColumns)) as ColumnType[];
      const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
      const targetColumn = newColumns.find(col => col.id === targetColumnId);

      if (sourceColumn && targetColumn) {
        const [removedCard] = sourceColumn.cards.splice(dragIndex, 1);
        targetColumn.cards.splice(hoverIndex, 0, { ...removedCard, columnId: targetColumnId, index: hoverIndex });
        
        sourceColumn.cards.forEach((card, index) => { card.index = index; });
        targetColumn.cards.forEach((card, index) => { card.index = index; });
      }

      return newColumns;
    });
  }, []);

  const addCard = useCallback((columnId: string, content: string) => {
    setColumns(prevColumns => prevColumns.map(col => {
      if (col.id === columnId) {
        const newCard: CardItem = { id: Date.now().toString(), content, columnId, index: col.cards.length };
        return { ...col, cards: [...col.cards, newCard] };
      }
      return col;
    }));
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Trello-like Board</h1>
        <div className="flex space-x-4">
          {columns.map(column => (
            <Column 
              key={column.id} 
              column={column} 
              moveCard={moveCard} 
              addCard={addCard} 
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default TrelloBoard;