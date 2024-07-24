import { IpcHandler } from '../main/preload';
import { Window } from "../main/preload";

declare global {
  export interface Window extends Window {}
}
