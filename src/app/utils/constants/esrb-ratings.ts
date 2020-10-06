export type ESRB_RATING = {
  name: string;
  minAge: number;
}

export const ESRB_RATINGS: ESRB_RATING[] = [
  {
    name: 'EC',
    minAge: 3,
  },
  {
    name: 'E',
    minAge: 6,
  },
  {
    name: 'E10+',
    minAge: 10,
  },
  {
    name: 'T',
    minAge: 13,
  },
  {
    name: 'M',
    minAge: 16,
  },
  {
    name: 'AO',
    minAge: 18,
  },
]
