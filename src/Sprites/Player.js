class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture, frame, leftKey, rightKey, jumpKey, stompKey, vfx){
        super(scene, x, y, texture, frame);
        
        this.rightKey = rightKey; 
        this.leftKey = leftKey; 
        this.jumpKey = jumpKey; 
        this.stompKey = stompKey;

        this.respawnX = x; 
        this.respawnY = y; 
        this.checkPoint = false; 
        this.wallSlide = false; 
        this.landCoolDown = false; 
        this.airborne = false; 
        this.stomp = false; 

        this.ACCELERATION = 700;
        this.DRAG = 1500;  
        this.JUMP_VELOCITY = -800; 
        this.GRAVITY_DOWN = 500; 
        this.MAX_FALL_SPEED = 1000; 
        this.MAX_SPEED = 300; 
        this.PARTICLE_VELOCITY = 50; 

        this.vfx = vfx; 

        scene.physics.world.enable(this); 
        scene.add.existing(this);

        this.scene = scene;

        this.body.setMaxVelocity(this.MAX_SPEED, this.MAX_FALL_SPEED);
    }

    create(){
        
    }

    update(){
        let acceleration = this.ACCELERATION;
    
        if(this.leftKey.isDown){
                this.body.setAccelerationX(-acceleration); 
                this.resetFlip(); 
                this.anims.play('walk', true); 

                this.vfx.walking.startFollow(this);

                this.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
    
                if (this.body.blocked.down) {
                    this.vfx.walking.start();
                }
            }
            else if(this.rightKey.isDown){
                this.body.setAccelerationX(acceleration);
                this.setFlip(true, false); 
                this.anims.play('walk', true); 

                this.vfx.walking.startFollow(this);

                this.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
    
                if (this.body.blocked.down) {    
                    this.vfx.walking.start();
                }
            }
            else{
                this.body.setAcceleration(0); 
                this.anims.play('idle'); 
                this.vfx.walking.stop();
            }
        if(this.stompKey.isDown && !this.body.blocked.down){
            this.setVelocityY(-this.JUMP_VELOCITY * 4); 
            this.stomp = true; 
            console.log("Stomp"); 
        }

        this.body.setDragX(this.DRAG);

        if(!this.body.blocked.down){
            this.anims.play('jump'); 
        }

        if(this.body.blocked.down){
            this.body.setGravityY(this.GRAVITY_DOWN); 
            if(this.stomp){
                this.stomp = false;
                this.newVector = (0.1, 0.015); 
                this.scene.cameras.main.shake(100, this.newVector); 
            }
            
            if(this.airborne){
                this.airborne = false; 
                if(!this.landCoolDown){
                    this.setScale(2.0, 1.0); 
                    this.landCoolDown = true;
                    this.scene.time.delayedCall(100, () => {
                        this.setScale(1.5, 1.5);
                        this.landCoolDown = false;
                        
                    });
                }
            }
        }
        

        if(this.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.jumpKey)) {
            this.body.setVelocityY(this.JUMP_VELOCITY); 
            this.scene.sound.play("playerJump");
            this.setScale(1.3, 1.7);
            this.airborne = true; 
        }
        

        if(this.body.deltaYFinal() > 0 && !this.body.blocked.down){
            this.setScale(1.5, 1.5);
            if(this.body.blocked.left || this.body.blocked.right){
                this.body.setGravityY(-this.GRAVITY_DOWN* 2); 
                if (!this.wallSlide) {
                    this.scene.sound.play("wallSlide");
                    this.wallSlide = true;
                    console.log("Playing sound"); 
                } 
                if(Phaser.Input.Keyboard.JustDown(this.jumpKey)){
                    if(this.body.blocked.left){
                        this.body.setVelocityY(this.JUMP_VELOCITY/1.2); 
                        this.body.setVelocityX(200);
                    }
                    else{
                        this.body.setVelocityY(this.JUMP_VELOCITY/1.2); 
                        this.body.setVelocityX(-200);
                    }
                }
            }
            else{
                this.body.setGravityY(this.GRAVITY_DOWN); 
                this.wallSlide = false;
            }
        }

        
    }

    resetPlayer(){
        this.body.setVelocityY(0);
        this.body.setVelocityX(0); 
        this.body.setGravityY(this.GRAVITY_DOWN);
        this.scene.sound.play("die"); 
        this.x = this.respawnX; 
        this.y = this.respawnY; 
    }

    updateRespawn(x, y){
        if(this.respawnX != x && this.respawnY != y){
            this.scene.sound.play("checkpoint"); 
            this.respawnX = x; 
            this.respawnY = y; 
        }
    }

    returnStomp(){
        return this.stomp; 
    }

    
}