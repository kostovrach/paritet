try {
	const spoilers = document.querySelectorAll(".main-services__item");
	const originalTexts = new WeakMap();

	const observer = new MutationObserver((mutationsList) => {
		mutationsList.forEach((mutation) => {
			if (mutation.type === "attributes" && mutation.attributeName === "class") {
				const el = mutation.target;
				const button = el.querySelector(".main-services__item-button");
				if (!button) return;

				if (el.classList.contains("open")) {
					if (!originalTexts.has(button)) {
						originalTexts.set(button, button.textContent);
					}

					const toggleText = button.getAttribute("data-toggle-text");
					if (toggleText !== null) {
						button.textContent = toggleText;
					}
				} else {
					if (originalTexts.has(button)) {
						button.textContent = originalTexts.get(button);
					}
				}
			}
		});
	});

	spoilers.forEach((el) => {
		observer.observe(el, {
			attributes: true,
			attributeFilter: ["class"],
		});
	});
} catch (err) {
	console.log("Ошибка в модуле main-spoilers:", err);
}
