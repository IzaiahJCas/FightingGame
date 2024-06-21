const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.6;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: './gameAssets/Background.png',
});

const player = new Fighter({
  position: {
    x: 100,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 10,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: './gameAssets/Biker/Biker_idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 0,
    y: 10,
  },
  sprites: {
    idle: {
      imageSrc: './gameAssets/Biker/Biker_idle.png',
      framesMax: 4,
    },
    run: {
      imageSrc: './gameAssets/Biker/Biker_run.png',
      framesMax: 6,
    },
    jump: {
      imageSrc: './gameAssets/Biker/Biker_jump.png',
      framesMax: 4,
    },
    attack1: {
      imageSrc: './gameAssets/Biker/Biker_attack1.png',
      framesMax: 6,
    },
    hurt: {
      imageSrc: './gameAssets/Biker/Biker_hurt.png',
      framesMax: 4,
    },
    death: {
      imageSrc: './gameAssets/Biker/Biker_death.png',
      framesMax: 6,
    },
  },
  hitBox: {
    offset: {
      x: 0,
      y: 50,
    },
    width: 20,
    height: 20,
  },
});

player.draw();

const enemy = new Fighter({
  position: {
    x: 800,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: './gameAssets/Cyborg/Cyborg_idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 0,
    y: 10,
  },
  sprites: {
    idle: {
      imageSrc: './gameAssets/Cyborg/Cyborg_idle.png',
      framesMax: 4,
    },
    run: {
      imageSrc: './gameAssets/Cyborg/Cyborg_run.png',
      framesMax: 6,
    },
    jump: {
      imageSrc: './gameAssets/Cyborg/Cyborg_jump.png',
      framesMax: 4,
    },
    attack1: {
      imageSrc: './gameAssets/Cyborg/Cyborg_attack1.png',
      framesMax: 6,
    },
    hurt: {
      imageSrc: './gameAssets/Cyborg/Cyborg_hurt.png',
      framesMax: 2,
    },
    death: {
      imageSrc: './gameAssets/Cyborg/Cyborg_death.png',
      framesMax: 6,
    },
  },
  hitBox: {
    offset: {
      x: 50,
      y: 50,
    },
    width: 40,
    height: 20,
  },
});

enemy.draw();

console.log(player);

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  l: {
    pressed: false,
  },
  j: {
    pressed: false,
  },
  i: {
    pressed: false,
  },
};

let lastKey;

//Colision helper
function collision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.hitBox.position.x + rectangle1.hitBox.width >=
      rectangle2.position.x &&
    rectangle1.hitBox.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.hitBox.position.y + rectangle1.hitBox.height >=
      rectangle2.position.y &&
    rectangle1.hitBox.position.y <= rectangle2.position.y + rectangle2.height
  );
}

//Determines winner helper
function determineWinner({ player, enemy }) {
  clearTimeout(timerId);
  document.querySelector('#winScreen').style.display = 'flex';
  if (player.health === enemy.health) {
    document.querySelector('#winScreen').innerHTML = 'Tie';
  } else if (player.health > enemy.health) {
    document.querySelector('#winScreen').innerHTML = 'Player 1 wins';
  } else if (enemy.health > player.health) {
    document.querySelector('#winScreen').innerHTML = 'Player 2 wins';
  }
}

let timer = 60;
let timerId;
//Decrease timer
function decreaseTimer() {
  if (timer > 0) {
    timerId = setTimeout(decreaseTimer, 1000);
    timer--;
    document.querySelector('#timer').innerHTML = timer;
  }

  if (timer === 0) {
    determineWinner({ player, enemy });
  }
}

decreaseTimer();

//Animation loop
function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  c.fillStyle = 'rgba(255, 255, 255, 0.1)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  //Player movement
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5;
    player.switchSprite('run');
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5;
    player.switchSprite('run');
  } else if (keys.w.pressed && player.lastKey === 'w') {
    player.velocity.y = -10;
  } else {
    player.switchSprite('idle');
  }

  if (player.velocity.y < 0) {
    player.switchSprite('jump');
  }

  //Enemy Movement
  if (keys.j.pressed && enemy.lastKey === 'j') {
    enemy.velocity.x = -5;
    enemy.switchSprite('run');
  } else if (keys.l.pressed && enemy.lastKey === 'l') {
    enemy.velocity.x = 5;
    enemy.switchSprite('run');
  } else if (keys.i.pressed && enemy.lastKey === 'i') {
    enemy.velocity.y = -10;
  } else {
    enemy.switchSprite('idle');
  }
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump');
  }

  //detect for collision
  if (
    collision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    gsap.to('#enemyHealth', {
      width: enemy.health + '%',
    });
  }

  //Enemy attack
  if (
    collision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    gsap.to('#playerHealth', {
      width: player.health + '%',
    });
  }

  //end game health based
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = true;
      player.lastKey = 'd';
      break;

    case 'a':
      keys.a.pressed = true;
      player.lastKey = 'a';
      break;

    case 'w':
      keys.w.pressed = true;
      player.lastKey = 'w';
      break;

    case 'e':
      player.attack();
      break;

    case 'u':
      enemy.attack();
      break;

    //Enemy keys
    case 'l':
      keys.l.pressed = true;
      enemy.lastKey = 'l';
      break;

    case 'j':
      keys.j.pressed = true;
      enemy.lastKey = 'j';
      break;

    case 'i':
      keys.i.pressed = true;
      enemy.lastKey = 'i';
      break;
  }
  console.log(event.key);
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false;
      break;

    case 'a':
      keys.a.pressed = false;
      break;

    case 'w':
      keys.w.pressed = false;
      break;
  }

  //Enemy keys
  switch (event.key) {
    case 'l':
      keys.l.pressed = false;
      break;

    case 'j':
      keys.j.pressed = false;
      break;

    case 'i':
      keys.i.pressed = false;
      break;
  }
  console.log(event.key);
});
