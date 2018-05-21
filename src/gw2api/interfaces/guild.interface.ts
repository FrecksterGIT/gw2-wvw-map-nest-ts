export interface IEmblemDetailsDef {
  id: number;
  colors: number[];
}

interface IEmblemDef {
  background: IEmblemDetailsDef;
  foreground: IEmblemDetailsDef;
  flags: string[];
}

export interface IGuild {
  id: string;
  name: string;
  tag: string;
  emblem: IEmblemDef;
}
