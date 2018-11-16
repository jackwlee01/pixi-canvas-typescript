
export type Renderer = (ctx:CanvasRenderingContext2D) => void
export type Symbol = (Movie | Texture | Renderer)
export type SymbolMap = { [key:string]:Symbol }
export type Display = (Movie | Layer | Keyframe | Texture | string | Renderer)


export interface Library {
	md5:string;
	movies:Movie[];
	textureGroups:TextureGroup[];
	frameRate: number;
}


export interface Movie {
	id:string;
	layers:Layer[];
	flipbook:boolean;
}


export interface Keyframe {
	pivot:number[];
	duration:number;
	loc:number[];
	index:number;
	ref:string | Symbol;
	scale:number[];
	skew:number[];
	ease:number;
	tweened:boolean;
	label:string;
	alpha:number;
}


export interface Texture {
	symbol:string;
	rect:number[];
	origin:number[];
}


export interface TextureGroup {
	atlases:Atlas[];
	scaleFactor:number;
}


export interface Atlas {
	file:string;
	textures:Texture[];
}


export interface Layer {
	name:string;
	keyframes:Keyframe[];
}
