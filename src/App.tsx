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
      libIndex: 3,
      symbolId: "WinEasterEgg",
      flump: this.createNewFlump(3)
    }
  }


  createNewFlump = (libIndex:number) => {
    const atlas = new Image()
    atlas.src = require(`./animation/${libIndex}/atlas0.png`)
    const json = require(`./animation/${libIndex}/library.json`)
    return new Flump(json, atlas)
  }


  selectLib = (libIndex:number) => () => {
    this.setState({
      ...this.state,
      libIndex,
      flump: this.createNewFlump(libIndex)
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

    const libraryIds = [0, 1, 2, 3]
    const movies = Object.values(flump.symbols).filter(Flump.isMovie)
    const movieIds = movies.map( movie => movie.id )

    const sprites = Object.values(flump.symbols).filter(Flump.isSprite)
    const spriteIds = sprites.map( sprite => sprite.symbol )
    
    return (
      <div className="App">
        <Renderer flump={ flump } symbolId={ symbolId } />
        <div className="btn-container"><h2>Library</h2>{ libraryIds.map( this.libraryLink ) }</div>
        <div className="btn-container"><h2>Movies</h2>{ movieIds.map( this.symbolLink ) }</div>
        <div className="btn-container"><h2>Sprites</h2>{ spriteIds.map( this.symbolLink ) }</div>
      </div>
    );
  }
}

export default App;
