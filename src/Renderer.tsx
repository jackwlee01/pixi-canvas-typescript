import * as React from 'react'
import { Flump } from './flump'


interface Props{
    flump:Flump,
    symbolId:string
}


export class Renderer extends React.Component<Props> {

    canvas:HTMLCanvasElement
    ctx:CanvasRenderingContext2D
    frame = 0;
    time = 0;


    setCanvas = (canvas:HTMLCanvasElement) => {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.draw();
    }

    componentWillUpdate(){
        this.frame = 0;
        this.time = 0;
    }


    draw = () => {
        var canvas = this.canvas;
        var ctx = this.ctx;

        if(this.canvas && this.context){
            var flump = this.props.flump;
            var symbolId = this.props.symbolId;
            var textures = flump.textures;

            var now = new Date().getTime();
            var dif = now - this.time;
            dif = dif / (1000/60);
            this.time = now;
            this.frame += dif;
        
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.save()
            ctx.translate(1024/2, 768/2)
            Flump.draw(flump, ctx, textures, symbolId, this.frame);
            ctx.restore()

            window.requestAnimationFrame(this.draw)
        }        
    }


    render(){
        return <canvas ref={ this.setCanvas } width="1024" height="768" background-color="009900"/>
    }


}