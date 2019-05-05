import Chance from "chance";
import React, { Component } from "react";
import "../sass/styles.scss";

interface IProps {}

export default class Index extends Component<IProps> {
  public chance = new Chance();
  public canvasRef = React.createRef<HTMLCanvasElement>();
  public canvasCount = 20;
  public imageDataArray: any[] = [];
  public clicked = false;

  public createCanvas(elm: any) {
    this.imageDataArray = [];
    if (this.canvasRef.current) {
      const ctx = this.canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(
          0,
          0,
          this.canvasRef.current.width,
          this.canvasRef.current.height
        );
        ctx.drawImage(elm, 0, 0);
        const imageData = ctx.getImageData(
          0,
          0,
          this.canvasRef.current.width,
          this.canvasRef.current.height
        );

        const pixelArr = imageData.data;
        this.createBlankImageData(imageData);
        // put pixel info to imageDataArray (Weighted Distributed)
        for (let i = 0; i < pixelArr.length; i += 4) {
          // find the highest probability canvas the pixel should be in
          const p = Math.floor((i / pixelArr.length) * this.canvasCount);
          const array = this.imageDataArray[this.weightedRandomDistrib(p)];
          array[i] = pixelArr[i]; // RED
          array[i + 1] = pixelArr[i + 1]; // GREEN
          array[i + 2] = pixelArr[i + 2]; // BLUE
          array[i + 3] = pixelArr[i + 3]; // ALPHA
        }

        for (let i = 0; i < this.canvasCount; i++) {
          const c = this.newCanvasFromImageData(
            this.imageDataArray[i],
            this.canvasRef.current.width,
            this.canvasRef.current.height
          );
          c.classList.add("dust");
          document.body.getElementsByClassName("content")[0].appendChild(c);
        }
      }
    }
  }

  public click = () => {
    if (this.clicked) {
      return;
    }
    this.clicked = true;
    this.playSnap();
    setTimeout(() => {
      this.dust(document.getElementById("img-6"));
    }, 3000);
    setTimeout(() => {
      this.dust(document.getElementById("img-3"));
    }, 8000);
    setTimeout(() => {
      this.dust(document.getElementById("img-5"));
    }, 13000);
    setTimeout(() => {
      this.dust(document.getElementById("img-4"));
    }, 18000);
    setTimeout(() => {
      this.dust(document.getElementById("img-2"));
    }, 23000);
  };

  public dust(elm: any) {
    this.createCanvas(elm);
    this.playDust();
    elm.classList.add("fade");
    const dusts = document.getElementsByClassName("dust") as HTMLCollectionOf<
      HTMLCanvasElement
    >;
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < dusts.length; index++) {
      const value = dusts[index];
      setTimeout(() => {
        this.animateTransform(
          value,
          100,
          -100,
          this.chance.integer({
            min: -15,
            max: 15
          }),
          800 + 110 * index
        );
      }, 70 * index);
    }
  }

  public weightedRandomDistrib(peak: number): number {
    const prob = [];
    const seq = [];
    for (let i = 0; i < this.canvasCount; i++) {
      prob.push(Math.pow(this.canvasCount - Math.abs(peak - i), 3));
      seq.push(i);
    }
    return this.chance.weighted(seq, prob);
  }

  public animateTransform(
    elem: HTMLCanvasElement,
    sx: number,
    sy: number,
    angle: number,
    duration: number
  ) {
    let td = 0;
    let tx = 0;
    let ty = 0;
    let opacity = 1;
    let blur = 0;
    const f = 100;

    const start = Date.now();
    const interval = setInterval(() => {
      elem.style.opacity = opacity.toString();
      elem.style.filter = `blur(${blur}px)`;
      elem.style.transform = `rotate(${td}deg) translate(${tx}px,${ty}px)`;
      if (start + duration < Date.now()) {
        clearInterval(interval);
        if (elem.parentNode) {
          elem.parentNode.removeChild(elem);
        }
      }
      opacity -= 1 / (duration / f);
      blur += 1 / (duration / f);
      td += angle / (duration / f);
      tx += sx / (duration / f);
      ty += sy / (duration / f);
    }, f);
  }

  public playSnap() {
    const audio = new Audio("/static/sounds/thanos_snap_sound.mp3");
    audio.play();
    return audio;
  }

  public playDust() {
    const num = Math.floor(Math.random() * 6) + 1;
    const audio = new Audio(`/static/sounds/thanos_dust_${num}.mp3`);
    audio.play();
    return audio;
  }

  public createBlankImageData(imageData: ImageData) {
    for (let i = 0; i < this.canvasCount; i++) {
      const arr = new Uint8ClampedArray(imageData.data);
      for (let j = 0; j < arr.length; j++) {
        arr[j] = 0;
      }
      this.imageDataArray.push(arr);
    }
  }

  public newCanvasFromImageData(
    imageDataArray: Uint8ClampedArray,
    w: number,
    h: number
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const tempCtx = canvas.getContext("2d");
    if (tempCtx) {
      tempCtx.putImageData(new ImageData(imageDataArray, w, h), 0, 0);
    }
    return canvas;
  }

  public render() {
    return (
      <>
        <div className="content">
          <img id="img-1" src="static/images/1.png" height="429" />
          <img id="img-2" src="static/images/2.png" height="429" />
          <img id="img-3" src="static/images/3.png" height="429" />
          <img id="img-4" src="static/images/4.png" height="429" />
          <img id="img-5" src="static/images/5.png" height="429" />
          <img id="img-6" src="static/images/6.png" height="429" />
          <canvas
            ref={this.canvasRef}
            height="429"
            width="900"
            id="canvas-helper"
          >
            Prohlizec nepodporuje canvas
          </canvas>
        </div>
        <img onClick={this.click} id="glove" src="/static/images/glove.png" />
      </>
    );
  }
}
