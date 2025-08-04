try {
	function initTextAnimation() {
		// Находим все элементы с классом text-anim
		const textElements = document.querySelectorAll('.text-anim');

		textElements.forEach((element) => {
			// Пропускаем уже обработанные элементы
			if (element.dataset.processed) return;

			// Получаем текст и разбиваем на слова
			const text = element.textContent.trim();
			const words = text.split(/\s+/);

			// Сохраняем оригинальный текст
			element.dataset.originalText = text;
			element.dataset.processed = 'true';

			// Очищаем содержимое элемента
			element.innerHTML = '';

			// Создаем span для каждого слова
			words.forEach((word, index) => {
				const wordSpan = document.createElement('span');
				wordSpan.className = 'word';
				wordSpan.textContent = word;

				// Добавляем задержку для каждого слова (опционально)
				// Раскомментируйте если нужны задержки между словами
				const entryDelay = (index + 2) * 60;
				const exitDelay = entryDelay + 100;
				// const exitDelay = (index / words.length) + (words.length * 10);
				wordSpan.style.animationRange = `entry ${entryDelay}px exit ${exitDelay}px`;
				// wordSpan.style.animationTimeline = `view(${index + 2}% block)`;

				element.appendChild(wordSpan);

				// Добавляем пробел после слова (кроме последнего)
				// if (index < words.length - 1) {
				// 	element.appendChild(document.createTextNode(' '));
				// }
			});
		});
	}

	// Инициализация при загрузке страницы
	document.addEventListener('DOMContentLoaded', () => {
		initTextAnimation();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});
} catch (err) {
	console.log(err);
}
