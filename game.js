document.addEventListener('DOMContentLoaded', () => {
  const juego = document.getElementById('bloque_juego');

  let nave;
  let balas = [];
  let enemigos = [];
  let cursores = { left: false, right: false };
  let botonDisparo = false;
  let tiempoBala = 0;
  let juegoTerminado = false;


  function preload() {
    // Fondo
    const fondo = new Image();
    fondo.src = 'img/bg.png';
    fondo.alt = 'Fondo del juego';
    fondo.classList.add('fondo-juego');
    fondo.onload = () => {
      juego.appendChild(fondo);
      create();
    };

    // Nave
    nave = document.createElement('img');
    nave.src = 'img/spaceship.png';
    nave.alt = 'Nave';
    nave.classList.add('nave');
    juego.appendChild(nave);

    // Crear las balas
    for (let i = 0; i < 20; i++) {
      let bala = document.createElement('img');
      bala.src = 'img/bala.png';
      bala.alt = 'Bala';
      bala.classList.add('bala');
      bala.style.display = 'none'; 
      juego.appendChild(bala);
      balas.push(bala);
    }

    // Crear los enemigos
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 6; x++) {
        let enemigo = document.createElement('img');
        enemigo.src = 'img/alien.png';
        enemigo.alt = 'Enemigo';
        enemigo.classList.add('enemigo');
        enemigo.style.left = `${x * 50 + 30}px`;
        enemigo.style.top = `${y * 50 + 30}px`; 
        juego.appendChild(enemigo);
        enemigos.push(enemigo);
      }
    }
  }

  // juego
  function create() {
    nave.style.left = '160px'; 
    nave.style.bottom = '10px'; 
  }

  // Actualización del juego
  function update() {
    if (!juegoTerminado) {
      moverNave();
      dispararBala();
      moverEnemigos();
      detectarColisiones();
    }
  }

  // Movimiento
  function moverNave() {
    if (cursores.right) {
      nave.style.left = `${parseInt(nave.style.left) + 3}px`;
    } else if (cursores.left) {
      nave.style.left = `${parseInt(nave.style.left) - 3}px`;
    }
  }

  //Disparar
  function dispararBala() {
    if (botonDisparo && Date.now() > tiempoBala) {
      let bala = balas.find(b => b.style.display === 'none');
      if (bala) {
        bala.style.left = `${parseInt(nave.style.left) + 20}px`; 
        bala.style.bottom = '60px'; 
        bala.style.display = 'block'; 
        moverBala(bala);
        tiempoBala = Date.now() + 500;
      }
    }
  }

  
  function moverBala(bala) {
    const interval = setInterval(() => {
      let balaPos = parseInt(bala.style.bottom);
      if (balaPos > 550) {
        bala.style.display = 'none'; 
        clearInterval(interval);
      } else {
        bala.style.bottom = `${balaPos + 5}px`;
      }
    }, 20);
  }

  // Movimiento enemigos
  function moverEnemigos() {
    enemigos.forEach(enemigo => {
      let enemigoPos = parseFloat(enemigo.style.top); 
      if (enemigoPos > 550) {
        enemigo.style.top = '30px'; 
      } else {
        enemigo.style.top = `${enemigoPos + 0.2}px`; 
      }

     
      if (!juegoTerminado && parseInt(enemigo.style.top) > 480 && Math.abs(parseInt(enemigo.style.left) - parseInt(nave.style.left)) < 30) {
        detenerJuego();
      }
    });
  }

  // Game over
  function detenerJuego() {
    juegoTerminado = true;
    alert("¡Game Over! Un alien llegó a tu nave.");
  }

  // colisiones
  function detectarColisiones() {
    balas.forEach(bala => {
      if (bala.style.display === 'block') {
        enemigos.forEach(enemigo => {
          if (isCollision(bala, enemigo)) {
            bala.style.display = 'none';
            enemigo.style.display = 'none';
          }
        });
      }
    });
  }

 
  function isCollision(bala, enemigo) {
    let balaRect = bala.getBoundingClientRect();
    let enemigoRect = enemigo.getBoundingClientRect();
    return (
      balaRect.top < enemigoRect.bottom &&
      balaRect.bottom > enemigoRect.top &&
      balaRect.left < enemigoRect.right &&
      balaRect.right > enemigoRect.left
    );
  }

  // Detectar las teclas
  function handleKeyDown(event) {
    if (event.key === 'ArrowRight') {
      cursores.right = true;
    } else if (event.key === 'ArrowLeft') {
      cursores.left = true;
    } else if (event.key === ' ') {
      botonDisparo = true;
    }
  }

  function handleKeyUp(event) {
    if (event.key === 'ArrowRight') {
      cursores.right = false;
    } else if (event.key === 'ArrowLeft') {
      cursores.left = false;
    } else if (event.key === ' ') {
      botonDisparo = false;
    }
  }


  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  //bucle del juego
  function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
  }

  preload(); 
  gameLoop(); 
});
