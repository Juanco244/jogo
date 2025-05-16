import Enemigo from "../enemigos.js";

export default class GameScene extends Phaser.Scene {
constructor() {
super({ key: "Example" });
}

preload() {
this.load.spritesheet("player", "assets/playerspritesheet.png", {
frameWidth: 64,
frameHeight: 64,
});
this.load.spritesheet("ojo", "assets/Ojos.png", {
frameWidth: 64,
frameHeight: 64,
});
this.load.spritesheet("ten", "assets/tenta.png", {
frameWidth: 64,
frameHeight: 64,
});
this.load.spritesheet("malo", "assets/jefe.png", {
frameWidth: 64,
frameHeight: 64,
});
this.load.spritesheet("malo_atq", "assets/jefe_atq.png", {
frameWidth: 64,
frameHeight: 64,
});
this.load.spritesheet("ataque", "assets/ataque.png", {
frameWidth: 64,
frameHeight: 64,
});
this.load.image("pauseBtn", "assets/Pausa.png");
this.load.image("resumeBtn", "assets/Despausa.png");
this.load.image("vidaC", "assets/vidaC.png");
this.load.image("vida2", "assets/vida2.png");
this.load.image("vidaM", "assets/vidaM.png");
this.load.image("sinVida", "assets/sinVida.png");
this.load.image("moneda1", "assets/moneda1.png");
this.load.image("moneda2", "assets/moneda2.png");
this.load.image("map", "assets/mapa.png");
this.load.image("gameOverImg", "assets/gameover.png");

this.load.tilemapTiledJSON("mapa-json", "assets/mapa.json");
}

create() {
this.vidaJugador = 100;
this.puedeAtacar = true;
this.ultimaDireccion = "derecha";
this.isPaused = false;

this.add.image(945, 486, "map").setScale(2);
const map = this.make.tilemap({ key: "mapa-json" });
if (!map) return;
const tileset = map.addTilesetImage("Sprite", "map");
if (!tileset) return;
const colider = map.createLayer("Colisiones", tileset, -80, -25);
colider.setOrigin(0, 0).setScrollFactor(1).setCollisionFromCollisionGroup();
this.collisionLayers = [colider];
colider.setVisible(false);

this.player = this.physics.add.sprite(210, 9500, "player");
this.player.setCollideWorldBounds(true).setDepth(999);
this.player.body.setSize(40, 40).setOffset(12, 12);
this.physics.add.existing(this.player);
this.collisionLayers.forEach((layer) => {
  this.physics.add.collider(this.player, layer);
});


this.crearAnimaciones();
this.crearEntidades();
this.crearUI();
this.crearMonedas();
this.configurarControles();

this.ataqueHitbox = this.physics.add
  .sprite(this.player.x, this.player.y, null)
  .setSize(40, 40)
  .setVisible(false)
  .setActive(false);
this.ataqueHitbox.body.allowGravity = false;
this.ataqueHitboxPuedeHacerDaño = true;

this.physics.add.overlap(this.ataqueHitbox, this.enemigos, (hitbox, enemigo) => {
  if (this.ataqueHitboxPuedeHacerDaño && enemigo.recibirDaño) {
    enemigo.recibirDaño(1);
    this.ataqueHitboxPuedeHacerDaño = false;
  }
});
}

update() {
  if (this.isPaused) {
    this.detenerAnimaciones();
    return;
  }

  this.updatePlayer();

  this.enemigos.children.iterate((enemigo) => {
    if (enemigo && enemigo.update) {
      enemigo.update(this.player);
      if (this.physics.overlap(this.player, enemigo)) {
        this.reducirVidaJugador(1); // Puedes ajustar daño según tipo
      }
    }
  });
}


crearAnimaciones() {
this.anims.create({
key: "walk",
frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
frameRate: 5,
repeat: -1,
});
this.anims.create({
key: "player-ataque",
frames: this.anims.generateFrameNumbers("ataque", { start: 3, end: 5 }),
frameRate: 10,
repeat: 0,
});
this.anims.create({
key: "ojo-move",
frames: this.anims.generateFrameNumbers("ojo", { start: 0, end: 3 }),
frameRate: 5,
repeat: 0,
});
this.anims.create({
key: "ten-move",
frames: this.anims.generateFrameNumbers("ten", { start: 0, end: 3 }),
frameRate: 5,
repeat: 0,
});
this.anims.create({
  key: "malo-atq",
  frames: this.anims.generateFrameNumbers("malo_atq", { start: 0, end: 3 }),
  frameRate: 5,
  repeat: 0,
});

}

crearEntidades() {
  this.enemigos = this.physics.add.group();

  const zonasEnemigos = [
    // Zonas existentes
    [
      { x: 100, y: 150, tipo: "ojo", anim: "ojo-move", rango: 200, vida: 5 },
      { x: 210, y: 300, tipo: "ten", anim: "ten-move", rango: 150, vida: 3 },
      { x: 400, y: 150, tipo: "ojo", anim: "ojo-move", rango: 200, vida: 4 },
    ],
    [
      { x: 940, y: 130, tipo: "ojo", anim: "ojo-move", rango: 200, vida: 5 },
      { x: 880, y: 740, tipo: "ten", anim: "ten-move", rango: 150, vida: 3 },
    ],
    [
      { x: 1450, y: 870, tipo: "ten", anim: "ten-move", rango: 150, vida: 3 },
      { x: 1800, y: 740, tipo: "ojo", anim: "ojo-move", rango: 200, vida: 5 },
      { x: 1450, y: 740, tipo: "ten", anim: "ten-move", rango: 150, vida: 3 },
    ],
    [
      { x: 1800, y: 400, tipo: "ojo", anim: "ojo-move", rango: 250, vida: 6 },
      { x: 1350, y: 150, tipo: "ten", anim: "ten-move", rango: 150, vida: 3 },
      { x: 1450, y: 400, tipo: "ojo", anim: "ojo-move", rango: 250, vida: 6 },
    ],
  ];

  zonasEnemigos.forEach((zona) => {
    zona.forEach((conf) => {
      const enemigo = new Enemigo(this, conf.x, conf.y, conf.tipo, conf.anim, conf.rango, conf.vida, "normal");

      enemigo.recibirDaño = function (cantidad) {
        this.vida -= cantidad;
        if (this.vida <= 0) {
          this.setActive(false).setVisible(false);
          this.destroy();
        }
      };

      this.enemigos.add(enemigo);
    });
  });

  // Crear el jefe al final con tipo 'jefe'
  this.jefe = new Enemigo(this, 1650, 70, "malo", "malo-atq", 450, 70, "jefe");
  
  this.jefe.recibirDaño = function (cantidad) {
    this.vida -= cantidad;
    if (this.vida <= 0) {
      this.setActive(false).setVisible(false);
      this.destroy();
      // Aquí podrías agregar lógica de victoria o evento final
      this.scene.add.text(400, 300, "¡Has vencido al jefe!", { fontSize: "48px", fill: "#0f0" }).setScrollFactor(0);
      this.scene.physics.pause();
    }
  };

  this.enemigos.add(this.jefe);
}


crearUI() {
this.barraVida = this.add
.image(200, 60, "vidaC")
.setScrollFactor(0)
.setScale(6);
this.coinCount = 0;
this.coinText = this.add
.text(50, 100, "Monedas: 0", {
fontSize: "25px",
fill: "#ffff00",
fontFamily: "Arial",
})
.setScrollFactor(0)
.setDepth(100);

this.pauseButton = this.add
  .image(1830, 80, "pauseBtn")
  .setInteractive()
  .setScrollFactor(0)
  .setDepth(100)
  .setScale(4);

this.pauseButton.on("pointerover", () => this.pauseButton.setScale(2));
this.pauseButton.on("pointerout", () => this.pauseButton.setScale(4));
this.pauseButton.on("pointerdown", () => {
  this.isPaused = !this.isPaused;
  this.pauseButton.setTexture(this.isPaused ? "resumeBtn" : "pauseBtn");
});

this.cameras.main.startFollow(this.player);
this.cameras.main.setZoom(1);
}

crearMonedas() {
this.monedas = this.physics.add.group();
const posiciones = [
{ x: 210, y: 840 },
{ x: 460, y: 580 },
{ x: 205, y: 450 },
{ x: 150, y: 70 },
{ x: 530, y: 70 },
{ x: 70, y: 320 },
{ x: 590, y: 260 },
{ x: 850, y: 260 },
{ x: 910, y: 70 },
{ x: 1105, y: 140 },
{ x: 1165, y: 390 },
{ x: 910, y: 450 },
{ x: 720, y: 710 },
{ x: 720, y: 770 },
{ x: 1040, y: 900 },
{ x: 1298, y: 840 },
{ x: 1420, y: 710 },
{ x: 1880, y: 710 },
{ x: 1880, y: 900 },
{ x: 1880, y: 450 },
{ x: 1360, y: 450 },
{ x: 1298, y: 70 },
{ x: 1880, y: 70 },
{ x: 1105, y: 580 },
{ x: 1298, y: 200 },
];

posiciones.forEach((pos, i) => {
  const key = i % 2 === 0 ? "moneda1" : "moneda2";
  const moneda = this.monedas.create(pos.x, pos.y, key);
  moneda.setScale(1.2).body.setAllowGravity(false);
});

this.physics.add.overlap(
  this.player,
  this.monedas,
  this.recolectarMoneda,
  null,
  this
);
}

configurarControles() {
this.cursors = this.input.keyboard.createCursorKeys();
this.input.keyboard.on("keydown-SPACE", () => this.realizarAtaque());
}

updatePlayer() {
const vel = 200;
if (!this.player || !this.player.body) return;
this.player.body.setVelocity(0);
if (!this.puedeAtacar) return;

if (this.cursors.left.isDown) {
  this.player.setVelocityX(-vel);
  this.player.anims.play("walk", true);
  this.player.flipX = true;
  this.ultimaDireccion = "izquierda";
} else if (this.cursors.right.isDown) {
  this.player.setVelocityX(vel);
  this.player.anims.play("walk", true);
  this.player.flipX = false;
  this.ultimaDireccion = "derecha";
} else if (this.cursors.up.isDown) {
  this.player.setVelocityY(-vel);
  this.player.anims.play("walk", true);
} else if (this.cursors.down.isDown) {
  this.player.setVelocityY(vel);
  this.player.anims.play("walk", true);
} else {
  this.player.anims.stop();
}
}

realizarAtaque() {
if (!this.puedeAtacar) return;
this.puedeAtacar = false;
this.ataqueHitboxPuedeHacerDaño = true;

this.player.setTexture("ataque");
this.player.anims.play("player-ataque", true);

const offsetX = this.player.flipX ? -40 : 40;
this.ataqueHitbox.setPosition(this.player.x + offsetX, this.player.y);
this.ataqueHitbox.setActive(true).setVisible(false);

this.time.delayedCall(200, () => {
  this.ataqueHitbox.setActive(false).setVisible(false);
  this.ataqueHitboxPuedeHacerDaño = false;
});

this.time.delayedCall(300, () => this.player.setTexture("player"));
this.time.delayedCall(500, () => (this.puedeAtacar = true));
}

reducirVidaJugador(cantidad) {
this.vidaJugador -= cantidad;
if (this.vidaJugador <= 0) {
this.vidaJugador = 0;
this.barraVida.setTexture("sinVida");
this.physics.pause();
this.player.setTint(0xff0000);
this.player.anims.stop();
this.add

this.add
    .image(960, 540, "gameOverImg") // Centrado para resolución 1920x1080
    .setScrollFactor(0)
    .setDepth(1000)
    // .setScale(1); // Ajusta escala si es necesario

// Esperar tecla espacio para redirigir al HTML de inicio
    this.input.keyboard.once("keydown-SPACE", () => {
      window.location.reload();
      // window.location.href = "index.html"; // Cambia esto al nombre real de tu archivo HTML
    });

} else if (this.vidaJugador === 2) {
this.barraVida.setTexture("vida2");
} else if (this.vidaJugador === 1) {
this.barraVida.setTexture("vidaM");
} else {
this.barraVida.setTexture("vidaC");
}
}

recolectarMoneda(player, moneda) {
moneda.disableBody(true, true);
this.coinCount++;
this.coinText.setText("Monedas: " + this.coinCount);
}

detenerAnimaciones() {
this.player.anims.stop();
this.ojo.anims.stop();
this.ten.anims.stop();
this.player.body.setVelocity(0);
this.ojo.body.setVelocity(0);
this.ten.body.setVelocity(0);
}
}