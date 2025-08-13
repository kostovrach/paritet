//// Основная фильтрация происходит по data-type="",

//// Cортировка происходит по атрибуту datetime тега <time></time>, значения принимаются в формате YYYY-MM-DD

class NewsFilter {
	constructor() {
		this.filterState = {
			topic: null,
			industry: null,
			expertise: null,
			sorting: null,
		};

		this.originalTitles = {};
		this.originalOrder = [];

		this.init();
	}

	init() {
		this.saveOriginalTitles();

		this.saveOriginalOrder();

		const filterGroups = document.querySelectorAll('.js_filter');

		filterGroups.forEach((group) => {
			const buttons = group.querySelectorAll('.js_filter-options button');
			const currentSpan = group.querySelector('.js_filter-current span');
			const groupId = group.id;

			buttons.forEach((button) => {
				button.addEventListener('click', (e) => {
					e.preventDefault();
					this.handleFilterClick(button, currentSpan, groupId);
				});
			});
		});

		this.initResetButton();
	}

	handleFilterClick(button, currentSpan, groupId) {
		const filterValue = button.dataset.type;
		const buttonText = button.textContent;
		const filterGroup = button.closest('.js_filter');

		this.filterState[groupId] = filterValue;

		currentSpan.textContent = buttonText;

		if (filterGroup.classList.contains('open')) {
			filterGroup.classList.remove('open');
		}

		this.applyFilters();

		this.updateResetButtonState();
	}

	saveOriginalTitles() {
		const filterGroups = document.querySelectorAll('.js_filter');

		filterGroups.forEach((group) => {
			const currentSpan = group.querySelector('.js_filter-current span');
			const groupId = group.id;

			if (currentSpan && groupId) {
				this.originalTitles[groupId] = currentSpan.textContent;
			}
		});
	}

	saveOriginalOrder() {
		const items = document.querySelectorAll('.js_filtering-item');
		this.originalOrder = Array.from(items);
	}

	initResetButton() {
		const resetButton = document.querySelector('.js_filter-reset');

		if (resetButton) {
			resetButton.addEventListener('click', (e) => {
				e.preventDefault();
				this.resetAllFilters();
			});
		}
	}

	applyFilters() {
		const items = document.querySelectorAll('.js_filtering-item');
		const visibleItems = [];

		items.forEach((item) => {
			let shouldShow = true;

			['topic', 'industry', 'expertise'].forEach((filterType) => {
				if (this.filterState[filterType]) {
					const itemTypes = item.dataset.type ? item.dataset.type.split(' ') : [];
					if (!itemTypes.includes(this.filterState[filterType])) {
						shouldShow = false;
					}
				}
			});

			if (shouldShow) {
				item.style.display = '';
				visibleItems.push(item);
			} else {
				item.style.display = 'none';
			}
		});

		if (this.filterState.sorting && visibleItems.length > 0) {
			this.sortItems(visibleItems);
		}

		this.updateResetButtonState();
	}

	updateResetButtonState() {
		const resetButton = document.querySelector('.js_filter-reset');

		if (resetButton) {
			const hasActiveFilters = Object.values(this.filterState).some((value) => value !== null);

			if (hasActiveFilters) {
				resetButton.classList.add('active');
			} else {
				resetButton.classList.remove('active');
			}
		}
	}

	resetAllFilters() {
		Object.keys(this.filterState).forEach((key) => {
			this.filterState[key] = null;
		});

		Object.keys(this.originalTitles).forEach((groupId) => {
			const group = document.getElementById(groupId);
			if (group) {
				const currentSpan = group.querySelector('.js_filter-current span');
				if (currentSpan) {
					currentSpan.textContent = this.originalTitles[groupId];
				}
			}
		});

		this.restoreOriginalOrder();

		this.updateResetButtonState();
	}

	restoreOriginalOrder() {
		const container = document.querySelector('.js_filtering');

		this.originalOrder.forEach((item) => {
			item.style.display = '';
			container.appendChild(item);
		});
	}

	sortItems(items) {
		const container = document.querySelector('.js_filtering');
		const sortType = this.filterState.sorting;

		items.sort((a, b) => {
			const dateA = this.getItemDate(a);
			const dateB = this.getItemDate(b);

			if (sortType === 'new') {
				return new Date(dateB) - new Date(dateA);
			} else if (sortType === 'old') {
				return new Date(dateA) - new Date(dateB);
			}

			return 0;
		});

		items.forEach((item) => {
			container.appendChild(item);
		});
	}

	getItemDate(item) {
		const timeElement = item.querySelector('time[datetime]');
		return timeElement ? timeElement.getAttribute('datetime') : '1970-01-01';
	}
}

try {
	new NewsFilter();
} catch (err) {
	console.log(err);
}
