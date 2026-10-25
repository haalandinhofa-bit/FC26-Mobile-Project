export type Pos = "GK" | "LB" | "CB" | "RB" | "CDM" | "CM" | "CAM" | "LW" | "RW" | "ST";

export type FormationId =
  | "4-3-3"
  | "4-2-3-1"
  | "4-4-2"
  | "4-1-2-1-2"
  | "3-5-2"
  | "3-4-3"
  | "5-3-2"
  | "4-5-1";

export type PlayStyle = "possession" | "balanced" | "counter" | "press";

export type Difficulty = "easy" | "normal" | "hard" | "world";

export type Weather = "night" | "day" | "overcast" | "rain";

export type CameraMode = "broadcast" | "tele" | "wide" | "tactical";

export type Graphics = "low" | "medium" | "high";

export type Assistance = "low" | "med" | "high";

export type Visual = {
  skin: number;
  hair: number;
  hairStyle: number;
  bulk: number;
};

export type Player = {
  id: string;
  name: string;
  nat: string;
  pos: Pos;
  num: number;
  age: number;
  height: number;
  foot: "L" | "R";
  ovr: number;
  pot: number;
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  visual: Visual;
  tendencies: string[];
  clubId: string;
};

export type Club = {
  id: string;
  name: string;
  short: string;
  league: string;
  city: string;
  kit: [string, string, string];
  stadium: string;
  rep: number;
};

export type League = {
  id: string;
  name: string;
  region: string;
  nation: string;
};

export type Nation = {
  id: string;
  name: string;
  confed: string;
  kit: [string, string, string];
};

export type Tactics = {
  depth: number;
  width: number;
  press: number;
  tempo: number;
  style: PlayStyle;
  formation: FormationId;
  penalty: string;
  captain: string;
};

export type Slot = { pos: Pos; x: number; z: number };

export type Settings = {
  graphics: Graphics;
  fps: 30 | 60;
  sfx: number;
  crowd: number;
  vibration: boolean;
  buttonScale: number;
  leftHanded: boolean;
  assistance: Assistance;
  camera: CameraMode;
  difficulty: Difficulty;
  lengthMin: 4 | 6 | 8 | 10;
};

export const FORMATION_IDS: FormationId[] = [
  "4-3-3",
  "4-2-3-1",
  "4-4-2",
  "4-1-2-1-2",
  "3-5-2",
  "3-4-3",
  "5-3-2",
  "4-5-1",
];

export const DEFAULT_SETTINGS: Settings = {
  graphics: "medium",
  fps: 60,
  sfx: 0.8,
  crowd: 0.45,
  vibration: true,
  buttonScale: 1,
  leftHanded: false,
  assistance: "med",
  camera: "broadcast",
  difficulty: "normal",
  lengthMin: 6,
};

export function defaultTactics(formation: FormationId = "4-3-3"): Tactics {
  return {
    depth: 0.52,
    width: 0.64,
    press: 0.5,
    tempo: 0.52,
    style: "balanced",
    formation,
    penalty: "",
    captain: "",
  };
}
