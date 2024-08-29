'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'

interface CardItem {
  id: string
  content: string
}

interface Column {
  id: string
  title: string
  cards: CardItem[]
}

export default function TrelloBoard() {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'column1', title: 'To Do', cards: [] },
    { id: 'column2', title: 'In Progress', cards: [] },
    { id: 'column3', title: 'Review', cards: [] },
    { id: 'column4', title: 'Done', cards: [] },
  ])

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    // If there's no destination, we don't need to do anything
    if (!destination) return

    // If the source and destination are the same, we don't need to update the state
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    // Find the source and destination columns
    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    // Create new array of cards for the source column
    const sourceCards = Array.from(sourceColumn.cards)
    // Remove the dragged card from the source column
    const [removedCard] = sourceCards.splice(source.index, 1)

    if (source.droppableId === destination.droppableId) {
      // If it's the same column, just reorder
      sourceCards.splice(destination.index, 0, removedCard)
      const newColumns = columns.map(col => 
        col.id === sourceColumn.id ? { ...col, cards: sourceCards } : col
      )
      setColumns(newColumns)
    } else {
      // If it's a different column, remove from one and add to the other
      const destCards = Array.from(destColumn.cards)
      destCards.splice(destination.index, 0, removedCard)
      const newColumns = columns.map(col => {
        if (col.id === sourceColumn.id) {
          return { ...col, cards: sourceCards }
        }
        if (col.id === destColumn.id) {
          return { ...col, cards: destCards }
        }
        return col
      })
      setColumns(newColumns)
    }
  }

  const addCard = (columnId: string, content: string) => {
    const newCard: CardItem = { id: Date.now().toString(), content }
    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return { ...col, cards: [...col.cards, newCard] }
      }
      return col
    }))
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trello-like Board</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {columns.map(column => (
            <div key={column.id} className="bg-gray-100 p-4 rounded-lg w-64">
              <h2 className="font-semibold mb-2">{column.title}</h2>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px]"
                  >
                    {column.cards.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2 cursor-move"
                          >
                            <CardContent className="p-2">
                              {card.content}
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <div className="mt-2">
                <Input
                  type="text"
                  placeholder="New card"
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement
                      addCard(column.id, target.value)
                      target.value = ''
                    }
                  }}
                  className="mb-2"
                />
                <Button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                    if (input.value) {
                      addCard(column.id, input.value)
                      input.value = ''
                    }
                  }}
                  className="w-full"
                >
                  <PlusIcon className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}