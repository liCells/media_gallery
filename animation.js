// 自定义粒子效果实现
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.zIndex = "-1";

let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 3 + 1,
    speedX: Math.random() * 2 - 1,
    speedY: Math.random() * 2 - 1,
    color: ["#ffffff", "#45a29e", "#66fcf1"][Math.floor(Math.random() * 3)],
  };
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);

    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
    if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
  });

  requestAnimationFrame(drawParticles);
}

function initParticles() {
  resizeCanvas();
  particles = Array(40).fill().map(createParticle);
  drawParticles();
}

window.addEventListener("resize", resizeCanvas);
initParticles();

// 添加鼠标交互
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  particles.forEach((particle) => {
    const dx = mouseX - particle.x;
    const dy = mouseY - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 100) {
      particle.x -= dx * 0.05;
      particle.y -= dy * 0.05;
    }
  });
});

// 点击添加粒子
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (let i = 0; i < 5; i++) {
    const particle = createParticle();
    particle.x = mouseX;
    particle.y = mouseY;
    particles.push(particle);
  }
});
