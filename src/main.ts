import './style.css';
import { CloudQuestGame } from './game';

const canvas = document.querySelector<HTMLCanvasElement>('#game');

if (!canvas) {
  throw new Error('Game canvas was not found.');
}

new CloudQuestGame(canvas);
