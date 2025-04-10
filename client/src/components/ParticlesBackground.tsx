import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  console.log('ParticlesBackground component rendered');

  useEffect(() => {
    console.log('ParticlesBackground useEffect called');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Параметры анимации
    const PARAMS = {
      particleCount: 60,
      particleMaxVelocity: 0.6,
      particleRadius: 4,
      lineLength: 200,
      mouseRepelRadius: 150,
      mouseRepelForce: 0.15
    };

    // Цвета для частиц
    const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12'];
    
    // Отслеживание положения мыши
    const mousePosition = { x: -1000, y: -1000 };
    
    // Функция для изменения размера холста
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Установка начальных размеров
    resizeCanvas();

    // Событие изменения размера окна
    window.addEventListener('resize', resizeCanvas);
    
    // Событие движения мыши
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.x = e.clientX;
      mousePosition.y = e.clientY;
    };
    
    // Событие ухода мыши с холста
    const handleMouseLeave = () => {
      mousePosition.x = -1000;
      mousePosition.y = -1000;
    };
    
    // Добавление слушателей событий мыши
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // Расчет расстояния между точками
    const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };
    
    // Функция создания частицы
    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * PARAMS.particleMaxVelocity,
        vy: (Math.random() - 0.5) * PARAMS.particleMaxVelocity,
        radius: Math.random() * PARAMS.particleRadius + 1, // Стандартный минимальный размер
        alpha: Math.random() * 0.5 + 0.2, // Стандартная непрозрачность
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      };
    };
    
    // Создание начальных частиц
    const particles: Particle[] = Array.from({ length: PARAMS.particleCount }, () => createParticle());
    
    // Основная функция анимации
    const animate = () => {
      // Очистка холста (без эффекта затухания)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Обновление и отрисовка каждой частицы
      particles.forEach((particle, i) => {
        // Отталкивание от курсора
        const distToMouse = getDistance(particle.x, particle.y, mousePosition.x, mousePosition.y);
        if (distToMouse < PARAMS.mouseRepelRadius) {
          const angle = Math.atan2(particle.y - mousePosition.y, particle.x - mousePosition.x);
          const force = (PARAMS.mouseRepelRadius - distToMouse) / PARAMS.mouseRepelRadius * PARAMS.mouseRepelForce;
          
          particle.vx += Math.cos(angle) * force;
          particle.vy += Math.sin(angle) * force;
        }
        
        // Обновление позиции
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Отскок от границ
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
        }
        
        // Отрисовка частицы
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10; // Меньшее размытие
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Рисуем линии между частицами
        for (let j = i + 1; j < particles.length; j++) {
          const particle2 = particles[j];
          const dist = getDistance(particle.x, particle.y, particle2.x, particle2.y);
          
          if (dist < PARAMS.lineLength) {
            ctx.beginPath();
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = 1 - (dist / PARAMS.lineLength); // Стандартная непрозрачность
            ctx.lineWidth = 0.7; // Тонкие линии
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.stroke();
          }
        }
      });
      
      // Продолжение анимации
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Запуск анимации
    animate();
    
    // Очистка при размонтировании компонента
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          opacity: 0.6
        }}
      />
    </Box>
  );
};

export default ParticlesBackground; 