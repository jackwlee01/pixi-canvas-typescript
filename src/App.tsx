import * as React from 'react'
import { Flump } from './flump'
import { Renderer } from './Renderer'


interface Props{}

interface State {
  libIndex:number,
  symbolId:string,
  flump:Flump
}


class App extends React.Component<Props, State> {


  constructor(props:{}){
    super(props)
    this.state = {
      libIndex: 0,
      symbolId: "",
      flump: this.createNewFlump(0)
    }
  }

  componentWillMount(){
    this.selectLib(0)();
  }


  createNewFlump = (libIndex:number) => {
    const atlas = new Image()
    atlas.src = require(`./animation/scale_1/${libIndex}/atlas0.png`)
    const json = require(`./animation/scale_1/${libIndex}/library.json`)
    return new Flump(json, atlas)
  }



  selectLib = (libIndex:number) => () => {
    var flump = this.createNewFlump(libIndex);
    var symbolId = Flump.movies(flump)[0].id;
    console.log("New lib :" + symbolId)

    this.setState({
      ...this.state,
      libIndex,
      flump,
      symbolId
    })
  }


  selectSymbol = (symbolId:string) => () => {
    this.setState({
      ...this.state,
      symbolId
    })
  }
  


  libraryLink = (libId:number) => {
    var isSelected = libId === this.state.libIndex;
    return <div key={libId} className={`btn ${isSelected && 'btn-selected'}`} onClick={ this.selectLib(libId) }>{libId}</div>
  }


  symbolLink = (symbolId:string) => {
    var isSelected = symbolId === this.state.symbolId;
    return <div key={symbolId} className={`btn ${isSelected && 'btn-selected'}`} onClick={ this.selectSymbol(symbolId) }>{symbolId}</div>
  }


  render() {
    var { libIndex, symbolId, flump } = this.state;

    const libraryIds = [0, 1]
    const movies = Flump.movies(flump)
    const movieIds = movies.map( movie => movie.id )

    const sprites = Flump.sprites(flump)
    const spriteIds = sprites.map( sprite => sprite.symbol )
    
    return (
      <div className="App">
        <Renderer flump={ flump } symbolId={ symbolId } />
        <div className="btn-container"><h2>Library</h2>{ libraryIds.map( this.libraryLink ) }</div>
        <div className="btn-container"><h2>Movies</h2>{ movieIds.map( this.symbolLink ) }</div>
        <div className="btn-container"><h2>Sprites</h2>{ spriteIds.map( this.symbolLink ) }</div>
        <div>
          <h2>Texture Atlas</h2>
          <img src={require(`./animation/scale_1/${libIndex}/atlas0.png`)} />
        </div>
      </div>
    );
  }
}

export default App;
