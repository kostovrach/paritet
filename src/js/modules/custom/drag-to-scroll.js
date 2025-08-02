try {
	const containers = document.querySelectorAll(".drag-to-scroll");

	containers.forEach((container) => {
		let isDown = false;
		let startX, scrollLeft;

		container.addEventListener("mousedown", (e) => {
			isDown = true;
			container.classList.add("dragging");
			startX = e.pageX - container.offsetLeft;
			scrollLeft = container.scrollLeft;
		});

		container.addEventListener("mouseleave", () => {
			isDown = false;
			container.classList.remove("dragging");
		});

		container.addEventListener("mouseup", () => {
			isDown = false;
			container.classList.remove("dragging");
		});

		container.addEventListener("mousemove", (e) => {
			if (!isDown) return;
			e.preventDefault();
			const x = e.pageX - container.offsetLeft;
			const walk = (x - startX) * 1.2;
			container.scrollLeft = scrollLeft - walk;
		});
	});
} catch (err) {
	console.log("Ошибка в модуле drag-to-scroll", err);
}
