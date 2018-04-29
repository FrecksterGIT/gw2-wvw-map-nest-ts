interface IEmblemDetailsDef {
  id: number;
  colors: number[];
}

interface IEmblemDef {
  background: IEmblemDetailsDef;
  foreground: IEmblemDetailsDef;
}

export interface IGuild {
  id: string;
  name: string;
  tag: string;
  emblem: IEmblemDef;
  flags: string[];
}
