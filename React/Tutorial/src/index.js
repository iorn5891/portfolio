import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { brotliDecompress } from 'zlib';

function Square(props) {
  return (
    <button
      className={"square " + props.className}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const highlighted = this.props.highlightedLine.includes(i) ? "highlighted" : ""
    return (
      <Square
        key={i}
        className={highlighted}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderSquares() {
    let squares = [];
    let rows = [];
    for(let i=0;i<3;i++){
      for(let j=0;j<3;j++){
        squares.push(
          this.renderSquare(i*3+j)
        );
      }
      rows.push(<div key={i} className="board-row">{squares}</div>)
      squares = [];
    }
    return (
      <div>
        {rows}
      </div>
    );
  }
  render() {
    return (
      <div>
        {this.renderSquares()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        positions: [0,0]
      }],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true,
    };
  }
  

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const positionList = [
      [1, 1],
      [2, 1],
      [3, 1],
      [1, 2],
      [2, 2],
      [3, 2],
      [1, 3],
      [2, 3],
      [3, 3]
    ];
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    const positions = positionList[i];
    this.setState({
      history: history.concat([{
        squares: squares,
        positions: positions
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
      })
  }
  sortHistroyClick(){
    this.setState({
      isAscending: !this.state.isAscending
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move) => {
      let style = {
        fontWeight: "normal",
      };
      const desc = move ?
        'Go to move #' + move + "(" + history[move].positions + ")":
        'Go to game start';
        if(move == this.state.stepNumber){
          style = {
            fontWeight: "bold",
          };
        }
      
      return (
        <li key={move}>
          <button style={style} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner.winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            highlightedLine={winner ? winner.highlightedLine : ""}
          />
        </div>
        <div className="game-info">
          <button onClick={() => this.sortHistroyClick()}>sort</button>
          <div>{status}</div>
          <ol>{this.state.isAscending ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner : squares[a],
        highlightedLine: lines[i]
      };
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
