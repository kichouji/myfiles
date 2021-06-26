// マークの文字を返す関数を定義しておく
function getMark(mark) {
    switch(mark) {
        case 0:
            return "&spades;";
            break;
        case 1:
            return "&hearts;";
            break;
        case 2:
            return "&clubs;";
            break;
        case 3:
            return "&diams;";
            break;
    }
};

// HTMLを表示
document.writeln("<table>");
for (let i=0; i<4; i++) {
    document.write("<tr>");
    for (let j=0; j<13; j++) {
        document.write('<td id="' + (i*13+j) + '">');
        document.write(getMark(i) + (j+1));
        document.write("</td>");
    }
    document.write("</tr>");
}
document.writeln("</table><br>");

// 残り枚数を表示するところ
for (let i=0; i<4; i++) {
    document.writeln('<div id="p' + i + '">　</div>');
}
document.writeln("<br>");

// 進行を表示するところ
document.writeln('<div id="history"></div><br>');

document.writeln('<div onmousedown="continueGame();">ここをクリックするとゲームが進む</div>');

// カードを定義
function Card(mark, num) {
    this.mark = mark;
    this.num = num;

    // フィールドに出されたか
    this.onField = false;

    // フィールドに出したフラグを立てる
    this.erase = function(){
        this.onField = true;
    }

    this.show = function(){
        // 数字は分かりやすく１から始める。
        console.log("マーク：" + this.mark + "、数字：" + (this.num+1))
    }
}

// プレイヤーを定義
function Player(name) {

    // プレイヤーの名前
    this.name = name;
    this.cards = new Array();

    // 手札を加える
    this.add_cards = function(card) {
        this.cards.push(card)
    };

    // 残りの手札枚数を取得する
    this.rest = function(){
        let sum = 0;
        this.cards.forEach(card => {
            if (card.onField === false) {
                sum++;
            }
        })
        return sum;
    }

    this.show = function() {
        console.log('\nプレイヤー名：' + this.name);
        this.cards.forEach(card => {
            if (card.onField === false) {
               card.show();
            }
        });
    };

}

// 手札を出す場を定義
function Field() {

    // 二次元配列を初期化
    this.field = new Array(4);
    for (let i=0; i<4; i++) {
        this.field[i] = new Array(13).fill(0);
    };

    // 場にカードを置く
    this.put = function(card) {
        this.field[card.mark][card.num] = 1;
        let element = document.getElementById('history');
        element.innerHTML += `${getMark(card.mark)}${card.num+1}を置きました<br>`;
    };

    // 場の状態を取得する
    this.status = function(i, j) {
        return this.field[i][j];
    };

    // フィールドの状況を表示
    this.show = function() {
        this.field.forEach((a, i) => {
            let output = "";
            a.forEach( (e, j) => {
                let element = document.getElementById(i*13+j);
                element.style.color = e === 0 ? 'silver': 'black';
            });
        });
    }
}

// 52枚のカードの配列
let all_card = new Array();

// カードの生成を52回行う
for (let i=0; i<4; i++) {
    for (let j = 0; j < 13; j++) {
        all_card.push(new Card(i,j));
        }
}

// console.log("\nここでシャッフルする。")
all_card.sort(() => Math.random() - 0.5)

// プレイヤーの配列
let players = new Array();

// プレイヤーを4人作成する
for (let i = 0; i < 4; i++) {
    players.push(new Player('Player' + i));    
}

// 13枚ずつ配る
for (let i = 0; i < 13; i++) {
    players.forEach(p => {
        p.add_cards(all_card.pop());
    })
}

// フィールドを作る
let field = new Field();

// 表示してみる
field.show();

// 7を出す
players.forEach(p => {
    p.cards.forEach(c =>{
        if (c.num + 1 === 7) {
            field.put(c);
            c.erase();
        }
    });
});

// 表示してみる
field.show();

function continueGame() {
    // console.log('\n ■ ' + (i+1) + 'ターン目■');

    // ゲームが終わりかどうか
    let gameset = false;
    
    let hist = document.getElementById('history');
    hist.innerHTML = '';

    players.some((p, pid) =>{
    
        hist.innerHTML += `${p.name}のターン：`

        let pass = true;
    
        p.cards.some(c =>{
            // まだ出してないカードのとき
            if (c.onField === false){
                // 左右にカードがあるか確認する。
                if ((c.num > 0 && field.status(c.mark, c.num-1) === 1) || (c.num < 12 && field.status(c.mark, c.num+1) === 1)) {
                    // 置けたら置く
                    field.put(c);
                    c.erase();
                    // 置いたらパスではない
                    pass = false;
                    return true;
                }
            }
        });
        
        let element = document.getElementById('p' + pid);
        element.innerHTML = `${p.name}の残り枚数：${p.rest()}`;

        // 残りが０枚だと、ゲーム終了
        // 一人上がったら終わりと単純化してみた
        if (p.rest() === 0) {
            alert(p.name + 'が和了り！');
            gameset = true;
            return true;
        }
    
        if (pass) {
            hist.innerHTML += 'パス<br>';
        } else {
            allpass = false;
        }

    })

    if (gameset) {
        alert("終わります");
    }

    // 途中経過を表示してみる
    field.show();

}