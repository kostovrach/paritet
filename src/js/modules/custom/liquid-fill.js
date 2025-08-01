(function () {
	class LiquidFill {
		constructor() {
			this.items = document.querySelectorAll(".liquid-item");
			if (!this.items.length) return;

			this.currentHoverItem = null;
			this.isTransitioning = false;
			this.transitionTimeout = null;
			this.init();
		}

		init() {
			this.items.forEach((item, index) => {
				item.addEventListener("mouseenter", (e) => this.handleMouseEnter(e, index));
				item.addEventListener("mouseleave", (e) => this.handleMouseLeave(e, index));
			});
		}

		handleMouseEnter(e, currentIndex) {
			if (this.transitionTimeout) {
				clearTimeout(this.transitionTimeout);
				this.transitionTimeout = null;
			}

			const item = e.currentTarget;
			const liquidFill = item.querySelector(".liquid-fill");
			if (!liquidFill) return;

			const isSeamlessTransition = this.currentHoverItem !== null && Math.abs(this.currentHoverItem - currentIndex) === 1;

			this.clearAllAnimationClasses(liquidFill);

			if (isSeamlessTransition) {
				const direction = this.currentHoverItem < currentIndex ? "from-prev" : "from-next";

				if (direction === "from-prev") {
					liquidFill.classList.add("seamless-from-prev");
				} else {
					liquidFill.classList.add("seamless-from-next");
				}
			} else {
				const direction = this.getEnterDirection(currentIndex);

				if (direction === "top") {
					liquidFill.classList.add("from-top");
				} else {
					liquidFill.classList.add("from-bottom");
				}
			}

			this.currentHoverItem = currentIndex;
		}

		handleMouseLeave(e, currentIndex) {
			const item = e.currentTarget;
			const liquidFill = item.querySelector(".liquid-fill");
			if (!liquidFill) return;

			const nextDirection = this.getExitDirection(e, currentIndex);
			const nextIndex = this.getNextHoverIndex(e, currentIndex, nextDirection);

			const isSeamlessTransition = nextIndex !== null && Math.abs(nextIndex - currentIndex) === 1;

			liquidFill.classList.remove("from-top", "from-bottom", "seamless-from-prev", "seamless-from-next");

			if (isSeamlessTransition) {
				const direction = nextIndex > currentIndex ? "to-next" : "to-prev";

				if (direction === "to-next") {
					liquidFill.classList.add("seamless-to-next");
				} else {
					liquidFill.classList.add("seamless-to-prev");
				}

				item.classList.add("transitioning");

				this.transitionTimeout = setTimeout(() => {
					item.classList.remove("transitioning");
				}, 400);
			} else {
				if (nextDirection === "top") {
					liquidFill.classList.add("exit-top");
				} else {
					liquidFill.classList.add("exit-bottom");
				}

				this.transitionTimeout = setTimeout(() => {
					this.clearAllAnimationClasses(liquidFill);
					liquidFill.style.transform = "scaleY(0)";
				}, 500);
			}

			if (!isSeamlessTransition) {
				this.currentHoverItem = null;
			}
		}

		getEnterDirection(currentIndex) {
			if (this.currentHoverItem === null) {
				return "top";
			}

			return this.currentHoverItem < currentIndex ? "top" : "bottom";
		}

		getExitDirection(e, currentIndex) {
			const rect = e.currentTarget.getBoundingClientRect();
			const mouseY = e.clientY;
			const itemCenterY = rect.top + rect.height / 2;

			return mouseY < itemCenterY ? "top" : "bottom";
		}

		getNextHoverIndex(e, currentIndex, direction) {
			if (direction === "top" && currentIndex > 0) {
				return currentIndex - 1;
			} else if (direction === "bottom" && currentIndex < this.items.length - 1) {
				return currentIndex + 1;
			}
			return null;
		}

		clearAllAnimationClasses(liquidFill) {
			const animationClasses = ["from-top", "from-bottom", "exit-top", "exit-bottom", "seamless-to-next", "seamless-to-prev", "seamless-from-prev", "seamless-from-next"];

			animationClasses.forEach((className) => {
				liquidFill.classList.remove(className);
			});
		}
	}

	document.addEventListener("DOMContentLoaded", () => {
		new LiquidFill();
	});
})();
