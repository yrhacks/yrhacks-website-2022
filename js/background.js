"use strict";

var canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];

class Particle {
    constructor(x, y, directionX, directionY, size) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI* 2, false);
        ctx.fillStyle = "#5490EB";
        ctx.fill();
    }

    update() {
        if (this.x > canvas.width || this.x < 0) {
            this.directionX*= -1;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY*= -1;
        }
        if(this.directionX > 2.5) {
            this.directionX = 2.5;
        } else if(this.directionX < -2.5) {
            this.directionX = -2.5;
        }
        if(this.directionY > 2.5) {
            this.directionY = 2.5;
        } else if(this.directionY < -2.5) {
            this.directionY = -2.5;
        }
        this.x += (this.directionX/5);
        this.y += (this.directionY/5);
        this.draw();
    }
}

function init() {
    particlesArray = [];
    for (let i = 0;i < (canvas.height * canvas.width)/9000; i++) {
        let size = (Math.random() * 5) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random()*5) - 2.5;
        let directionY = (Math.random()*5) - 2.5;

        particlesArray.push(new Particle(x, y,directionX, directionY, size));
    }
}

function animate() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0;i < particlesArray.length;i++) {
        particlesArray[i].update();
    }
    connect();
}

function connect() {
    for (let i = 0;i < particlesArray.length;i++) {
        for (let j = i + 1; j < particlesArray.length;j++) {
            let dist = Math.sqrt((particlesArray[i].x - particlesArray[j].x) * (particlesArray[i].x - particlesArray[j].x) + (particlesArray[i].y - particlesArray[j].y) * (particlesArray[i].y - particlesArray[j].y));
            if (dist < (canvas.width/150) * (canvas.height/150)) {
                ctx.strokeStyle = `rgba(147, 145, 225, ${1 - (dist/((canvas.width/120) * (canvas.height/120)))})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                ctx.stroke();
            }
        }
    }
}

init();
animate();