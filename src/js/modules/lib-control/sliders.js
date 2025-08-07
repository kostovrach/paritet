import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar, Mousewheel, Autoplay, EffectFade } from 'swiper/modules';


//// Функция запуска autoplay при нахождении слайдера во вьюпорте===============
function setupViewportAutoplay(swiper, targetEl) {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					swiper.autoplay.start();
				} else {
					swiper.autoplay.stop();
				}
			});
		},
		{
			root: null,
			threshold: 0.1,
		}
	);

	observer.observe(targetEl);
	return observer;
}

//// Example====================================================================
try {
	const exampleSlider = new Swiper('[data-swiper-id="example"]', {
		modules: [Navigation, Pagination, Autoplay, Scrollbar, Mousewheel, EffectFade],
		slidesPerView: 3, // сколько слайдов будет показано за раз (можно использовать настройку 'auto')
		//loop: true, // "залупливание" слайдера (зацикливание)
		speed: 800, // скорость анимации перемотки
		spaceBetween: 32, // расстояние между слайдами
		//initialSlide: 1, // какой слайд будет отображаться при загрузке страницы (отсчет с 0)
		slideToClickedSlide: true, // переход к слайду, по которому был совершен клик
		//effect: 'fade', // пример подключения эффекта
		mousewheel: {
			// настройка для трекпадов (чтобы можно было листать слайдер жестами)
			forceToAxis: true,
		},
		freeMode: {
			// добавляет свободный скролл (удобно, чтобы не дожидаться, пока прилетит следующий слайд)
			enabled: true,
			sticky: true,
		},
		//allowTouchMove: false, //отключить любые взаимодействия мыши со слайдером для перелистывания
		breakpoints: {
			// брейкпоинты
			600: {
				// действует, когда экран 600px и более
				//slidesPerView: 2
			},
		},
		autoplay: {
			// автоперемотка слайдера
			delay: 3000, // задержка перед перемоткой в мс
		},
		navigation: {
			// добавляет навигацию
			prevEl: '.content__block:has([data-swiper-id="example"]) .slider-navigation__link--prev', // класс ссылки на предыдущий слайд (нужно добавить блок с этим классом в слайдер)
			nextEl: '.content__block:has([data-swiper-id="example"]) .slider-navigation__link--next', // класс ссылки на следующий слайд (нужно добавить блок с этим классом в слайдер)
			disabledClass: 'disable',
			hiddenClass: 'hidden',
		},
		pagination: {
			// добавляет пагинацию
			el: '.content__block:has([data-swiper-id="example"]) .slider-pagination', // класс пагинации (нужно добавить блок с этим классом в слайдер)
			clickable: true,
			clickableClass: 'clickable',
			bulletClass: 'slider-pagination__bullet',
			bulletActiveClass: 'active',
			lockClass: 'disable',
		},
		// pagination: { // добавляет нумерованную пагинацию
		// 	el: '.content__block:has([data-swiper-id="example"]) .slider-num', // класс нумерованной пагинации (нужно добавить блок с этим классом в слайдер)
		// 	type: 'fraction',
		// 	currentClass: 'slider-num__current',
		// 	totalClass: 'slider-num__total',
		//	lockClass: 'disable'
		// },
		// pagination: { // добавляет кастомную пагинацию (свои блоки в качестве пунктов пагинации)
		// 	el: '.content__block:has([data-swiper-id="example"]) .slider-pagination-custom',
		// 	clickable: true,
		// 	type: 'custom',
		// 	clickableClass: 'clickable',
		// 	bulletClass: 'slider-pagination-custom__bullet',
		// 	lockClass: 'disable'
		// },
		renderFraction: function (current, total) {
			return current + '/' + total;
		},
		scrollbar: {
			// добавляет скроллбар
			el: '.content__block:has([data-swiper-id="example"]) .slider-scrollbar', // класс скроллбара (нужно добавить блок с этим классом в слайдер)
			dragClass: 'slider-scrollbar__drag',
		},
		slideActiveClass: 'current-slide', // класс активного слайда
	});

	//Код для переключения активного пункта пагинации для кастомной пагинации==========
	exampleSlider.on('slideChange', function () {
		const activeIndex = exampleSlider.activeIndex;
		const paginationEl = document.querySelectorAll('.content__block:has([data-swiper-id="example"]) .slider-pagination-custom__bullet');
		paginationEl.forEach(function (el) {
			el.classList.remove('active');
		});
		paginationEl[activeIndex].classList.add('active');
	});
	////Код для переключения активного пункта пагинации для кастомной пагинации==========
} catch (err) {
	console.log(err);
}

//// Main-promo-slider==========================================================
try {
	const sliderEl = document.querySelector('[data-swiper-id="main-promo-slider"]');

	const mainPromoSlider = new Swiper(sliderEl, {
		modules: [Autoplay],
		slidesPerView: 'auto',
		speed: 800,
		spaceBetween: 16,
		grabCursor: true,
		mousewheel: {
			forceToAxis: true,
		},
		autoplay: {
			delay: 6000,
			pauseOnMouseEnter: true,
		},
		slideActiveClass: 'current-slide',
		breakpoints: {
			540: {
				spaceBetween: 32,
			},
		},
	});

	setupViewportAutoplay(mainPromoSlider, sliderEl);
} catch (err) {
	console.log(err);
}

//// Partners slider============================================================
try {
	const sliderEl = document.querySelector('[data-swiper-id="partners-slider"]');

	const partnersSlider = new Swiper(sliderEl, {
		modules: [Autoplay],
		slidesPerView: 'auto',
		spaceBetween: 16,
		allowTouchMove: false,
		simulateTouch: false,
		waitForTransition: false,
		loop: true,
		speed: 8000,
		autoplay: {
			delay: 0,
			disableOnInteraction: false,
			pauseOnMouseEnter: false,
		},
		slideActiveClass: 'current-slide',
	});

	setupViewportAutoplay(partnersSlider, sliderEl);
} catch (err) {
	console.log(err);
}
