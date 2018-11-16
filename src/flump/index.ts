import { Renderer, Display, Symbol, SymbolMap, Library, Movie, Keyframe, Layer, Texture, TextureGroup, Atlas }  from './types'


export class Flump {

    public textures:HTMLImageElement;
    public symbols:SymbolMap;
    public library:Library;
    

    constructor(library:Library, textures:HTMLImageElement){
        this.library = library
        this.textures = textures
        this.symbols = Flump.createSymbolsLookup( library )
    }


    static createSymbolsLookup(library:Library){
        var symbols:SymbolMap = {}

        for(const movie of library.movies){
            symbols[movie.id] = movie
        }

        for(const textureGroup of library.textureGroups){
            for(const atlas of textureGroup.atlases){
                for(const texture of atlas.textures){
                    symbols[texture.symbol] = texture
                }
            }
        }

        return symbols
    }


    static appendTransform(ctx:CanvasRenderingContext2D, x:number, y:number, scaleX:number, scaleY:number, skewX:number, skewY:number, regX:number, regY:number) {
		ctx.transform(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
		ctx.transform(scaleX, 0, 0, scaleY, 0, 0);
		ctx.translate(-regX, -regY)    
    };
    

    static getInterpolation(keyframe:Keyframe, time:number):number{
		if(keyframe.tweened == false) return 0.0;
		
		var interped = (time - keyframe.index) / keyframe.duration;
        var ease = keyframe.ease;
        var t:number;

        if (ease != 0 && ease != undefined) {
			// Ease in
			if (ease < 0) {
				var inv:number = 1 - interped;
				t = 1 - inv * inv;
                ease = -ease;
			// Ease out
			} else {
				t = interped * interped;
			}
			interped = ease * t + (1 - ease) * interped;
        }
		return interped;
    }
    
    
    static draw(flump:Flump, ctx:CanvasRenderingContext2D, textures:HTMLImageElement, display:Display, frame:number){
        if(display == null) return;
        
        // MOVIE
        if(Flump.isMovie(display)){
            for(var i = 0; i < display.layers.length; i++){
                const layer = display.layers[i];
                Flump.draw(flump, ctx, textures, layer, frame)
            }
            return
        }

        
        // KEYFRAME
        if(Flump.isKeyframe(display)){
            ctx.save()

            Flump.appendTransform(ctx, 
                display.loc ? display.loc[0] : 0,
                display.loc ? display.loc[1] : 0,
                display.scale ? display.scale[0] : 1,
                display.scale ? display.scale[1] : 1,
                display.skew ? display.skew[0] : 0,
                display.skew ? display.skew[1] : 0,
                display.pivot ? display.pivot[0] : 0,
                display.pivot ? display.pivot[1] : 0,
            )

            Flump.draw(flump, ctx, textures, display.ref, frame)
            ctx.restore()
            
            return
        }

        // RENDERER
        if(Flump.isRenderer(display)){
            display(ctx)
            return
        }

        // STRING  
        if(Flump.isString(display)){
            Flump.draw(flump, ctx, textures, flump.symbols[display], frame)
            return
        }

        // LAYER
        if(Flump.isLayer(display)){
            const keyframe = Flump.keyframeAt(display, frame)
            if(keyframe == null) return;

            const previousKeyframe = Flump.keyframeAt(display, keyframe.index - 0.1);
            const childFrame = previousKeyframe == null || previousKeyframe.ref !== keyframe.ref
                ? frame - keyframe.index
                : frame
            
            if(keyframe.tweened === false){
                Flump.draw(flump, ctx, textures, keyframe, childFrame)
            }else{
                const nextKeyframe = Flump.keyframeAt(display, keyframe.index + keyframe.duration)

                const locX = keyframe.loc ? keyframe.loc[0] : 0
                const locY = keyframe.loc ? keyframe.loc[1] : 0
                const scaleX = keyframe.scale ? keyframe.scale[0] : 1
                const scaleY = keyframe.scale ? keyframe.scale[1] : 1
                const skewX = keyframe.skew ? keyframe.skew[0] : 0
                const skewY = keyframe.skew ? keyframe.skew[1] : 0
                const pivotX = keyframe.pivot ? keyframe.pivot[0] : 0
                const pivotY = keyframe.pivot ? keyframe.pivot[1] : 0
                
                const nextLocX = nextKeyframe.loc ? nextKeyframe.loc[0] : 0
                const nextLocY = nextKeyframe.loc ? nextKeyframe.loc[1] : 0
                const nextScaleX = nextKeyframe.scale ? nextKeyframe.scale[0] : 1
                const nextScaleY = nextKeyframe.scale ? nextKeyframe.scale[1] : 1
                const nextSkewX = nextKeyframe.skew ? nextKeyframe.skew[0] : 0
                const nextSkewY = nextKeyframe.skew ? nextKeyframe.skew[1] : 0
                
                const interped = Flump.getInterpolation(keyframe, Flump.modWrap(frame, Flump.duration(display)))
                
                ctx.save()

                Flump.appendTransform(ctx, 
                    locX + (nextLocX - locX) * interped,
                    locY + (nextLocY - locY) * interped,
                    scaleX + (nextScaleX - scaleX) * interped,
                    scaleY + (nextScaleY - scaleY) * interped,
                    skewX + (nextSkewX - skewX) * interped,
                    skewY + (nextSkewY - skewY) * interped,
                    pivotX,
                    pivotY
                )
                 
                this.draw(flump, ctx, textures, keyframe.ref, childFrame)
               
                ctx.restore()
            }

            return
        }
    
        // TEXTURE
        if(Flump.isSprite(display)){
            ctx.drawImage(textures, display.rect[0], display.rect[1], display.rect[2], display.rect[3], 0, 0, display.rect[2], display.rect[3]);
            return
        }

    }


    static movies(flump:Flump){
        return Object.values(flump.symbols).filter(Flump.isMovie)
    }


    static sprites(flump:Flump){
        return Object.values(flump.symbols).filter(Flump.isSprite)
    }


    static isString(display:Display): display is "string"{
        return typeof display == "string"
    }

    
    static isSymbol(display:Display): display is Symbol{
        return typeof display != "string"
    }


    static isRenderer(display:Display): display is (ctx:CanvasRenderingContext2D)=>void{
        return typeof display == "function";
    }


    static isSprite(display:Display): display is Texture{
        if (typeof display == "string") return false;
        return "symbol" in display
    }


    static isKeyframe(display:Display): display is Keyframe{
        if (typeof display == "string") return false;
        return "ref" in display
    }


    static isLayer(display:Display): display is Layer{
        if (typeof display == "string") return false;
        return "keyframes" in display
    }

    
    static isMovie(display:Display): display is Movie{
        if (typeof display == "string") return false;
        return "layers" in display
    }


    static labelKeyframe(label:string, layer:Layer){
        for(const keyframe of layer.keyframes){
            if(keyframe.label == label) return keyframe
        }
        return null
    }

    static layerByName(name:string, movie:Movie){
        for(const layer of movie.layers){
            if(layer.name == name) return layer
        }
        return null
    }


    static frameInRange(frame:number, movie:Movie, from:number, to:number){
        var dur = Flump.duration(movie)
        frame = Flump.modWrap(frame, dur)
        from = Flump.modWrap(from, dur)
        to = Flump.modWrap(to, dur)
        if(from < to){
            return frame >= from && frame < to
        }else{
            return frame >= from || frame < to
        }
    }


    static duration(layerOrMovie:(Layer | Movie)):number{
        if("layers" in layerOrMovie) return Flump.duration( <any>Flump.longestLayer(layerOrMovie)  )
        if("keyframes" in layerOrMovie) return layerOrMovie.keyframes.length == 0 ? 0 : Flump.lastKeyframe(layerOrMovie).index + Flump.lastKeyframe(layerOrMovie).duration
        throw("Flump.duration must be supplied with a layer or movie")
    }


    static lastKeyframe(layer:Layer){
        return layer.keyframes[layer.keyframes.length-1]
    }


    static longestLayer(movie:Movie){
		var longest = null
		for(const layer of movie.layers){
            if(longest == null || Flump.duration(longest) < Flump.duration(layer)) longest = layer
		}
		return longest
	}


    static keyframeAt(layer:Layer, frame:number){
		frame = Flump.modWrap(frame, Flump.duration(layer))
		for(const keyframe of layer.keyframes){
            if(keyframe.index <= frame && keyframe.index + keyframe.duration > frame) return keyframe
		}
		throw("Could not find frame %(frame) for keyframe")
	}


    static modWrap(a:number, b:number){
		return a - b * Math.floor(a/b)
    }

}
