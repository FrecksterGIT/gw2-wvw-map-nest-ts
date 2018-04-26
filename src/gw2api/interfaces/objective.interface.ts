export interface IObjective {
  id: string;
  name: string;
  sector_id: number;
  type: string;
  map_type: string;
  map_id: number;
  coord: number[];
  label_coord: number[];
  marker: string;
  chat_link: string;
  upgrade_id?: number;
}
