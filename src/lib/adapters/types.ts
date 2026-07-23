export interface RawPost {
  externalId: string;
  caption: string;
  url: string;
  likes?: number;
  comments?: number;
  views?: number;
  postedAt?: string; // ISO date
}
