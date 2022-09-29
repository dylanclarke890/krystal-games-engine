const game = new Game();
game.create();
game.start();

setTimeout(() => {
  game.stop();
}, 2000);