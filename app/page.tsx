'use client'

import { useState } from 'react'
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

  const moveCard = (cardId: string, targetColumnId: string) => {
    let movedCard: CardItem | undefined

    const updatedColumns = columns.map(col => {
      if (col.cards.find(card => card.id === cardId)) {
        movedCard = col.cards.find(card => card.id === cardId)
        return { ...col, cards: col.cards.filter(card => card.id !== cardId) }
      }
      return col
    })

    if (movedCard) {
      setColumns(updatedColumns.map(col => {
        if (col.id === targetColumnId) {
          return { ...col, cards: [...col.cards, movedCard!] }
        }
        return col
      }))
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
      <div className="flex space-x-4">
        {columns.map(column => (
          <div key={column.id} className="bg-gray-100 p-4 rounded-lg w-64">
            <h2 className="font-semibold mb-2">{column.title}</h2>
            <div className="min-h-[200px]">
              {column.cards.map(card => (
                <Card key={card.id} className="mb-2">
                  <CardContent className="p-2">
                    <div>{card.content}</div>
                    <select
                      onChange={(e) => moveCard(card.id, e.target.value)}
                      defaultValue={column.id}
                      className="mt-2"
                    >
                      {columns.map(col => (
                        <option key={col.id} value={col.id}>
                          Move to {col.title}
                        </option>
                      ))}
                    </select>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                <PlusIcon className="mr-2 h-4 w-4" /> Add Card
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}