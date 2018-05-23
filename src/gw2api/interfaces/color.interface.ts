/* color interface for emblem rendering*/

interface IColorDefinition {
  brightness: number;
  contrast: number;
  hue: number;
  saturation: number;
  lightness: number;
  rgb: [number, number, number];
}

export default interface IColor {
  id: number;
  name: string;
  base_rgb: [number, number, number];
  cloth: IColorDefinition;
  leather: IColorDefinition;
  metal: IColorDefinition;
  item: number;
  categories: string[];
}
