import {
  Component,
  Inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import Konva from 'konva';

export interface ImageEditorData {
  imageUrl: string;
}

@Component({
  selector: 'app-image-filter-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatSliderModule],
  templateUrl: './image-filter-dialog.component.html',
  styleUrls: ['./image-filter-dialog.component.css'],
})
export class ImageFilterDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer') editorContainer!: ElementRef<HTMLDivElement>;
  private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private transformer!: Konva.Transformer;
  private mainImage!: Konva.Image;

  stickers = [
    { name: 'Smiley', url: '/assets/stickers/smiley.svg' },
    { name: 'Heart', url: '/assets/stickers/heart.svg' },
    { name: 'Star', url: '/assets/stickers/star.svg' },
    { name: 'Rocket', url: '/assets/stickers/rocket.svg' },
    { name: 'Fire', url: '/assets/stickers/fire.svg' },
    { name: 'Pizza', url: '/assets/stickers/pizza.svg' },
    { name: 'Beer', url: '/assets/stickers/beer.svg' },
    { name: 'Cat', url: '/assets/stickers/cat.svg' },
    { name: 'Dog', url: '/assets/stickers/dog.svg' },
    { name: 'Christmas', url: '/assets/stickers/christmas.svg' },
    { name: 'Party', url: '/assets/stickers/party.svg' },
  ];

  filters = [
    { name: 'Normal', value: 'normal' },
    { name: 'Clarendon', value: 'clarendon' },
    { name: 'Moon', value: 'moon' },
    { name: 'Sepia', value: 'sepia' },
    { name: 'Invert', value: 'invert' },
    { name: 'Solarize', value: 'solarize' },
    { name: 'Reyes', value: 'reyes' },
    { name: 'Juno', value: 'juno' },
    { name: 'Lark', value: 'lark' },
  ];

  frames = [
    { name: 'None', value: 'none' },
    { name: 'Polaroid', value: 'polaroid' },
    { name: 'Gold', value: 'gold' },
    { name: 'Hearts', value: 'hearts' },
    { name: 'Dashed', value: 'dashed' },
    { name: 'Rainbow', value: 'rainbow' },
    { name: 'Neon', value: 'neon' },
    { name: 'Vintage', value: 'vintage' },
    { name: 'Film Strip', value: 'film' },
    { name: 'Vignette', value: 'vignette' },
    { name: 'Stars', value: 'stars' },
  ];

  selectedFilter = 'normal';
  selectedFrame = 'none';

  constructor(
    public dialogRef: MatDialogRef<ImageFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageEditorData,
  ) {}

  ngAfterViewInit() {
    this.dialogRef.updateSize('90vw', '85vh');
    setTimeout(() => {
      this.initCanvas();
    }, 150);
  }

  @HostListener('window:resize')
  onResize() {
    if (this.stage) {
      const container = this.editorContainer.nativeElement;
      this.stage.width(container.offsetWidth);
      this.stage.height(container.offsetHeight);
      this.refreshImageScale();
    }
  }

  ngOnDestroy() {
    if (this.stage) {
      this.stage.destroy();
    }
  }

  private initCanvas() {
    const container = this.editorContainer.nativeElement;
    this.stage = new Konva.Stage({
      container: container,
      width: container.offsetWidth || 800,
      height: container.offsetHeight || 600,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.transformer = new Konva.Transformer({
      rotateAnchorCursor: 'grab',
      borderStroke: '#3f51b5',
      anchorFill: '#3f51b5',
      anchorSize: 10,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
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
      if (e.target === this.stage || e.target === this.mainImage) {
        this.transformer.nodes([]);
        this.layer.draw();
      }
    });
  }

  private refreshImageScale() {
    if (!this.mainImage) return;
    const stageW = this.stage.width();
    const stageH = this.stage.height();
    const img = this.mainImage.image() as HTMLImageElement;
    if (!img) return;

    const margin = 60;
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
      });
      sticker.on('click tap', () => {
        this.transformer.nodes([sticker]);
        this.layer.draw();
      });
      this.layer.add(sticker);
      this.transformer.nodes([sticker]);
      this.layer.draw();
    };
    stickerObj.src = url;
  }

  applyFrame(frameType: string) {
    this.selectedFrame = frameType;
    this.layer.find('.frame-element').forEach((el) => el.destroy());

    if (!this.mainImage || frameType === 'none') {
      this.layer.draw();
      return;
    }

    const x = this.mainImage.x();
    const y = this.mainImage.y();
    const w = this.mainImage.width() * this.mainImage.scaleX();
    const h = this.mainImage.height() * this.mainImage.scaleY();

    if (frameType === 'polaroid') {
      const bSize = Math.min(w, h) * 0.1;
      this.layer.add(
        new Konva.Rect({
          x: x - bSize,
          y: y - bSize,
          width: w + bSize * 2,
          height: h + bSize * 3,
          stroke: 'white',
          strokeWidth: bSize,
          name: 'frame-element',
          listening: false,
        }),
        new Konva.Rect({
          x: x - bSize,
          y: y + h,
          width: w + bSize * 2,
          height: bSize * 2,
          fill: 'white',
          name: 'frame-element',
          listening: false,
        }),
      );
    } else if (frameType === 'gold') {
      this.layer.add(
        new Konva.Rect({
          x: x + 5,
          y: y + 5,
          width: w - 10,
          height: h - 10,
          stroke: '#D4AF37',
          strokeWidth: 10,
          name: 'frame-element',
          listening: false,
        }),
        new Konva.Rect({
          x: x + 15,
          y: y + 15,
          width: w - 30,
          height: h - 30,
          stroke: '#D4AF37',
          strokeWidth: 2,
          name: 'frame-element',
          listening: false,
        }),
      );
    } else if (frameType === 'hearts') {
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
    } else if (frameType === 'dashed') {
      this.layer.add(
        new Konva.Rect({
          x: x + 5,
          y: y + 5,
          width: w - 10,
          height: h - 10,
          stroke: '#3f51b5',
          strokeWidth: 4,
          dash: [20, 10],
          name: 'frame-element',
          listening: false,
        }),
      );
    } else if (frameType === 'rainbow') {
      ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'].forEach((c, i) => {
        this.layer.add(
          new Konva.Rect({
            x: x - 5 + i * 3,
            y: y - 5 + i * 3,
            width: w + 10 - i * 6,
            height: h + 10 - i * 6,
            stroke: c,
            strokeWidth: 3,
            name: 'frame-element',
            listening: false,
          }),
        );
      });
    } else if (frameType === 'neon') {
      this.layer.add(
        new Konva.Rect({
          x: x - 8,
          y: y - 8,
          width: w + 16,
          height: h + 16,
          stroke: 'cyan',
          strokeWidth: 6,
          shadowColor: 'cyan',
          shadowBlur: 20,
          shadowOpacity: 0.9,
          name: 'frame-element',
          listening: false,
        }),
        new Konva.Rect({
          x: x - 3,
          y: y - 3,
          width: w + 6,
          height: h + 6,
          stroke: '#ff00ff',
          strokeWidth: 2,
          shadowColor: '#ff00ff',
          shadowBlur: 15,
          shadowOpacity: 0.8,
          name: 'frame-element',
          listening: false,
        }),
      );
    } else if (frameType === 'vintage') {
      // Stroke-only borders so the photo isn't hidden
      this.layer.add(
        new Konva.Rect({
          x: x - 20,
          y: y - 20,
          width: w + 40,
          height: h + 40,
          stroke: '#8B6914',
          strokeWidth: 20,
          name: 'frame-element',
          listening: false,
        }),
        new Konva.Rect({
          x: x - 5,
          y: y - 5,
          width: w + 10,
          height: h + 10,
          stroke: '#C8A95B',
          strokeWidth: 3,
          name: 'frame-element',
          listening: false,
        }),
      );
      // Corner ornaments
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
    } else if (frameType === 'film') {
      const filmW = 30;
      this.layer.add(
        new Konva.Rect({
          x: x - filmW,
          y,
          width: filmW,
          height: h,
          fill: '#111',
          name: 'frame-element',
          listening: false,
        }),
        new Konva.Rect({
          x: x + w,
          y,
          width: filmW,
          height: h,
          fill: '#111',
          name: 'frame-element',
          listening: false,
        }),
      );
      const holeH = 14,
        holeW = 10,
        gap = 22;
      for (let yy = y + 10; yy < y + h - 10; yy += holeH + gap) {
        [x - filmW + 10, x + w + 10].forEach((hx) => {
          this.layer.add(
            new Konva.Rect({
              x: hx,
              y: yy,
              width: holeW,
              height: holeH,
              fill: '#fff',
              cornerRadius: 2,
              name: 'frame-element',
              listening: false,
            }),
          );
        });
      }
    } else if (frameType === 'vignette') {
      const vignette = new Konva.Ellipse({
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
      });
      this.layer.add(vignette);
    } else if (frameType === 'stars') {
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

    this.layer.draw();
  }

  applyFilter(filterType: string) {
    this.selectedFilter = filterType;
    if (!this.mainImage) return;
    this.mainImage.cache();
    this.mainImage.filters([]);

    switch (filterType) {
      case 'clarendon':
        this.mainImage.filters([Konva.Filters.Brighten, Konva.Filters.Contrast]);
        this.mainImage.brightness(0.1);
        this.mainImage.contrast(20);
        break;
      case 'moon':
        this.mainImage.filters([Konva.Filters.Grayscale, Konva.Filters.Contrast]);
        this.mainImage.contrast(10);
        break;
      case 'sepia':
        this.mainImage.filters([Konva.Filters.Sepia]);
        break;
      case 'invert':
        this.mainImage.filters([Konva.Filters.Invert]);
        break;
      case 'solarize':
        this.mainImage.filters([Konva.Filters.Solarize]);
        break;
      case 'reyes':
        this.mainImage.filters([Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL]);
        this.mainImage.brightness(0.2);
        this.mainImage.contrast(-10);
        this.mainImage.saturation(-0.2);
        break;
      case 'juno':
        this.mainImage.filters([Konva.Filters.Brighten, Konva.Filters.HSL]);
        this.mainImage.brightness(0.1);
        this.mainImage.saturation(0.3);
        break;
      case 'lark':
        this.mainImage.filters([Konva.Filters.Brighten, Konva.Filters.Contrast]);
        this.mainImage.brightness(0.05);
        this.mainImage.contrast(10);
        break;
    }
    this.layer.batchDraw();
  }

  onSaveClick() {
    this.transformer.nodes([]);
    this.layer.draw();
    const stageCanvas = this.stage.toCanvas({ pixelRatio: 2 }) as HTMLCanvasElement;
    stageCanvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'edited_image.jpg', { type: 'image/jpeg' });
          this.dialogRef.close(file);
        }
      },
      'image/jpeg',
      0.9,
    );
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const selectedNodes = this.transformer.nodes();
    if (selectedNodes.length > 0 && (event.key === 'Delete' || event.key === 'Backspace')) {
      selectedNodes.forEach((node) => node.destroy());
      this.transformer.nodes([]);
      this.layer.draw();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
