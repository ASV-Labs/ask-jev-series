export type ServiceId =
  | "netflix"
  | "prime"
  | "disney"
  | "max"
  | "apple"
  | "hulu"
  | "paramount"
  | "peacock"
  | "crunchyroll";

export type Series = {
  id: string;
  name: string;
  glyph: string;
  group: ServiceId;
  meta: string;
  year: number;
  ended?: number;
  episodes: number;
  finished: boolean;
  genres: string[];
  intensity: 1 | 2 | 3 | 4 | 5;
  family: boolean;
  background: boolean;
  fumbledEnding?: boolean;
  blurb: string;
  facts: string;
};

export type Corpus = {
  id: string;
  label: string;
  tagline: string;
  collection: string;
  shape: "poster";
  examples: string[];
  refinements: string[];
  filter: {
    label: string;
    options: { id: string; label: string }[];
  };
  items: Series[];
};

export type Verdict = {
  id: string;
  probability: number;
};
