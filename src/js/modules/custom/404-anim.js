import getElementOrThrow from '../utils/getElementOrThrow.js';

try {
	const container = getElementOrThrow('.not-found__anim');
	const layers = container.querySelectorAll('span'); // <----- Селектор анимируемого элемента

	const maxOffset = 64;                              // <----- Максимальный оффсет
	const intensities = [0, 0.2, 0.4, 0.6, 0.8, 1];    // <----- Интенсивность анимации каждого слоя
	
	// Фиксированные позиции к слоям от 1 до 6
	const initialOffsets = [
		{ x: -3, y: 3 },
		{ x: -6, y: 6 }, 
		{ x: -9, y: 9 },
		{ x: -12, y: 12 },
		{ x: -15, y: 15 },
		{ x: -18, y: 18 }
	];

	const returnDuration = getComputedStyle(container).getPropertyValue('--return-duration').trim() || '0.6s';

	layers.forEach((layer, index) => {
		const offset = initialOffsets[index] || { x: 0, y: 0 };
		layer.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
	});

	document.addEventListener('mousemove', (e) => {
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;

		const mouseX = (e.clientX - centerX) / centerX;
		const mouseY = (e.clientY - centerY) / centerY;

		layers.forEach((layer, index) => {
			const intensity = intensities[index] || 0;
			const initialOffset = initialOffsets[index] || { x: 0, y: 0 };
			
			const offsetX = mouseX * maxOffset * intensity + initialOffset.x;
			const offsetY = mouseY * maxOffset * intensity + initialOffset.y;

			layer.style.transition = 'none';
			layer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
		});
	});

	document.addEventListener('mouseleave', () => {
		layers.forEach((layer, index) => {
			const initialOffset = initialOffsets[index] || { x: 0, y: 0 };
			
			layer.style.transition = `transform ${returnDuration} ease-out`;
			layer.style.transform = `translate(${initialOffset.x}px, ${initialOffset.y}px)`;
		});
	});

} catch (err) {
	console.log('Ошибка в модуле 404-anim:', err);
}