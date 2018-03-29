import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

export default function game_init(root, channel, username) {
  ReactDOM.render(<HangmanGame channel={channel} username={username} />, root);
}

// App state for Hangman is:
// {
//    word: String    // the word to be guessed
//    guesses: String // letters guessed so far
// }
//
// A TodoItem is:
//   { name: String, done: Bool }


class HangmanGame extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel;
    this.state = {
      board: [],
      questions: [
        "43 * 10", "61 * 10", "90 * 8", "28 * 9", "45 * 10", "51 * 7", "58 * 3",
        "4 * 9", "76 * 6", "27 * 7", "90 * 2", "8 * 6", "88 * 8", "23 * 1",
        "90 * 8", "30 * 8", "94 * 4", "67 * 4", "24 * 10", "48 * 9", "66 * 4",
        "8 * 6", "50 * 10", "32 * 2", "12 * 3", "72 * 10", "72 * 1", "41 * 10",
        "42 * 10", "42 * 4", "78 * 9", "79 * 10", "43 * 2", "18 * 5", "60 * 6",
        "6 * 3", "65 * 4", "79 * 1", "64 * 10", "60 * 3", "80 * 7", "43 * 5"],
      answers: [
        "430", "610", "720", "252", "450", "357", "174",
        "36", "456", "189", "180", "48", "704", "23",
        "720", "240", "376", "268", "240", "432", "264",
        "48", "500", "64", "36", "720", "72", "410",
        "420", "168", "702", "790", "86", "90", "360",
        "18", "260", "79", "640", "180", "560", "215"],
      p1_currentQuestion: 0,
      p2_currentQuestion: 0,
      p1_clickDisabled: true,
      p2_clickDisabled: true,
      players: []
    };
    this.username = props.username
    this.channel.join()
      .receive("ok", this.gotView.bind(this))
      .receive("error", resp => { console.log("Unable to join", resp) });
    this.channel.push("player_join", { username: this.username})
      .receive("ok", this.gotView.bind(this));
    this.channel.on("shout", this.gotView.bind(this))
  }

  gotView(view) {
    console.log("New view", view);
    this.setState(view.game);
  }

  sendGuess(ev) {
    this.channel.push("guess", { letter: ev.key })
      .receive("ok", this.gotView.bind(this));
  }

  clickCell(id) {
    console.log("User: " + this.username + " clicked: " + id)
    this.channel.push("click", { id: id, user: this.username})
      .receive("ok", this.gotView.bind(this));
  }

  p1_clickAnswer() {
    var val = document.getElementById("p1-answer-input").value
    this.channel.push("answer", {answer: val, user : this.username})
      .receive("ok", this.gotView.bind(this));
  }

  p2_clickAnswer() {
    var val = document.getElementById("p2-answer-input").value
    this.channel.push("answer", {answer: val, user : this.username})
      .receive("ok", this.gotView.bind(this));
  }

  restart(){
    this.channel.push("new", {name: this.state.gameName}).receive("ok", this.gotView.bind(this));
  }

  render() {
    return(
      <div className="container">

        <div className="board-container">

          {this.state.board.map((cell, index) => {
            if (cell=="0"){
              return <div className="grid-cell p1-cell" onClick = {() => this.clickCell(index)}>
                      </div>
            }
            else if (cell=="1"){
              return <div className="grid-cell p2-cell" onClick = {() => this.clickCell(index)}>
                      </div>
            }
            else if (cell==""){
              return <div className="grid-cell" onClick = {() => this.clickCell(index)}>
                      </div>
            }
          })}
          </div>
          <div className = "roominfo-container">
            <div className="roominfo-header">
              Players
            </div>
            {this.state.players.map((user, index) => {
              if (index=="0"){
                return <div className="roominfo-user p1-label">Player 1: {user}
                    ({this.state.p1_currentQuestion})
                </div>
              }
              else if (index=="1"){
                return <div className="roominfo-user p2-label">Player 2: {user}
                   ({this.state.p2_currentQuestion})
                </div>
              }
              else {
                return <div className="roominfo-user">Spectator: {user}</div>
              }})}
          </div>
          <div className="stop-go-container">
            {this.state.players.length < 2 &&
                  <div className="stop-text">Waiting for more players</div>
            }
            {this.state.players.length >= 2 && this.username == this.state.players[0] && !this.state.p1_clickDisabled &&
                  <div className="go-text">CORRECT! Place a tile</div>}
            {this.state.players.length >= 2 && this.username == this.state.players[0] && this.state.p1_clickDisabled &&
                  <div className="stop-text">Answer the question</div>}
            {this.state.players.length >= 2 && this.username == this.state.players[1] && !this.state.p2_clickDisabled &&
                  <div className="go-text">CORRECT! Place a tile</div>}
            {this.state.players.length >= 2 && this.username == this.state.players[1] && this.state.p2_clickDisabled &&
                  <div className="stop-text">Answer the question</div>}
          </div>

          <div className="qa-container">
            {this.state.players.map((user, index) => {
              if (this.state.players.length >= 2 && index=="0" && user == this.username){
                return <div className="question-container">
                  <div className="question-header">
                    Question {this.state.p1_currentQuestion+1}
                  </div>
                  <div className="question-body">
                    {this.state.questions[this.state.p1_currentQuestion]}
                  </div>
                  <div className="answer-container">
                    <input id="p1-answer-input" className="form-control" type="text" />
                    <button type="button" className="btn btn-danger" onClick = {() => this.p1_clickAnswer()}>Submit</button>
                  </div>
                </div>
              }
              else if (this.state.players.length >= 2 && index=="1" && user == this.username){
                return <div className="question-container">
                  <div className="question-header">
                    Question {this.state.p2_currentQuestion+1}
                  </div>
                  <div className="question-body">
                    {this.state.questions[this.state.p2_currentQuestion]}
                  </div>
                  <div className="answer-container">
                    <input id="p2-answer-input" className="form-control" type="text" />
                    <button type="button" className="btn btn-danger" onClick = {() => this.p2_clickAnswer()}>Submit</button>
                  </div>
                </div>
              }
            })}
          </div>
      </div>
    )

  /*
    const cells = [];
    for (let y = 0; y < 15; y++) {
      const row = [];
      for (let x = 0; x < 15; x++) {
        row.push(<div className="grid-cell"><Cell id={x+","+y} onclick={this.clickEvent.bind(this)}/></div>);
      }
      cells.push(<div className="grid-row">{row}</div>)
    }
    return (

      <div id="main-grid" className="col-12">
        {cells}
      </div>
    );*/
  }
}

/* HANGMAN OLD
function Word(params) {
  let state = params.state;

  let letters = _.map(state.skel, (xx, ii) => {
    return <span style={{ padding: "1ex" }} key={ii}>{xx}</span>;
  });

  return (
    <div>
      <p><b>The Word</b></p>
      <p>{letters}</p>
    </div>
  );
}

function Lives(params) {
  let state = params.state;

  return <div>
    <p><b>Guesses Left:</b></p>
    <p>{state.max - state.bads.length}</p>
  </div>;
}

function Guesses(params) {
  let state = params.state;

  return <div>
    <p><b>Bad Guesses</b></p>
    <p>{state.bads.join(" ")}</p>
  </div>;
}

function GuessInput(params) {
  return <div>
    <p><b>Type Your Guesses</b></p>
    <p><input type="text" onKeyPress={params.guess} /></p>
  </div>;
  HANGMAN OLD

}
 */
