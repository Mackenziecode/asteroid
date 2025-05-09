
let FPS = 60;
let CADENCIA_DISPAROS = 120;
let NroESTRELLAS = 199;
let NroFRAGMENTOS = 50;

let TX = 50;
let TY = 50;

let widthCanvasAmpliado = 800;
let heightCanvasAmpliado = 600;

//---- Puntos, Nivel, Vidas -------------------------------
let enJuego = false;
let nivelSuperado = false;
let gameOver = false;
let puntos = 0;
let nivel = 1;
let vidas = 3;

let arrayVelAsteroides = [0.5, 0.8, 1.0, 1.3, 1.5, 1.8, 2.0, 2.3, 2.5, 2.8, 3.0, 4.0];

//---- Relativo a los fondo Espaciales de Estrellas -------
let arrayColoresEstrellas = ['orangered', 'lightblue', 'lightblue', 
	'lightblue', 'white', 'white', 'ghostwhite', 'yellow', '#FFCC15'];

let estrellasFijas = [];
let estrellas = [];

//---- Relativo a la Nave ---------------------------------
let nave;

//---- Relativo al Disparo Jugador ------------------------
let disparo;
let disparos = [];

//---- Relativo a los Asteroides --------------------------
let arrayAsteroidesColores = ['#BBBBBB', '#909090', '#A0A072'];
let asteroides = [];

//---- Relativo a los Fragmentos Explosiones --------------
let fragmentosExplosion = [];

//------- Eventos -----------------------------------------
document.addEventListener('click', (event) => {
	//console.log(event);
	//console.log(enJuego, event.clientY);

	if (enJuego) {
	
		let nuevoAngulo = cambiarAnguloJugador(event.clientX, event.clientY);
		nave.anguloRot = nuevoAngulo;

		if (nave.gira === 1) {nave.gira = -1;} else {nave.gira = 1;}

	} else {
		if (event.clientY > parseInt(canvas.height / 1.3)) {
			nave = new NaveJugador();
			creaAsteroides();
			enJuego = true;
			
		} else if (event.clientY < 20) {
			reescalaCanvas();
		}
	}

});

function cambiarAnguloJugador(x, y) {
	let vecX = x - nave.x;
	let vecY = y - nave.y;

	return Math.atan2(vecY, vecX);
}

//=========================================================
class NaveJugador {
	constructor() {
		this.ancho = TX;
		this.alto = TY;
		this.radio = parseInt(TY / 2);

		this.x = parseInt(canvas.width / 2);
		this.y = parseInt(canvas.height / 2);

		this.alpha = 1.0;
		this.pausaVidaMenos = false;

		this.anguloRot = convierteAradianes(1);
		this.gira = 1;
		this.velGiro = convierteAradianes(1);
	}

	dibuja() {
		this.actualiza();

		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.anguloRot);
		ctx.translate(-this.x, -this.y);
		ctx.beginPath();
		ctx.moveTo(this.x + 3, this.y);
		ctx.lineTo(this.x, this.y - parseInt(this.alto / 2));
		ctx.lineTo(this.x + this.ancho, this.y);
		ctx.lineTo(this.x, this.y + parseInt(this.alto / 2));
		ctx.lineTo(this.x + 3, this.y);
		ctx.globalAlpha = this.alpha;
		ctx.fillStyle = 'lightgreen';
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}

	actualiza() {
		this.anguloRot += this.velGiro * this.gira;
		this.anguloRot = normalizaAngulo(this.anguloRot);

		if (this.alpha < 1.0 && !this.pausaVidaMenos) this.alpha += 0.005;
	}
}

//==============================================================
class Disparo {
	constructor(angulo) {
		this.angulo = angulo;
		this.vel = 9;

		this.velX = Math.cos(this.angulo);
		this.velY = Math.sin(this.angulo);

		this.ancho = parseInt(TX / 6);
		this.alto = this.ancho;
		this.radio = parseInt(TX / 12);
		this.sizeEf = 0;
		this.color;

		this.limites = checkCanvasLimites();

		this.x = parseInt(canvas.width / 2) + this.velX * TX;
		this.y = parseInt(canvas.height / 2) + this.velY * TY;
	}

	dibuja() {
		this.actualiza();
		this.efectoColorDisparo();

		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.x, this.y, this.radio + this.sizeEf, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}

	actualiza() {
		this.x += this.velX * this.vel;
		this.y += this.velY * this.vel;

		this.borraDisparoDelArray();
	}

	borraDisparoDelArray() {
		if (this.x > this.limites || this.y > this.limites || this.x < 0 || this.y < 0) {
			disparos.shift();
		}
	}

	efectoColorDisparo() {
		let verde = Math.floor(Math.random() * 200) + 56;
		verde = verde.toString();
		this.color = 'rgb(255,' + verde + ',0)';

		this.sizeEf = Math.floor(Math.random() * 2);
		this.sizeEf = this.sizeEf * parseInt(TX / 20);
	}
}

//==============================================================
class Espacio3D {
	constructor() {
		this.x;
		this.y;

		this.velX;
		this.velY;

		this.color;
		this.ancho;
		this.alto;

		this.reciclarEstrella();
	}

	dibuja() {
		this.actualiza();

		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.ancho, this.alto);
	}

	actualiza() {
		this.x += this.velX;
		this.y += this.velY;

		this.agrandarEstrella();

		if (this.x > canvas.width || this.y > canvas.height || this.x < 0 || this.y < 0) {
			this.reciclarEstrella();
		}
	}

	agrandarEstrella() {
		let distanciaCentroX = Math.abs(canvas.width / 2 - this.x);
		let distanciaCentroY = Math.abs(canvas.height / 2 - this.y);

		if (distanciaCentroX > canvas.width / 4 || distanciaCentroY > canvas.height / 4) {
			this.ancho = 2;
			this.alto = 2;
		}
	}

	reciclarEstrella() {
		this.x = parseInt(canvas.width / 2);
		this.y = parseInt(canvas.height / 2);

		this.velX = Math.floor(Math.random() * 99) - 50;
		this.velX /= 50;
		this.velY = Math.floor(Math.random() * 99) - 50;
		this.velY /= 40;

		let num_rnd = Math.floor(Math.random() * arrayColoresEstrellas.length);
		this.color = arrayColoresEstrellas[num_rnd];

		this.ancho = 1;
		this.alto = 1;
	}
}

//==============================================================
class EspacioFijo {
	constructor() {
		this.x = Math.floor(Math.random() * canvas.width);
		this.y = Math.floor(Math.random() * canvas.height);

		let num_rnd = Math.floor(Math.random() * arrayColoresEstrellas.length);
		this.color = arrayColoresEstrellas[num_rnd];

		this.ancho = Math.floor(Math.random() * 2) + 1;
		this.alto = this.ancho;
	}

	dibuja() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.ancho, this.alto);
	}
}

//==============================================================
class Asteroide {
	constructor(x, y, radio, color) {
		this.x = x;
		this.y = y;
		this.angulo;
		this.velX;
		this.velY;
		this.vel;

		this.ancho;
		this.alto;
		this.radio = radio;
		this.color = color;

		this.generarAsteroide();
		this.replicar2Asteroides();
	}

	dibuja() {
		this.actualiza();

		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}

	actualiza() {
		this.x += this.velX * this.vel;
		this.y += this.velY * this.vel;
		//console.log(this.x, this.y);
		this.checkLimites();
	}

	checkLimites() {
		if (this.x - this.radio > canvas.width && this.velX > 0) this.x = -this.radio;
		if (this.x + this.radio < 0 && this.velX < 0) this.x = canvas.width + this.radio;
		if (this.y - this.radio > canvas.height && this.velY > 0) this.y = -this.radio;
		if (this.y + this.radio < 0 && this.velY < 0) this.y = canvas.height + this.radio;
	}

	generarAsteroide() {
		if (this.radio < TX) return;

		let desdeDonde = Math.floor(Math.random() * 10);
		let rndX;
		let rndY;
		let rndAnguloGrados;

		if (desdeDonde < 5) {
			rndX = Math.floor(Math.random() * parseInt(canvas.width / 1.5));
			let upDown = Math.floor(Math.random() * 2);

			if (upDown === 0) {
				rndY = -(canvas.height / 9);
				rndAnguloGrados = Math.floor(Math.random() * 90) + 45;
			} else {
				rndY = canvas.height + canvas.height / 9;
				rndAnguloGrados = Math.floor(Math.random() * 90) + 225;
			}

		} else {
			rndY = Math.floor(Math.random() * parseInt(canvas.height / 1.5));
			let leftRight = Math.floor(Math.random() * 2);

			if (leftRight === 0) {
				rndX = -(canvas.width / 9);
				rndAnguloGrados = Math.floor(Math.random() * 90) + 315;

				if (rndAnguloGrados > 360) rndAnguloGrados -= 360; 
			} else {
				rndX = canvas.width + canvas.width / 9;
				rndAnguloGrados = Math.floor(Math.random() * 90) + 135;
			}
		}
		
		this.x = rndX;
		this.y = rndY;
		//console.log(this.x, this.y);

		this.angulo = convierteAradianes(rndAnguloGrados);
		this.velX = Math.cos(this.angulo);
		this.velY = Math.sin(this.angulo);

		if (nivel > 12) {
			this.vel = 4.0;
		} else {
			this.vel = arrayVelAsteroides[nivel - 1];
		}

		this.ancho = TX * 2;
		this.alto = TY * 2;
		this.radio = TX;
		let num_rnd = Math.floor(Math.random() * arrayAsteroidesColores.length);
		this.color = arrayAsteroidesColores[num_rnd];
	}

	replicar2Asteroides() {
		if (this.radio === TX) return;

		let rndAnguloGrados = Math.floor(Math.random() * 360);
		this.angulo = convierteAradianes(rndAnguloGrados);
		this.velX = Math.cos(this.angulo);
		this.velY = Math.sin(this.angulo);

		if (nivel > 12) {
			this.vel = 4.0;
		} else {
			this.vel = arrayVelAsteroides[nivel - 1];
		}
	}
}

//==============================================================
class Explosion {
	constructor(x, y, color) {
		this.x = x;
		this.y = y;

		this.ancho = Math.floor(Math.random() * 4) + 1;
		this.alto = this.ancho;

		this.color = color;
		this.alpha = 1.0;

		let maxVel = TX * 5;
		this.velX = Math.floor(Math.random() * maxVel) - maxVel / 2;
		this.velX /= 12;
		this.velY = Math.floor(Math.random() * maxVel) - maxVel / 2;
		this.velY /= 10;
	}

	dibuja() {
		this.actualiza();

		ctx.save();
		ctx.globalAlpha = this.alfa;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.ancho, this.alto);
		ctx.restore();
	}

	actualiza() {
		this.x += this.velX;
		this.y += this.velY;
		if (this.alpha > 0) this.alpha -= 0.02;
	}
}

//==============================================================
function convierteAradianes(grados) {
	return grados * (Math.PI / 180);
}

function normalizaAngulo(angulo) {
	angulo = angulo % (2 * Math.PI);

	if (angulo < 0) {angulo += 2 * Math.PI;}

	return angulo;
}

function checkCanvasLimites() {
	if (canvas.width >= canvas.height) {
		return canvas.width;
	} else {
		return canvas.height;
	}
}

function crearEstrellasFijas() {
	for (let i = 0; i < NroESTRELLAS; i ++) {
		let estrellaFija = new EspacioFijo();
		estrellasFijas.push(estrellaFija);
	}
}

function crearEstrellasEspacio3D() {
	for (let i = 0; i < NroESTRELLAS; i ++) {
		let estrella = new Espacio3D();
		estrellas.push(estrella);
	}
}

function dibujaEstrellasFijas() {
	estrellasFijas.forEach(cadaFija => {
		cadaFija.dibuja();
	});
}

function dibujaEspacio3D() {
	estrellas.forEach(cadaEstrella => {
		cadaEstrella.dibuja();
	});
}

function creaDisparo() {
	if (!enJuego || nave.pausaVidaMenos) return;

	disparo = new Disparo(nave.anguloRot);
	disparos.push(disparo);
	//console.log(disparos);
}

function dibujaDisparos() {
	disparos.forEach(disp => {
		disp.dibuja();
	});
}

function creaAsteroides() {
	for (let i = 0; i < nivel * 3; i ++) {
		let aste = new Asteroide(0, 0, TX,'red');
		asteroides.push(aste);

		nivelSuperado = false;
	}
}

function dibujaAsteroides() {
	asteroides.forEach(cadaAste => {
		cadaAste.dibuja();
	});
}

function generaExplosion(x, y, color) {
	for (let i = 0; i < NroFRAGMENTOS; i ++) {
		let explo = new Explosion(x, y, color);
		fragmentosExplosion.push(explo);
	}
}

function dibujaYborraFragmentos() {
	for (let i = 0; i < fragmentosExplosion.length; i ++) {
		let frag = fragmentosExplosion[i];

		frag.dibuja();

		if (frag.alpha <= 0) fragmentosExplosion.shift();
	}
}

//--------------------------------------------------------------
function checkTodasColisiones() {
	checkDisparosAsteroidesCol();
	checkAsteroidesNaveCol();
}

function checkAsteroidesNaveCol() {
	for (let i = 0; i < asteroides.length; i ++) {
		let aste = asteroides[i];
		let colision = checkColisiones(aste, nave);

		if (colision && nave.alpha >= 0.98) {
			nave.alpha = 0;
			nave.pausaVidaMenos = true;
			vidas --;

			if (vidas < 0) {
				gameOver = true;
				vidas = 0;

				setTimeout(() => {
					gameOver = false;
					enJuego = false;
					nivelSuperado = false;
					puntos = 0;
					nivel = 1;
					vidas = 3;
					asteroides.splice(0, asteroides.length);
				}, 7000);

			} else {
				setTimeout(() => {
					nave.pausaVidaMenos = false;
				}, 3500);

			}

			generaExplosion(nave.x, nave.y, 'lightgreen');
			generaExplosion(nave.x, nave.y, 'green');
		} 
	}
}

function checkDisparosAsteroidesCol() {
	for (let i = 0; i < disparos.length; i ++) {
		let disparo = disparos[i];

		for (let ii = 0; ii < asteroides.length; ii ++) {
			let asteroide = asteroides[ii];
			let colision = checkColisiones(disparo, asteroide);
			let replicaAste1;
			let replicaAste2;

			if (colision) {
				let sizeAste = parseInt(asteroide.radio / 2);

				if (sizeAste >= 5) {
					replicaAste1 = new Asteroide(asteroide.x, asteroide.y, 
						sizeAste, asteroide.color);

					replicaAste2 = new Asteroide(asteroide.x, asteroide.y, 
						sizeAste, asteroide.color);

					puntos += 10;
				}

				asteroides.splice(ii, 1);
				disparos.splice(i, 1);

				if (sizeAste < 5) {
					generaExplosion(asteroide.x, asteroide.y, asteroide.color);
					puntos += 50;
				}

				if (sizeAste >= 5) {
					asteroides.push(replicaAste1);
					asteroides.push(replicaAste2);
				}

				//console.log('colision');
				//console.log(asteroides);
			}
		}
	}
}

function checkColisiones(obj1, obj2) {
	let cateto1 = Math.abs(obj1.x - obj2.x);
	let cateto2 = Math.abs(obj1.y - obj2.y);

	if (Math.hypot(cateto1, cateto2) < obj1.radio + obj2.radio) {
		return true;

	} else {
		return false;
	}
}

//--------------------------------------------------------------
function checkNivelSuperado() {
	if (asteroides.length <= 0 && !nivelSuperado) {
		nivelSuperado = true;
		nivel ++;
		puntos += 500;
		setTimeout(creaAsteroides, 5000);
	}

	//console.log(nivelSuperado);
}

//--------------------------------------------------------------
function dibujaTextos() {
	dibujaTitulo();
	dibujaMarcadores();
	dibujaNivelSuperado();
	dibujaGameOver();
}

function dibujaTitulo() {
	if (enJuego) return;

	let size = parseInt(TX * 3);
	let sizeTxt = size.toString();

	ctx.font = sizeTxt + 'px impact';
	ctx.textAlign ='center';
	ctx.fillStyle = 'yellowgreen';
	ctx.fillText('Asteroides', canvas.width / 2, canvas.height / 3);

	size = parseInt(TX * 1.1);
	sizeTxt = size.toString();

	ctx.font = sizeTxt + 'px impact';
	ctx.fillStyle = 'lightblue';
	ctx.fillText('Pulse aqui para Jugar...', canvas.width / 2, 
		canvas.height - canvas.height / 12);

	ctx.font = sizeTxt + 'px impact';
	ctx.fillStyle = 'yellow';
	ctx.fillText('Controles: Solo pulsa en la pantalla', canvas.width / 2, 
		canvas.height / 2);
	ctx.fillText('para cambiar el sentido de giro.', canvas.width / 2, 
		canvas.height / 2 + size);
}

function dibujaMarcadores() {
	let size = parseInt(TX / 1.5);
	let sizeTxt = size.toString();

	ctx.font = sizeTxt + 'px impact';
	//ctx.textAlign = 'left';
	ctx.fillStyle = 'orangered';
	ctx.fillText('Puntos:  ' + puntos.toString(), canvas.width / 5, size);
	ctx.fillText('Nivel: ' + nivel.toString(), parseInt(canvas.width / 2), size);
	ctx.fillText('Vidas: ' + vidas.toString(), parseInt(canvas.width / 1.2), size);
}

function dibujaNivelSuperado() {
	if (!nivelSuperado) return;

	let size = parseInt(TX * 3);
	let sizeTxt = size.toString();

	ctx.font = sizeTxt + 'px impact';
	ctx.textAlign = 'center';
	ctx.fillStyle = 'yellowgreen';
	ctx.fillText('Nivel Superado!', canvas.width / 2, 
		canvas.height - canvas.height / 2);
}

function dibujaGameOver() {
	if (!gameOver) return;

	let size = parseInt(TX * 3);
	let sizeTxt = size.toString();

	ctx.font = sizeTxt + 'px impact';
	ctx.textAlign = 'center';
	ctx.fillStyle = 'yellowgreen';
	ctx.fillText('Game Over', canvas.width / 2, 
		canvas.height - canvas.height / 2);

	ctx.font = '18px impact';
	ctx.fillStyle = 'lightblue';
	ctx.fillText('Cargando...', canvas.width / 2, parseInt(canvas.height / 1.5));
}

//--------------------------------------------------------------
function reescalaCanvas() {
	canvas.style.width = widthCanvasAmpliado.toString() + 'px';
	canvas.style.height = heightCanvasAmpliado.toString() + 'px';
}

//==============================================================
// Funcion INICIALIZA
//--------------------------------------------------------------
function inicializa() {
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', '1000');
	canvas.setAttribute('height', '550');
	canvas.setAttribute('id', 'canvas');
	canvas.style.border = '2px solid black';

	document.body.appendChild(canvas);
	ctx = canvas.getContext('2d');

	FILAS = parseInt(canvas.height / TY);
	COLUMNAS = parseInt(canvas.width / TX);

	crearEstrellasFijas();
	crearEstrellasEspacio3D();

	setInterval(buclePrincipal, 1000 / FPS);
	setInterval(creaDisparo, CADENCIA_DISPAROS);
}

//=============================================================
function buclePrincipal() {
	ctx.fillStyle = '#000025';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	dibujaEstrellasFijas();
	dibujaEspacio3D();

	if (enJuego) {
		nave.dibuja();
		dibujaDisparos();
		dibujaAsteroides();
		checkTodasColisiones();
		dibujaYborraFragmentos();
		checkNivelSuperado();
	}

	dibujaTextos();
}



