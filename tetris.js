/**
 * Created by anmol on 22/6/17.
 */


const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');    // getting context

context.scale(20, 20);




function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

/* Colliding function --------------------
*    two arguments arena , player --------- player is an object containing matrix and pos (x and y)
*
*    m->player.matrix
*    o->player.pos
*    m.length-> player.matrix.length -> 3
*    m[0]=m[1]=m[2] -> m[].length -> 3
 *
 *   when does tetris collide?????
 *
 *    1. m[y][x]!=0
      2. arena is a matrix created by function createMatrix......matrix of 20*12 matrix with all entries 0
 *    3. arena[y+o.y] && arena[y+o.y][x+o.x] !=0
 *    ----------all above condition with and should satisfy
 *
 *   */


function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}


/*createMatrix is a function which takes two arguments width and height
* it will return matrix with fully filled 0s
* h----> it shows the no. of rows in a matrix
* w-----> it shows the no. of coloumns in matrix
* */

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}


/* createPiece is a function which takes char as input and return corresponding matrix for
*   that char*/

function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

/*  drawMatrix is a function which is actually making a tetris
*   here we draw according to matrix*/

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                    y + offset.y,
                    1, 1);
            }
        });
    });
}

/*draw is a function which updates the canvas style
* this function will be updated according to the update function which resides below
*
*      1.give colour to the whole context
*      2.pass function to the draw matrix
* ................2 matrices will be drawn
*                  1. for arena...........
*                  2. for player...........
*  */

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}




function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}


/*Rotate of a matrix can be done by transpose and reverse operation
*
*        ROTATE = TRANSPOSE + REVERSE
 *
 *       we can interchange the values of two variables in javascript as -----[a,b]=[b,a]-----
 *
 *       in this function there are two arguments matrix and direction
 *
* */

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}


/*playerDrop() function is a function for downward key*/

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}



/*Player Move function is a function for left and right keys*/

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}


function playerRotate(dir) {    // dir is direction
    const pos = player.pos.x;           //taking player pos x
    let offset = 1;                 // offset = 1
    rotate(player.matrix, dir);      // calling rotate function
    while (collide(arena, player)) {
        player.pos.x += offset;                       //adding offset to the pos x
        offset = -(offset + (offset > 0 ? 1 : -1));    // updating offset
        if (offset > player.matrix[0].length) {         // if offset>length of matrix
            rotate(player.matrix, -dir);             // rotate in opposite direction
            player.pos.x = pos;                    // pos will be of previous
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;


/* update function with default argument time=0
 * 1. deltatime => time difference
   2. increase the dropcounter +=deltatime
   3. dropinterval=1000
   4. if dropcounter>dropinterval
          position of tetris in y direction will increase
          */


function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}


/* key event listener function (keydown represents when key is pressed)
*   key code can be found on ----------------pomle.github.io
* */

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {          // 81 keycode for q letter
        playerRotate(-1);
    } else if (event.keyCode === 87) {          //87 keycode for w letter
        playerRotate(1);
    }
});

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];


const arena = createMatrix(12, 20);

/*player is an object containing pos,matrix,score as keys*/
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

playerReset();
updateScore();
update();