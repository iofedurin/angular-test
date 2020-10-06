export type API_Game_Payload = {
  name: string;
  genre: string;
  releaseDate: Date;
  platform: string;
  developer: string;
  esrbRating: number;
}

export type API_Game_Result = API_Game_Payload & {
  id: number;
}
