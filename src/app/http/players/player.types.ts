export type API_Player_Payload = {
  nickname: string;
  age: number;
  phone: string;
  email: string;
  platform: string;
}

export type API_Player_Result = API_Player_Payload & {
  id: number;
};
