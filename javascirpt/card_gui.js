// マークの文字を返す関数を定義しておく
function getMark(mark, forHTML = false) {
    switch(mark) {
        case 0:
            return forHTML ? "&spades;" : "♠";
            break;
        case 1:
            return forHTML ? "&hearts;": "♥";
            break;
        case 2:
            return forHTML ? "&clubs;": "♣";
            break;
        case 3:
            return forHTML ? "&diams;": "♦";
            break;
    }
};

// HTMLを表示
document.writeln("<table>");
for (let i=0; i<4; i++) {
    document.write("<tr>");
    for (let j=0; j<13; j++) {
        document.write(`<td id="${i*13+j}">`);
        document.write(getMark(i) + (j+1));
        document.write("</td>");
    }
    document.write("</tr>");
}
document.writeln("</table><br/>");

// 進行を表示するところ
document.writeln('<div id="history"></div><br/>');

// プレイヤーの手札を表示するところ
document.writeln('<div id="yourhand">あなたの手札</div>');
document.writeln('<div id="hand"></div>');
document.writeln('<div id="explain" >場に出すカードを選択してください。</div>');

// カードを定義
class Card {
    constructor(mark, number) {
        this.mark = mark;
        this.number = number;
        // 手札かどうか
        this.inHand = true;
    }

    show() {
        // 数字は分かりやすく1から始める。
        console.log(this.getCardStr());
    }

    getCardStr() {
        return `${getMark(this.mark)}${this.number + 1}`;
    } 
}

// console.log('Cardの単体テスト');
// let c1 = new Card(0,0);
// let c2 = new Card(1,1);
// c1.show();

// プレイヤーを定義
class Player {
    constructor(name) {
        // プレイヤーの名前
        this.name = name;
        // 人間かCPUか
        this.isHuman = false;
        this.cards = new Array();
    }

    // 手札を加える
    addCard(card) {
        this.cards.push(card);
    }

    // 残りの手札枚数を取得する
    getRest() {
        let sum = 0;
        for (let card of this.cards) {
            card.inHand && sum++;
        }
        return sum;
    }

    show() {
        console.log(`プレイヤー名：${this.name}`);
        let output = "";
        for (let card of this.cards) {
            card.inHand && (output += `${card.getCardStr()} `);
        }
        console.log(output);
    }

    getHtml() {
        let output = "";
        this.cards.forEach( (card, i) => {
            if (card.inHand) {
                output += `<span id ="hand${i}" onmousedown="cardClicked(${i});" onmouseover="cardHighlight(${i}, 'in');" onmouseout="cardHighlight(${i}, 'out');">${card.getCardStr()}</span>　`
            }
        });
        output += `<span onmousedown="cardClicked('pass');">パス</span>`;
        return output;
    }
}

// console.log('\nPlayerの単体テスト');
// let p = new Player('Player0');
// p.addCard(c1);
// p.addCard(c2);
// console.log(`残りカード枚数：${p.getRest()}`);
// p.show();

// 手札を出す場を定義
class Field {

    constructor() {
        // 二次元配列を初期化
        this.field = new Array(4);
        for (let i=0; i<4; i++) {
            this.field[i] = new Array(13).fill(0);
        }
    }

    // 場にカードを置く
    putCard(card) {
        this.field[card.mark][card.number] = 1;
        console.log(`${card.getCardStr()}を置きました`);
        let element = document.getElementById('history');
        element.innerHTML +=`${getMark(card.mark, true)}${card.number + 1}を置きました<br>`
    }

    // カードが置けるかどうか
    isPuttable(c) {
        if ((c.number > 0  && this.field[c.mark][c.number-1] === 1) || 
            (c.number < 12 && this.field[c.mark][c.number+1] === 1)) {
                return true;
        }
        return false;
    }

    // 場の状態を取得する
    getStatus(i, j) {
        return this.field[i][j];
    }

    // 場を表示
    show() {
        console.log('');
        this.field.forEach( (a, i) => {
            let output = "";
            a.forEach( (e, j) => {
                output += `${e} `;
            });
            console.log(`${output}`);
        });
        console.log('');
    }

    showHtml() {
        this.field.forEach( (a, i) => {
            a.forEach( (e, j) => {
                let element = document.getElementById(i * 13 + j);
                element.style.color = e === 0 ? 'silver' : 'black';
            });
        });
    }

}

// console.log('\nFieldの単体テスト');
// f = new Field();
// console.log('\n初期状態');
// f.show();
// f.putCard(c1);
// console.log('\nカードを置いたあとの状態');
// f.show();
// console.log(`左上は、${f.getStatus(0,0)}`);
// console.log(`その下は、${f.getStatus(1,0)}`);

class Game {

    constructor(filed, playerNumber) {
        this.field = filed;
        this.playerNumber = playerNumber;
        this.players = null;
        this.allCard = null;
        this.history = document.getElementById('history');
        this.human = null;
    }

    // ゲームの初期状態を作る
    initGame() {
        this.allCard = new Array();
        this.makeAllCard();
        this.shuffleCard();
        this.players = new Array();
        this.makePlayers();
        this.distributeCards();
        this.putFirst(7);
    }

    // カードの生成を52回行う
    makeAllCard() {
        for (let i=0; i<4; i++) {
            for (let j = 0; j < 13; j++) {
                this.allCard.push(new Card(i, j));
            }
        }
    }

    // カードをシャッフルする
    shuffleCard() {
        this.allCard.sort(() => Math.random() - 0.5);
    }
    
    // プレイヤーを決まった数作成する
    makePlayers() {
        for (let i = 0; i < this.playerNumber; i++) {
            this.players.push(new Player(`Player${i+1}`));
        }

        // 1人は人間、残りはCPU
        this.human = this.players[0];
        this.human.name = 'あなた';
        this.human.isHuman = true;
    }

    // カードを13枚ずつ配る
    distributeCards() {
        for (let i = 0; i < 13; i++) {
            for (let p of this.players) {
                p.addCard(this.allCard.pop());
            }
        }
    }

    // プレイヤー全員が場に指定した番号のカード(7)を出す
    putFirst(num = 7) {
        for (let p of this.players) {
            for (let c of p.cards) {
                if (c.number + 1 === num) {
                    this.field.putCard(c);
                    c.inHand = false;
                }
            }
        }
    }

    playGame(cardId) {

        // パスの場合はundefinedとなるが特に問題は起きない
        let selectedCard = this.human.cards[cardId];    

        // パスの場合
        if (cardId !== 'pass') {
            // 指定したカードを置けない場合はゲームは進行しない
            if (! this.field.isPuttable(selectedCard)) {
                console.log(`${cardId}:${this.human.name}`);
                console.log(`${selectedCard.getCardStr()}は置けません`);
                return;
            }

       }   

        // 画面を初期化する
        this.history.innerHTML = "";

        for (let p of this.players) {

            if (p.isHuman) {
                this.history.innerHTML += `${p.name}のターン：残り${p.getRest()}枚：`;
                if (cardId === 'pass') {
                    this.history.innerHTML += 'パス<br/>';
                } else {
                    this.field.putCard(selectedCard);
                    selectedCard.inHand = false;
                }
            } else {
                this.playTurn(p);
            }
        
            if (p.getRest() === 0) {
                console.log(`${p.name}が和了り！`);
                this.show();
                document.getElementById('yourhand').innerHTML = "";
                document.getElementById('hand').innerHTML = `${p.name}が和了り！`;
                document.getElementById('explain').innerHTML = "";
                return;
            }
        }
        this.show();
    }

    // 1人のプレイヤーが自動で1ターンプレイする
    playTurn(player) {
        
        console.log(`${player.name}のターン：残り${player.getRest()}枚`);
        this.history.innerHTML += `${player.name}のターン：残り${player.getRest()}枚：`;

        let pass = true;
        for (let card of player.cards) {
            if (card.inHand) {
                if (this.field.isPuttable(card)) {
                    this.field.putCard(card);
                    card.inHand = false;
                    pass = false;
                    // 置いたらターン終了
                    break;
                }
            }
        }
        if (pass) {
            console.log('パス');
            this.history.innerHTML += 'パス<br/>';
        }
    }

    // 選択したカードをハイライトする
    highLightCard(cardId, motion) {
        let selectedCard = this.human.cards[cardId];
        if (this.field.isPuttable(selectedCard)) {
            let element = document.getElementById(selectedCard.mark * 13 + selectedCard.number);
            element.style.color = motion === 'in' ? 'blue' : 'silver';
        }
    }

    show() {
        // for (let p of this.players) {
        //     p.show();
        // }
        this.field.show();
        this.field.showHtml();

        // プレイヤーの手札を表示する。
        for (let player of this.players) {
            if (! player.isHuman) { continue; }
            let element = document.getElementById('hand');
            element.innerHTML = `${player.getHtml()}`
        }

        // 場に出せるカードは青色にしてみよう
        this.human.cards.forEach((c, i) => {
            let element = document.getElementById(`hand${i}`);
            if (element !== null) {
                if (this.field.isPuttable(c)) {
                    element.style.color = 'blue';
                }
            }
        });
    }

}

console.log('\nGameの単体テスト');
let g = new Game(new Field(), 4);
g.initGame();

g.show();

let cardClicked = (cardId) => {
    g.playGame(cardId);
}

let cardHighlight = (cardId, motion) => {
    g.highLightCard(cardId, motion);
}