import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRippleModule } from '@angular/material/core';
import Konva from 'konva';
import {
  STICKERS,
  FILTERS,
  FRAMES,
  FILTER_CONFIGS,
  FilterConfig,
} from '../../../config/image-editor.config';

export interface ImageEditorData {
  imageUrl: string;
}

interface ImageBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

@Component({
  selector: 'app-image-filter-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatGridListModule,
    MatCardModule,
    MatExpansionModule,
    MatRippleModule,
  ],
  templateUrl: './image-filter-dialog.component.html',
  styleUrls: ['./image-filter-dialog.component.css'],
  host: {
    '(window:resize)': 'onResize()',
    '(window:keydown)': 'onKeyDown($event)',
  },
})
export class ImageFilterDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer') editorContainer!: ElementRef<HTMLDivElement>;

  private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private drawingLayer!: Konva.Layer;
  private transformer!: Konva.Transformer;
  private mainImage!: Konva.Image;

  // ─── Drawing State ────────────────────────────────────────────────────────

  readonly drawMode = signal<'pen' | 'eraser' | 'off'>('off');
  readonly brushColor = signal<string>('#e53935');
  readonly brushSize = signal<number>(6);

  readonly drawColors: string[] = [
    '#e53935',
    '#e91e63',
    '#9c27b0',
    '#3f51b5',
    '#2196f3',
    '#009688',
    '#4caf50',
    '#ffeb3b',
    '#ff9800',
    '#795548',
    '#ffffff',
    '#000000',
  ];

  private _isDrawing = false;
  private _currentLine: Konva.Line | null = null;
  // Data from config
  stickers = STICKERS;
  filters = FILTERS;
  frames = FRAMES;

  selectedFilter = 'normal';
  selectedFrame = 'none';

  dialogRef = inject(MatDialogRef<ImageFilterDialogComponent>);
  data = inject<ImageEditorData>(MAT_DIALOG_DATA);

  private readonly frameBuilders: Record<string, () => void>;

  constructor() {
    this.frameBuilders = {
      polaroid: () => this.buildPolaroidFrame(),
      gold: () => this.buildGoldFrame(),
      hearts: () => this.buildHeartsFrame(),
      dashed: () => this.buildDashedFrame(),
      rainbow: () => this.buildRainbowFrame(),
      neon: () => this.buildNeonFrame(),
      vintage: () => this.buildVintageFrame(),
      film: () => this.buildFilmFrame(),
      vignette: () => this.buildVignetteFrame(),
      stars: () => this.buildStarsFrame(),
    };
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  ngAfterViewInit() {
    this.dialogRef.updateSize('90vw', '85vh');
    setTimeout(() => this.initCanvas(), 150);
  }

  ngOnDestroy() {
    this.stage?.destroy();
  }

  // ─── Canvas Init ──────────────────────────────────────────────────────────

  private initCanvas() {
    const container = this.editorContainer.nativeElement;

    this.stage = new Konva.Stage({
      container,
      width: container.offsetWidth || 800,
      height: container.offsetHeight || 600,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.drawingLayer = new Konva.Layer();
    this.stage.add(this.drawingLayer);
    this.transformer = new Konva.Transformer({
      rotateAnchorCursor: 'grab',
      borderStroke: '#3f51b5',
      anchorFill: '#3f51b5',
      anchorSize: 10,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      flipEnabled: false,
      boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width <= 0 || newBox.height <= 0) {
          return oldBox;
        }
        if (!this.mainImage) return newBox;
        const { x, y, w, h } = this.getImageBounds();
        if (
          newBox.x < x ||
          newBox.y < y ||
          newBox.x + newBox.width > x + w ||
          newBox.y + newBox.height > y + h
        ) {
          return oldBox;
        }
        return newBox;
      },
    });
    this.layer.add(this.transformer);

    const imageObj = new Image();
    imageObj.crossOrigin = 'Anonymous';
    imageObj.onload = () => {
      this.mainImage = new Konva.Image({ image: imageObj, draggable: false });
      this.refreshImageScale();
      this.layer.add(this.mainImage);
      this.mainImage.moveToBottom();
      this.layer.draw();
    };
    imageObj.src = this.data.imageUrl;

    this.stage.on('click tap', (e) => {
      if (this.drawMode() !== 'off') return;
      if (e.target === this.stage || e.target === this.mainImage) {
        this.transformer.nodes([]);
        this.layer.draw();
      }
    });

    this._setupDrawingEvents();
  }

  private _setupDrawingEvents() {
    const getPos = () => this.stage.getPointerPosition();

    const startDraw = () => {
      if (this.drawMode() === 'off') return;
      const pos = getPos();
      if (!pos) return;
      const { x, y, w, h } = this.getImageBounds();
      if (pos.x < x || pos.x > x + w || pos.y < y || pos.y > y + h) return;

      this._isDrawing = true;
      const isEraser = this.drawMode() === 'eraser';
      this._currentLine = new Konva.Line({
        stroke: isEraser ? 'white' : this.brushColor(),
        strokeWidth: isEraser ? this.brushSize() * 3 : this.brushSize(),
        globalCompositeOperation: isEraser ? 'destination-out' : 'source-over',
        lineCap: 'round',
        lineJoin: 'round',
        points: [pos.x, pos.y],
        listening: false,
      });
      this.drawingLayer.add(this._currentLine);
    };

    const moveDraw = () => {
      if (!this._isDrawing || !this._currentLine) return;
      const pos = getPos();
      if (!pos) return;
      const { x, y, w, h } = this.getImageBounds();
      const clampedX = Math.max(x, Math.min(pos.x, x + w));
      const clampedY = Math.max(y, Math.min(pos.y, y + h));
      const pts = this._currentLine.points();
      this._currentLine.points([...pts, clampedX, clampedY]);
      this.drawingLayer.batchDraw();
    };

    const endDraw = () => {
      this._isDrawing = false;
      this._currentLine = null;
    };

    this.stage.on('mousedown touchstart', startDraw);
    this.stage.on('mousemove touchmove', moveDraw);
    this.stage.on('mouseup touchend', endDraw);
  }

  private refreshImageScale() {
    if (!this.mainImage) return;

    const stageW = this.stage.width();
    const stageH = this.stage.height();
    const img = this.mainImage.image() as HTMLImageElement;
    if (!img) return;

    const margin = window.innerWidth <= 768 ? 20 : 60;
    const scale = Math.min((stageW - margin * 2) / img.width, (stageH - margin * 2) / img.height);

    this.mainImage.scale({ x: scale, y: scale });
    this.mainImage.position({
      x: (stageW - img.width * scale) / 2,
      y: (stageH - img.height * scale) / 2,
    });

    if (this.selectedFrame !== 'none') {
      this.applyFrame(this.selectedFrame);
    }

    this.layer.draw();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private getImageBounds(): ImageBounds {
    return {
      x: this.mainImage.x(),
      y: this.mainImage.y(),
      w: this.mainImage.width() * this.mainImage.scaleX(),
      h: this.mainImage.height() * this.mainImage.scaleY(),
    };
  }

  private addFrameRect(config: Konva.RectConfig) {
    this.layer.add(new Konva.Rect({ ...config, name: 'frame-element', listening: false }));
  }

  // ─── Stickers ─────────────────────────────────────────────────────────────

  addSticker(url: string) {
    const stickerObj = new Image();
    stickerObj.crossOrigin = 'Anonymous';
    stickerObj.onload = () => {
      const sticker = new Konva.Image({
        image: stickerObj,
        draggable: true,
        width: 100,
        height: 100,
        x: this.stage.width() / 2 - 50,
        y: this.stage.height() / 2 - 50,
        dragBoundFunc: (pos: { x: number; y: number }): { x: number; y: number } => {
          const { x, y, w, h } = this.getImageBounds();
          const stickerW = sticker.width() * sticker.scaleX();
          const stickerH = sticker.height() * sticker.scaleY();
          return {
            x: Math.max(x, Math.min(pos.x, x + w - stickerW)),
            y: Math.max(y, Math.min(pos.y, y + h - stickerH)),
          };
        },
      });

      sticker.on('click tap', () => {
        this.transformer.nodes([sticker]);
        this.layer.draw();
      });

      sticker.on('transform', () => {
        const { x, y, w, h } = this.getImageBounds();
        const stickerW = sticker.width() * sticker.scaleX();
        const stickerH = sticker.height() * sticker.scaleY();
        sticker.x(Math.max(x, Math.min(sticker.x(), x + w - stickerW)));
        sticker.y(Math.max(y, Math.min(sticker.y(), y + h - stickerH)));
        this.layer.draw();
      });

      this.layer.add(sticker);
      this.transformer.nodes([sticker]);
      this.layer.draw();
    };
    stickerObj.src = url;
  }

  hasSelectedSticker(): boolean {
    return this.transformer?.nodes().length > 0;
  }

  deleteSelectedSticker(): void {
    const selectedNodes = this.transformer.nodes();
    if (selectedNodes.length > 0) {
      selectedNodes.forEach((node) => node.destroy());
      this.transformer.nodes([]);
      this.layer.draw();
    }
  }

  // ─── Drawing Controls ────────────────────────────────────────────────────

  activateDrawMode(mode: 'pen' | 'eraser'): void {
    if (this.drawMode() === mode) {
      this.drawMode.set('off');
    } else {
      this.drawMode.set(mode);
      // Deselect stickers so they don't interfere
      this.transformer.nodes([]);
      this.layer.draw();
    }
  }

  setBrushColor(color: string): void {
    this.brushColor.set(color);
  }

  onCustomColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.brushColor.set(input.value);
  }

  onBrushSizeChange(value: number): void {
    this.brushSize.set(value);
  }

  clearDrawing(): void {
    this.drawingLayer.destroyChildren();
    this.drawingLayer.draw();
  }
  // ─── Filters ──────────────────────────────────────────────────────────────

  applyFilter(filterType: string) {
    this.selectedFilter = filterType;
    if (!this.mainImage) return;

    const config: FilterConfig | undefined = FILTER_CONFIGS[filterType];

    this.mainImage.cache();
    this.mainImage.filters(config?.filters ?? []);

    if (config?.brightness !== undefined) this.mainImage.brightness(config.brightness);
    if (config?.contrast !== undefined) this.mainImage.contrast(config.contrast);
    if (config?.saturation !== undefined) this.mainImage.saturation(config.saturation);

    this.layer.batchDraw();
  }

  // ─── Frames ───────────────────────────────────────────────────────────────

  applyFrame(frameType: string) {
    this.selectedFrame = frameType;
    this.layer.find('.frame-element').forEach((el) => el.destroy());

    if (!this.mainImage || frameType === 'none') {
      this.layer.draw();
      return;
    }

    this.frameBuilders[frameType]?.();
    this.layer.draw();
  }

  private buildPolaroidFrame() {
    const { x, y, w, h } = this.getImageBounds();
    const bSize = Math.min(w, h) * 0.1;
    this.addFrameRect({
      x: x - bSize,
      y: y - bSize,
      width: w + bSize * 2,
      height: h + bSize * 3,
      stroke: 'white',
      strokeWidth: bSize,
    });
    this.addFrameRect({
      x: x - bSize,
      y: y + h,
      width: w + bSize * 2,
      height: bSize * 2,
      fill: 'white',
    });
  }

  private buildGoldFrame() {
    const { x, y, w, h } = this.getImageBounds();
    this.addFrameRect({
      x: x + 5,
      y: y + 5,
      width: w - 10,
      height: h - 10,
      stroke: '#D4AF37',
      strokeWidth: 10,
    });
    this.addFrameRect({
      x: x + 15,
      y: y + 15,
      width: w - 30,
      height: h - 30,
      stroke: '#D4AF37',
      strokeWidth: 2,
    });
  }

  private buildHeartsFrame() {
    const { x, y, w, h } = this.getImageBounds();
    const heartObj = new Image();
    heartObj.onload = () => {
      const step = 50,
        size = 30;
      for (let i = 0; i <= w; i += step) {
        [0, h].forEach((oy) =>
          this.layer.add(
            new Konva.Image({
              image: heartObj,
              x: x + i,
              y: y + oy,
              width: size,
              height: size,
              offset: { x: size / 2, y: size / 2 },
              name: 'frame-element',
              listening: false,
            }),
          ),
        );
      }
      for (let j = 0; j <= h; j += step) {
        [0, w].forEach((ox) =>
          this.layer.add(
            new Konva.Image({
              image: heartObj,
              x: x + ox,
              y: y + j,
              width: size,
              height: size,
              offset: { x: size / 2, y: size / 2 },
              name: 'frame-element',
              listening: false,
            }),
          ),
        );
      }
      this.layer.draw();
    };
    heartObj.src = '/assets/stickers/heart.svg';
  }

  private buildDashedFrame() {
    const { x, y, w, h } = this.getImageBounds();
    this.addFrameRect({
      x: x + 5,
      y: y + 5,
      width: w - 10,
      height: h - 10,
      stroke: '#3f51b5',
      strokeWidth: 4,
      dash: [20, 10],
    });
  }

  private buildRainbowFrame() {
    const { x, y, w, h } = this.getImageBounds();
    ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'].forEach((color, i) => {
      this.addFrameRect({
        x: x - 5 + i * 3,
        y: y - 5 + i * 3,
        width: w + 10 - i * 6,
        height: h + 10 - i * 6,
        stroke: color,
        strokeWidth: 3,
      });
    });
  }

  private buildNeonFrame() {
    const { x, y, w, h } = this.getImageBounds();
    this.addFrameRect({
      x: x - 8,
      y: y - 8,
      width: w + 16,
      height: h + 16,
      stroke: 'cyan',
      strokeWidth: 6,
      shadowColor: 'cyan',
      shadowBlur: 20,
      shadowOpacity: 0.9,
    });
    this.addFrameRect({
      x: x - 3,
      y: y - 3,
      width: w + 6,
      height: h + 6,
      stroke: '#ff00ff',
      strokeWidth: 2,
      shadowColor: '#ff00ff',
      shadowBlur: 15,
      shadowOpacity: 0.8,
    });
  }

  private buildVintageFrame() {
    const { x, y, w, h } = this.getImageBounds();
    this.addFrameRect({
      x: x - 20,
      y: y - 20,
      width: w + 40,
      height: h + 40,
      stroke: '#8B6914',
      strokeWidth: 20,
    });
    this.addFrameRect({
      x: x - 5,
      y: y - 5,
      width: w + 10,
      height: h + 10,
      stroke: '#C8A95B',
      strokeWidth: 3,
    });

    [
      { cx: x, cy: y },
      { cx: x + w, cy: y },
      { cx: x, cy: y + h },
      { cx: x + w, cy: y + h },
    ].forEach((c) => {
      this.layer.add(
        new Konva.Circle({
          x: c.cx,
          y: c.cy,
          radius: 12,
          fill: '#8B6914',
          stroke: '#C8A95B',
          strokeWidth: 2,
          name: 'frame-element',
          listening: false,
        }),
      );
    });
  }

  private buildFilmFrame() {
    const { x, y, w, h } = this.getImageBounds();
    const filmW = 30;
    this.addFrameRect({ x: x - filmW, y, width: filmW, height: h, fill: '#111' });
    this.addFrameRect({ x: x + w, y, width: filmW, height: h, fill: '#111' });

    const holeH = 14,
      holeW = 10,
      gap = 22;
    for (let yy = y + 10; yy < y + h - 10; yy += holeH + gap) {
      [x - filmW + 10, x + w + 10].forEach((hx) => {
        this.addFrameRect({
          x: hx,
          y: yy,
          width: holeW,
          height: holeH,
          fill: '#fff',
          cornerRadius: 2,
        });
      });
    }
  }

  private buildVignetteFrame() {
    const { x, y, w, h } = this.getImageBounds();
    this.layer.add(
      new Konva.Ellipse({
        x: x + w / 2,
        y: y + h / 2,
        radiusX: w * 0.7,
        radiusY: h * 0.7,
        fillRadialGradientStartPoint: { x: 0, y: 0 },
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndPoint: { x: 0, y: 0 },
        fillRadialGradientEndRadius: Math.max(w, h) * 0.75,
        fillRadialGradientColorStops: [0, 'transparent', 1, 'rgba(0,0,0,0.65)'],
        width: w * 1.5,
        height: h * 1.5,
        name: 'frame-element',
        listening: false,
      }),
    );
  }

  private buildStarsFrame() {
    const { x, y, w, h } = this.getImageBounds();
    const starSize = 30;
    [
      { x: x + 5, y: y + 5 },
      { x: x + w - 5, y: y + 5 },
      { x: x + 5, y: y + h - 5 },
      { x: x + w - 5, y: y + h - 5 },
    ].forEach((c) => {
      this.layer.add(
        new Konva.Star({
          x: c.x,
          y: c.y,
          numPoints: 5,
          innerRadius: starSize * 0.4,
          outerRadius: starSize * 0.9,
          fill: '#FFD700',
          stroke: '#FFA500',
          strokeWidth: 1,
          name: 'frame-element',
          listening: false,
        }),
      );
    });
  }

  // ─── Save / Cancel ────────────────────────────────────────────────────────

  onSaveClick() {
    this.transformer.nodes([]);
    this.drawMode.set('off');
    this.layer.draw();
    this.drawingLayer.draw();

    const { x, y, w, h } = this.getImageBounds();
    const padding = 30;
    const stageCanvas = this.stage.toCanvas({
      pixelRatio: 2,
      x: x - padding,
      y: y - padding,
      width: w + padding * 2,
      height: h + padding * 2,
    }) as HTMLCanvasElement;

    stageCanvas.toBlob(
      (blob) => {
        if (blob) {
          this.dialogRef.close(new File([blob], 'edited_image.jpg', { type: 'image/jpeg' }));
        }
      },
      'image/jpeg',
      0.9,
    );
  }

  onCancel() {
    this.dialogRef.close();
  }

  // ─── Event Listeners ──────────────────────────────────────────────────────

  onResize() {
    if (!this.stage) return;
    const container = this.editorContainer.nativeElement;
    this.stage.width(container.offsetWidth);
    this.stage.height(container.offsetHeight);
    this.refreshImageScale();
  }

  onKeyDown(event: KeyboardEvent) {
    const selectedNodes = this.transformer.nodes();
    if (selectedNodes.length > 0 && (event.key === 'Delete' || event.key === 'Backspace')) {
      selectedNodes.forEach((node) => node.destroy());
      this.transformer.nodes([]);
      this.layer.draw();
    }
  }
}
