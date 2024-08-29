export interface CardItem {
  id: string;
  content: string;
  columnId: string;
  index: number;
}

export interface Column {
  id: string;
  title: string;
  cards: CardItem[];
}

export const ItemTypes = {
  CARD: 'card',
};