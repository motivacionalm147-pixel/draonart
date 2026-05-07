export interface ProjectConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  frames?: any[];
  thumbnail?: string;
  updatedAt?: number;
  fps?: number;
}
