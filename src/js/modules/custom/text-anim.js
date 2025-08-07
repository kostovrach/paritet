try {
	const animContainers = document.querySelectorAll('.text-anim-block');

	const visibleContainers = new Set();

	animContainers.forEach((container) => {
		const items = container.querySelectorAll('.text-anim');
		items.forEach((element) => {
			if (element.dataset.processed) return;

			const text = element.textContent.trim();
			const words = text.split(/\s+/);

			element.dataset.originalText = text;
			element.dataset.processed = 'true';
			element.innerHTML = '';

			words.forEach((word) => {
				const wordSpan = document.createElement('span');
				wordSpan.className = 'word';
				wordSpan.textContent = word;
				element.appendChild(wordSpan);
			});
		});
	});

	const updateProgress = () => {
		visibleContainers.forEach((container) => {
			const rect = container.getBoundingClientRect();
			const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
			const scrollY = window.scrollY || window.pageYOffset;

			const blockTop = scrollY + rect.top * 1.3;
			const blockHeight = rect.height;

			const scrollProgress = (scrollY + viewportHeight - blockTop) / (blockHeight * 2);
			const progressRaw = Math.min(1, Math.max(0, scrollProgress));

			const words = container.querySelectorAll('.word');
			const wordCount = words.length;

			words.forEach((word, index) => {
				const segmentSize = 1 / wordCount;
				const start = index * segmentSize;
				const end = (index + 1) * segmentSize;

				let wordProgress;
				if (progressRaw <= start) {
					wordProgress = 0;
				} else if (progressRaw >= end) {
					wordProgress = 1;
				} else {
					wordProgress = (progressRaw - start) / segmentSize;
				}

				const progress = (wordProgress * 100).toFixed(1);
				word.style.setProperty('--view-progress', `${progress}%`);
			});
		});

		requestAnimationFrame(updateProgress);
	};

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					visibleContainers.add(entry.target);
				} else {
					visibleContainers.delete(entry.target);
				}
			});
		},
		{
			threshold: [0, 0.01],
		}
	);

	animContainers.forEach((block) => {
		observer.observe(block);
	});

	requestAnimationFrame(updateProgress);
} catch (err) {
	console.log(err);
}
