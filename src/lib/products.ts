import type { Category } from '@/types';

export interface SampleProduct {
  id: string;
  title: string;
  category: Category;
  image: string;
  askPrice: number;
}

export const sampleProducts: SampleProduct[] = [
  {
    id: 'p1',
    title: 'Ford Focus 1.5 TDCi 2018 — 82 000 km',
    category: 'cars',
    image:
      'https://images.pexels.com/photos/27138933/pexels-photo-27138933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    askPrice: 12500,
  },
  {
    id: 'p2',
    title: 'iPhone 13 Pro 256 Go — Occasion très bon état',
    category: 'phones',
    image:
      'https://images.pexels.com/photos/10883732/pexels-photo-10883732.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    askPrice: 549,
  },
  {
    id: 'p3',
    title: 'MacBook Air M1 2020 — 8 Go / 256 Go',
    category: 'computers',
    image:
      'https://images.pexels.com/photos/34804001/pexels-photo-34804001.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    askPrice: 720,
  },
  {
    id: 'p4',
    title: 'PS4 Pro 1 To + 2 manettes + 5 jeux',
    category: 'consoles',
    image:
      'https://images.pexels.com/photos/4523006/pexels-photo-4523006.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    askPrice: 280,
  },
  {
    id: 'p5',
    title: 'Canapé en cuir 3 places — vintage restauré',
    category: 'furniture',
    image:
      'https://images.pexels.com/photos/6480707/pexels-photo-6480707.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    askPrice: 450,
  },
];

export const categoryLabels: Record<Category, string> = {
  cars: 'Voitures',
  phones: 'Téléphones',
  computers: 'Ordinateurs',
  consoles: 'Consoles',
  furniture: 'Meubles',
  appliances: 'Électroménager',
};
