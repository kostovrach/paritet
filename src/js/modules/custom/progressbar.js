import getElementOrThrow from '../utils/getElementOrThrow.js';

try {
	const section = getElementOrThrow('.js_progressbar-container');
	const progressbar = section.querySelector('.js_progressbar');
	const items = section.querySelectorAll('.js_progressbar-item');

	function updateProgressPosition() {
		let maxWidth = 0;
		items.forEach((item) => {
			const firstChild = item.firstElementChild;
			if (!firstChild) return;

			const width = firstChild.offsetWidth;
			if (width > maxWidth) {
				maxWidth = width;
			}
		});

		progressbar.style.setProperty('--left-position', `${maxWidth}px`);
	}

	function updateProgressBar() {
		const rect = section.getBoundingClientRect();
		const windowHeight = window.innerHeight;

		const start = windowHeight * 0.2;
		const end = rect.height - windowHeight * 0.3;

		const visibleTop = Math.max(0, -rect.top + start);
		const maxScrollable = end;

		const progress = Math.min(1, Math.max(0, visibleTop / maxScrollable));

		progressbar.style.setProperty('--progress', `${progress * 100}%`);
	}

	window.addEventListener('resize', () => {
		updateProgressBar();
		updateProgressPosition();
	});

	window.addEventListener('load', () => {
		updateProgressBar();
		updateProgressPosition();
	});

	window.addEventListener('scroll', () => {
		updateProgressBar();
	});
} catch (err) {
	console.log('Ошибка в модуле progressbar:', err);
}
