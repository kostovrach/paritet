import { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Composite } from 'matter-js';

// Общие функции для работы с текстом
const TextSystem = {
	// Массивы текстов для каждого модуля
	textPools: {
		main: ['Юридические услуги', 'Адвокатское бюро', 'Бухгалтерия и аудит'],
		accounting: ['Налоговый учет', 'Полное ведение бухгалтерии', 'Внутренний аудит'],
		lawyers: ['Сопровождение в органах', 'Представление интересов в суде', 'Адвокат на допросе или обыске'],
	},

	// Хранилище для текстовых элементов каждого модуля
	textElements: {},
	shapes: {},

	// Инициализация текстовой системы для модуля
	initModule(moduleName) {
		this.textElements[moduleName] = [];
		this.shapes[moduleName] = [];
	},

	// Получение текста из пула (циклично)
	getTextFromPool(moduleName, index) {
		const pool = this.textPools[moduleName];
		return pool[index % pool.length];
	},

	// Создание текстового элемента
	createTextElement(moduleName, className, shape, text, container) {
		const textEl = document.createElement('div');
		textEl.className = className;
		textEl.textContent = text;
		container.appendChild(textEl);

		this.textElements[moduleName].push(textEl);
		this.shapes[moduleName].push(shape);

		// Добавляем данные о тексте к фигуре
		shape.textData = {
			text: text,
			width: shape.bounds.max.x - shape.bounds.min.x,
			height: shape.bounds.max.y - shape.bounds.min.y,
		};
	},

	// Обновление позиций текста для модуля
	updateTextPositions(moduleName) {
		const shapes = this.shapes[moduleName];
		const textElements = this.textElements[moduleName];

		shapes.forEach((shape, index) => {
			if (textElements[index] && shape.textData) {
				const textEl = textElements[index];

				// Вычисляем позицию центра фигуры
				const centerX = shape.position.x;
				const centerY = shape.position.y;

				// Для кругов используем радиус, для прямоугольников - размеры
				let width, height;
				if (shape.circleRadius) {
					// Для кругов
					width = height = shape.circleRadius * 2;
				} else {
					// Для прямоугольников
					width = shape.textData.width;
					height = shape.textData.height;
				}

				const x = centerX - width / 2;
				const y = centerY - height / 2;

				textEl.style.left = x + 'px';
				textEl.style.top = y + 'px';
				textEl.style.width = width + 'px';
				textEl.style.height = height + 'px';
				textEl.style.transform = `rotate(${shape.angle}rad)`;
			}
		});
	},

	// Запуск анимации обновления для модуля
	startUpdateLoop(moduleName) {
		const updateLoop = () => {
			this.updateTextPositions(moduleName);
			requestAnimationFrame(updateLoop);
		};
		updateLoop();
	},

	// Очистка текстовых элементов модуля
	clearModule(moduleName) {
		if (this.textElements[moduleName]) {
			this.textElements[moduleName].forEach((el) => el.remove());
			this.textElements[moduleName] = [];
			this.shapes[moduleName] = [];
		}
	},
};

/***********************************  different-geometric-shapes ********************************** */
try {
	const moduleName = 'main';
	const container = document.querySelector('.js_different-geometric-shapes');
	const textOverlay = container.querySelector('.js_shapes-text-overlay');
	const textClassName = 'shapes-text';

	TextSystem.initModule(moduleName);

	const engine = Engine.create();
	const world = engine.world;

	const render = Render.create({
		element: container,
		engine: engine,
		options: {
			background: 'transparent',
			wireframes: false,
		},
	});
	Render.run(render);

	const runner = Runner.create();
	Runner.run(runner, engine);

	const canvas = render.canvas;

	function resizeCanvas() {
		canvas.width = container.clientWidth;
		canvas.height = container.clientHeight;
	}

	const computedColor = getComputedStyle(document.documentElement).getPropertyValue('--shapes-color').trim();

	function setupWorld() {
		resizeCanvas();

		const width = canvas.width;
		const height = canvas.height;

		const baseWidth = 1440;
		const viewport = window.innerWidth;

		let scale;

		function setScale() {
			if (window.innerWidth > 768) {
				scale = Math.min(1, viewport / baseWidth);
			} else {
				scale = 0.5;
			}
			return scale;
		}

		setScale();

		// Очищаем предыдущие объекты
		Composite.allBodies(world).forEach((body) => {
			if (body !== mouseConstraint.body) {
				World.remove(world, body);
			}
		});

		// Очищаем текстовые элементы
		TextSystem.clearModule(moduleName);

		const wallOptions = {
			isStatic: true,
			render: { visible: false },
		};

		const walls = [Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions), Bodies.rectangle(-25, height / 2, 50, height, wallOptions), Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions)];
		World.add(world, walls);

		const commonOptions = {
			restitution: 0.6,
			friction: 0.1,
			frictionAir: 0.02,
			density: 0.001,
			render: { fillStyle: computedColor },
		};

		const shapes = [
			// Большой прямоугольник
			Bodies.rectangle(width * 0.5, -1500, scale * 520, scale * 190, commonOptions),
			// Квадрат
			Bodies.rectangle(width * 0.45, -800, scale * 300, scale * 300, commonOptions),
			// Большой круг
			Bodies.circle(width * 0.5, -750, scale * 190, commonOptions),
			// Маленький круг
			Bodies.circle(width * 0.2, -550, scale * 80, commonOptions),
			// Маленький круг
			Bodies.circle(width * 0.4, -550, scale * 80, commonOptions),
			// Маленький прямоугольник
			Bodies.rectangle(width * 0.7, -500, scale * 290, scale * 140, commonOptions),
		];

		// Создаем текстовые элементы для каждой фигуры
		shapes.forEach((shape, index) => {
			const text = TextSystem.getTextFromPool(moduleName, index);
			TextSystem.createTextElement(moduleName, textClassName, shape, text, textOverlay);
		});

		World.add(world, shapes);
	}

	const mouse = Mouse.create(render.canvas);
	const mouseConstraint = MouseConstraint.create(engine, {
		mouse,
		constraint: {
			stiffness: 0.2,
			render: { visible: false },
		},
	});
	World.add(world, mouseConstraint);
	render.mouse = mouse;

	setupWorld();

	// Запускаем обновление позиций текста
	TextSystem.startUpdateLoop(moduleName);

	let resizeTimeout;
	let prevWidth = window.innerWidth;
	window.addEventListener('resize', () => {
		const currentWidth = window.innerWidth;
		if (currentWidth !== prevWidth) {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(setupWorld, 200);
			prevWidth = currentWidth;
		}
	});

	mouse.element.removeEventListener('wheel', mouse.mousewheel);
	mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
	mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
} catch (err) {
	console.log('Ошибка в модуле shapes:', err);
}

/****************************************** circles-shapes ******************************************/
try {
	const moduleName = 'accounting';
	const container = document.querySelector('.js_circles-shapes');
	const textOverlay = container.querySelector('.js_shapes-text-overlay');
	const textClassName = 'shapes-text shapes-text--circle';

	TextSystem.initModule(moduleName);

	const engine = Engine.create();
	const world = engine.world;

	const render = Render.create({
		element: container,
		engine: engine,
		options: {
			background: 'transparent',
			wireframes: false,
		},
	});
	Render.run(render);

	const runner = Runner.create();
	Runner.run(runner, engine);

	const canvas = render.canvas;

	function resizeCanvas() {
		canvas.width = container.clientWidth;
		canvas.height = container.clientHeight;
	}

	const computedColor = getComputedStyle(document.documentElement).getPropertyValue('--shapes-color').trim();

	function setupWorld() {
		resizeCanvas();

		const width = canvas.width;
		const height = canvas.height;

		const baseWidth = 1440;
		const viewport = window.innerWidth;

		let scale;

		function setScale() {
			if (window.innerWidth > 768) {
				scale = Math.min(1, viewport / baseWidth);
			} else {
				scale = 0.5;
			}
			return scale;
		}

		setScale();

		// Очищаем предыдущие объекты
		Composite.allBodies(world).forEach((body) => {
			if (body !== mouseConstraint.body) {
				World.remove(world, body);
			}
		});

		// Очищаем текстовые элементы
		TextSystem.clearModule(moduleName);

		const wallOptions = {
			isStatic: true,
			render: { visible: false },
		};

		const walls = [Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions), Bodies.rectangle(-25, height / 2, 50, height, wallOptions), Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions)];
		World.add(world, walls);

		const commonOptions = {
			restitution: 0.6,
			friction: 0.1,
			frictionAir: 0.02,
			density: 0.001,
			render: { fillStyle: computedColor },
		};

		const groups = [
			{ count: 2, radius: scale * 180 },
			{ count: 3, radius: scale * 90 },
			{ count: 1, radius: scale * 180 },
			{ count: 4, radius: scale * 70 },
		];

		let circleIndex = 0;
		const circles = groups.flatMap((group) =>
			Array.from({ length: group.count }, (_, i) => {
				const circle = Bodies.circle(width * 0.75, -600 + circleIndex * 100, group.radius, commonOptions);

				// Создаем текстовый элемент для круга
				const text = TextSystem.getTextFromPool(moduleName, circleIndex);
				TextSystem.createTextElement(moduleName, textClassName, circle, text, textOverlay);

				circleIndex++;
				return circle;
			})
		);

		World.add(world, circles);
	}

	const mouse = Mouse.create(render.canvas);
	const mouseConstraint = MouseConstraint.create(engine, {
		mouse,
		constraint: {
			stiffness: 0.2,
			render: { visible: false },
		},
	});
	World.add(world, mouseConstraint);
	render.mouse = mouse;

	setupWorld();

	// Запускаем обновление позиций текста
	TextSystem.startUpdateLoop(moduleName);

	let resizeTimeout;
	let prevWidth = window.innerWidth;
	window.addEventListener('resize', () => {
		const currentWidth = window.innerWidth;
		if (currentWidth !== prevWidth) {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(setupWorld, 200);
			prevWidth = currentWidth;
		}
	});

	mouse.element.removeEventListener('wheel', mouse.mousewheel);
	mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
	mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
} catch (err) {
	console.log('Ошибка в модуле shapes:', err);
}

/***********************************  rectangles-shapes ********************************** */
try {
	const moduleName = 'lawyers';
	const container = document.querySelector('.js_rectangles-shapes');
	const textOverlay = container.querySelector('.js_shapes-text-overlay');
	const textClassName = 'shapes-text';

	TextSystem.initModule(moduleName);

	const engine = Engine.create();
	const world = engine.world;

	const render = Render.create({
		element: container,
		engine: engine,
		options: {
			background: 'transparent',
			wireframes: false,
		},
	});
	Render.run(render);

	const runner = Runner.create();
	Runner.run(runner, engine);

	const canvas = render.canvas;

	function resizeCanvas() {
		canvas.width = container.clientWidth;
		canvas.height = container.clientHeight;
	}

	const computedColor = getComputedStyle(document.documentElement).getPropertyValue('--shapes-color').trim();

	function setupWorld() {
		resizeCanvas();

		const width = canvas.width;
		const height = canvas.height;

		const baseWidth = 1440;
		const viewport = window.innerWidth;

		let scale;

		function setScale() {
			if (window.innerWidth > 768) {
				scale = Math.min(1, viewport / baseWidth);
			} else {
				scale = 0.5;
			}
			return scale;
		}

		setScale();

		// Очищаем предыдущие объекты
		Composite.allBodies(world).forEach((body) => {
			if (body !== mouseConstraint.body) {
				World.remove(world, body);
			}
		});

		// Очищаем текстовые элементы
		TextSystem.clearModule(moduleName);

		const wallOptions = {
			isStatic: true,
			render: { visible: false },
		};

		const walls = [Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions), Bodies.rectangle(-25, height / 2, 50, height, wallOptions), Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions)];
		World.add(world, walls);

		const commonOptions = {
			restitution: 0.6,
			friction: 0.1,
			frictionAir: 0.02,
			density: 0.001,
			render: { fillStyle: computedColor },
		};

		const shapes = [
			// Квадрат
			Bodies.rectangle(width * 0.2, -800, scale * 320, scale * 320, commonOptions),
			// Маленький квадрат
			Bodies.rectangle(width * 0.3, -500, scale * 150, scale * 150, commonOptions),
			// Большой прямоугольник
			Bodies.rectangle(width * 0.4, -1200, scale * 290, scale * 620, commonOptions),
			// Маленький прямоугольник
			Bodies.rectangle(width * 0.75, -900, scale * 420, scale * 150, commonOptions),
			// Большой прямоугольник
			Bodies.rectangle(width * 0.75, -700, scale * 620, scale * 290, commonOptions),
			// Квадрат
			Bodies.rectangle(width * 0.7, -1200, scale * 320, scale * 320, commonOptions),
		];

		// Создаем текстовые элементы для каждой фигуры
		shapes.forEach((shape, index) => {
			const text = TextSystem.getTextFromPool(moduleName, index);
			TextSystem.createTextElement(moduleName, textClassName, shape, text, textOverlay);
		});

		World.add(world, shapes);
	}

	const mouse = Mouse.create(render.canvas);
	const mouseConstraint = MouseConstraint.create(engine, {
		mouse,
		constraint: {
			stiffness: 0.2,
			render: { visible: false },
		},
	});
	World.add(world, mouseConstraint);
	render.mouse = mouse;

	setupWorld();

	// Запускаем обновление позиций текста
	TextSystem.startUpdateLoop(moduleName);

	let resizeTimeout;
	let prevWidth = window.innerWidth;
	window.addEventListener('resize', () => {
		const currentWidth = window.innerWidth;
		if (currentWidth !== prevWidth) {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(setupWorld, 200);
			prevWidth = currentWidth;
		}
	});

	mouse.element.removeEventListener('wheel', mouse.mousewheel);
	mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
	mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
} catch (err) {
	console.log('Ошибка в модуле shapes:', err);
}
