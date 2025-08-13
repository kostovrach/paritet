import getElementOrThrow from '../utils/getElementOrThrow.js';

try {
	const switcher = getElementOrThrow(".header__language");
	const switcherCurrent = switcher.querySelector(".header__language-current");
	const isPointerFine = window.matchMedia("(pointer: fine)").matches;

	if (!isPointerFine) {
		switcherCurrent.addEventListener("click", () => {
			switcher.classList.toggle("active");
		});
	}

	window.addEventListener("scroll", () => {
		if (window.scrollY > 10 && switcher.classList.contains("active")) {
			switcher.classList.remove("active");
		}
	});
} catch (err) {
	console.log("Ошибка в модуле language-switcher:", err);
}
