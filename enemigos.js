export default class Enemigo extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, animKey, detectionRange, vida, tipo = "embestida") {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.animKey = animKey;
        this.detectionRange = detectionRange;
        this.vida = vida;
        this.velocidad = 50;
        this.setCollideWorldBounds(true);

        this.tipo = tipo;

        this.play(animKey);
    }

    update(player, velocidad = this.velocidad) {
        if (!this.active) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distancia = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distancia < this.detectionRange) {
            const angulo = Math.atan2(dy, dx);
            this.body.setVelocity(Math.cos(angulo) * velocidad, Math.sin(angulo) * velocidad);
            this.flipX = dx > 0;

            if (!this.anims.isPlaying) {
                this.play(this.animKey, true);
            }
        } else {
            this.body.setVelocity(0);
            this.anims.stop();
        }
    }

    recibirDaño(cantidad) {
        if (!this.active) return;
        this.vida -= cantidad;
        if (this.vida <= 0) {
            this.destroy();
        }
    }
}