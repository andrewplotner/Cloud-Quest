type FallingKind = 'star' | 'storm';

interface FallingObject {
  kind: FallingKind;
  x: number;
  y: number;
  radius: number;
  speed: number;
  rotation: number;
}

interface Player {
  x: number;
  y: number;
  targetX: number;
  radius: number;
}

export class CloudQuestGame {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly scoreElement = this.requireElement('#score');
  private readonly livesElement = this.requireElement('#lives');
  private readonly bestElement = this.requireElement('#best');
  private readonly overlay = this.requireElement('#overlay');
  private readonly overlayTitle = this.requireElement('#overlay-title');
  private readonly overlayMessage = this.requireElement('#overlay-message');
  private readonly actionButton = this.requireElement<HTMLButtonElement>('#action');

  private width = 0;
  private height = 0;
  private pixelRatio = 1;
  private player: Player = { x: 0, y: 0, targetX: 0, radius: 22 };
  private objects: FallingObject[] = [];
  private stars = 0;
  private lives = 3;
  private best = Number(localStorage.getItem('cloudQuestBest') ?? 0);
  private running = false;
  private lastFrame = 0;
  private spawnClock = 0;
  private elapsed = 0;
  private animationFrame = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas rendering is unavailable.');
    this.context = context;

    this.bestElement.textContent = String(this.best);
    this.actionButton.addEventListener('click', () => this.start());
    this.canvas.addEventListener('pointerdown', (event) => this.steer(event));
    this.canvas.addEventListener('pointermove', (event) => {
      if (event.buttons > 0 || event.pointerType === 'touch') this.steer(event);
    });
    window.addEventListener('keydown', (event) => this.handleKey(event));
    window.addEventListener('resize', () => this.resize());

    this.resize();
    this.draw();
  }

  private requireElement<T extends HTMLElement = HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) throw new Error(`Missing element: ${selector}`);
    return element;
  }

  private resize(): void {
    const bounds = this.canvas.getBoundingClientRect();
    this.width = bounds.width;
    this.height = bounds.height;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.pixelRatio);
    this.canvas.height = Math.round(this.height * this.pixelRatio);
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

    const startX = this.player.x || this.width / 2;
    this.player = {
      ...this.player,
      x: Math.min(Math.max(startX, 30), this.width - 30),
      targetX: Math.min(Math.max(this.player.targetX || startX, 30), this.width - 30),
      y: this.height - 82,
    };
    this.draw();
  }

  private start(): void {
    cancelAnimationFrame(this.animationFrame);
    this.stars = 0;
    this.lives = 3;
    this.elapsed = 0;
    this.spawnClock = 0;
    this.objects = [];
    this.player.x = this.width / 2;
    this.player.targetX = this.width / 2;
    this.updateHud();
    this.overlay.classList.add('hidden');
    this.running = true;
    this.lastFrame = performance.now();
    this.animationFrame = requestAnimationFrame((time) => this.loop(time));
  }

  private loop(time: number): void {
    if (!this.running) return;
    const delta = Math.min((time - this.lastFrame) / 1000, 0.034);
    this.lastFrame = time;
    this.update(delta);
    this.draw();
    this.animationFrame = requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  private update(delta: number): void {
    this.elapsed += delta;
    this.spawnClock -= delta;
    this.player.x += (this.player.targetX - this.player.x) * Math.min(delta * 12, 1);

    if (this.spawnClock <= 0) {
      this.spawnObject();
      this.spawnClock = Math.max(0.32, 0.72 - this.elapsed * 0.004);
    }

    const baseSpeed = 145 + Math.min(this.elapsed * 2.5, 190);
    for (const object of this.objects) {
      object.y += (baseSpeed + object.speed) * delta;
      object.rotation += delta * (object.kind === 'star' ? 2.4 : 0.7);
    }

    const survivors: FallingObject[] = [];
    for (const object of this.objects) {
      const distance = Math.hypot(object.x - this.player.x, object.y - this.player.y);
      if (distance < object.radius + this.player.radius - 5) {
        if (object.kind === 'star') {
          this.stars += 1;
        } else {
          this.lives -= 1;
        }
        this.updateHud();
      } else if (object.y < this.height + object.radius) {
        survivors.push(object);
      }
    }
    this.objects = survivors;

    if (this.lives <= 0) this.finish();
  }

  private spawnObject(): void {
    const stormChance = Math.min(0.28 + this.elapsed * 0.002, 0.52);
    const kind: FallingKind = Math.random() < stormChance ? 'storm' : 'star';
    const radius = kind === 'star' ? 13 : 22 + Math.random() * 12;
    this.objects.push({
      kind,
      x: radius + Math.random() * (this.width - radius * 2),
      y: -radius * 2,
      radius,
      speed: Math.random() * 55,
      rotation: Math.random() * Math.PI * 2,
    });
  }

  private finish(): void {
    this.running = false;
    if (this.stars > this.best) {
      this.best = this.stars;
      localStorage.setItem('cloudQuestBest', String(this.best));
      this.bestElement.textContent = String(this.best);
    }
    this.overlayTitle.textContent = 'Flight complete';
    this.overlayMessage.textContent = `You collected ${this.stars} star${this.stars === 1 ? '' : 's'}. Ready for another run?`;
    this.actionButton.textContent = 'Fly again';
    this.overlay.classList.remove('hidden');
  }

  private steer(event: PointerEvent): void {
    event.preventDefault();
    const bounds = this.canvas.getBoundingClientRect();
    this.player.targetX = Math.min(
      Math.max(event.clientX - bounds.left, this.player.radius),
      this.width - this.player.radius,
    );
  }

  private handleKey(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    this.player.targetX = Math.min(
      Math.max(this.player.targetX + direction * 42, this.player.radius),
      this.width - this.player.radius,
    );
  }

  private updateHud(): void {
    this.scoreElement.textContent = String(this.stars);
    this.livesElement.textContent = String(this.lives);
  }

  private draw(): void {
    const context = this.context;
    context.clearRect(0, 0, this.width, this.height);

    const sky = context.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, '#08172f');
    sky.addColorStop(0.55, '#164b76');
    sky.addColorStop(1, '#8cd0dd');
    context.fillStyle = sky;
    context.fillRect(0, 0, this.width, this.height);

    this.drawWindLines(context);
    for (const object of this.objects) this.drawObject(context, object);
    this.drawPlayer(context);
  }

  private drawWindLines(context: CanvasRenderingContext2D): void {
    context.save();
    context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    context.lineWidth = 2;
    for (let index = 0; index < 7; index += 1) {
      const y = ((index * 103 + this.elapsed * 64) % (this.height + 80)) - 40;
      const x = (index * 71) % Math.max(this.width, 1);
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(Math.min(x + 45, this.width), y + 15);
      context.stroke();
    }
    context.restore();
  }

  private drawObject(context: CanvasRenderingContext2D, object: FallingObject): void {
    context.save();
    context.translate(object.x, object.y);
    context.rotate(object.rotation);

    if (object.kind === 'star') {
      context.shadowColor = '#ffe79b';
      context.shadowBlur = 18;
      context.fillStyle = '#ffd75e';
      context.beginPath();
      for (let point = 0; point < 10; point += 1) {
        const angle = -Math.PI / 2 + (point * Math.PI) / 5;
        const radius = point % 2 === 0 ? object.radius : object.radius * 0.46;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (point === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
      context.fill();
    } else {
      context.rotate(-object.rotation);
      context.shadowColor = 'rgba(8, 12, 24, 0.55)';
      context.shadowBlur = 16;
      context.fillStyle = '#27364b';
      context.beginPath();
      context.arc(-object.radius * 0.35, 2, object.radius * 0.58, 0, Math.PI * 2);
      context.arc(object.radius * 0.15, -object.radius * 0.18, object.radius * 0.7, 0, Math.PI * 2);
      context.arc(object.radius * 0.55, 4, object.radius * 0.48, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#96b3cc';
      context.fillRect(-object.radius * 0.52, object.radius * 0.58, 3, 9);
      context.fillRect(object.radius * 0.12, object.radius * 0.62, 3, 12);
    }
    context.restore();
  }

  private drawPlayer(context: CanvasRenderingContext2D): void {
    const { x, y } = this.player;
    context.save();
    context.translate(x, y);
    context.shadowColor = 'rgba(0, 0, 0, 0.28)';
    context.shadowBlur = 14;

    context.fillStyle = '#fff8e7';
    context.beginPath();
    context.moveTo(0, -28);
    context.lineTo(24, 18);
    context.lineTo(5, 11);
    context.lineTo(0, 24);
    context.lineTo(-5, 11);
    context.lineTo(-24, 18);
    context.closePath();
    context.fill();

    context.fillStyle = '#ff6b4a';
    context.beginPath();
    context.moveTo(0, -22);
    context.lineTo(7, 10);
    context.lineTo(0, 16);
    context.lineTo(-7, 10);
    context.closePath();
    context.fill();

    context.fillStyle = '#ffd75e';
    context.beginPath();
    context.moveTo(-5, 22);
    context.lineTo(0, 38 + Math.sin(this.elapsed * 18) * 5);
    context.lineTo(5, 22);
    context.closePath();
    context.fill();
    context.restore();
  }
}
