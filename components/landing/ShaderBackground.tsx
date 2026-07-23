'use client';

import { useEffect, useRef, useState } from 'react';

const FADE_DURATION = 1.2; // 영상 크로스페이드 길이(초)
const VIDEO_SRC = '/clouds-sunset.mp4'; // public 폴더 경로로 수정

// ---------- 불빛(streak) 셰이더 렌더러 ----------
class StreakRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private scale: number;

  private vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

  private fragSrc = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float a=rnd(i), b=rnd(i+vec2(1,0)), c=rnd(i+vec2(0,1)), d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

void main(void) {
  vec2 uv=(FC-.5*R)/MN;
  vec3 col=vec3(0);
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
    float b=noise(i+p);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
  }
  O=vec4(col,1);
}`;

  private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  constructor(canvas: HTMLCanvasElement, scale: number) {
    this.canvas = canvas;
    this.scale = scale;
    this.gl = canvas.getContext('webgl2', { alpha: true })!;
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
  }

  compile(shader: WebGLShader, source: string) {
    const gl = this.gl;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(shader));
    }
  }

  setup() {
    const gl = this.gl;
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    this.compile(vs, this.vertexSrc);
    this.compile(fs, this.fragSrc);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.program));
    }
  }

  init() {
    const gl = this.gl;
    const program = this.program!;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    (program as any).resolution = gl.getUniformLocation(program, 'resolution');
    (program as any).time = gl.getUniformLocation(program, 'time');
  }

  updateScale(scale: number) {
    this.scale = scale;
    this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
  }

  render(now: number) {
    const gl = this.gl;
    const program = this.program;
    if (!program) return;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.uniform2f((program as any).resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f((program as any).time, now * 1e-3);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

// ---------- 메인 컴포넌트 ----------
export default function CloudBackground() {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [activeIsA, setActiveIsA] = useState(true);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (!videoA || !videoB) return;

    videoA.play().catch(() => {});

    const checkAndCrossfade = (activeVideo: HTMLVideoElement, standbyVideo: HTMLVideoElement) => {
      const duration = activeVideo.duration;
      if (!duration || isNaN(duration)) return;

      const timeLeft = duration - activeVideo.currentTime;

      if (timeLeft <= FADE_DURATION && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        standbyVideo.currentTime = 0;
        standbyVideo.play().catch(() => {});
        setActiveIsA((prev) => !prev);

        setTimeout(() => {
          activeVideo.pause();
          activeVideo.currentTime = 0;
          hasTriggeredRef.current = false;
        }, FADE_DURATION * 1000);
      }
    };

    let rafId: number;
    const loop = () => {
      const active = activeIsA ? videoA : videoB;
      const standby = activeIsA ? videoB : videoA;
      checkAndCrossfade(active, standby);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [activeIsA]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<StreakRenderer | null>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      rendererRef.current?.updateScale(dpr);
    };

    const loop = (now: number) => {
      rendererRef.current?.render(now);
      frameRef.current = requestAnimationFrame(loop);
    };

    rendererRef.current = new StreakRenderer(canvas, dpr);
    rendererRef.current.setup();
    rendererRef.current.init();
    resize();
    loop(0);

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <video
        ref={videoARef}
        muted
        playsInline
        src={VIDEO_SRC}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1200 ease-in-out"
        style={{ opacity: activeIsA ? 1 : 0, transform: 'scaleX(-1)' }}
      />
      <video
        ref={videoBRef}
        muted
        playsInline
        src={VIDEO_SRC}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1200 ease-in-out"
        style={{ opacity: activeIsA ? 0 : 1, transform: 'scaleX(-1)' }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}
