import GameScene from './scenes/game.js';
export default new Phaser.Game({
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [
    
    GameScene, 
   
  ],
  pixelArt: true,
  backgroundColor: 0x000000,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
});