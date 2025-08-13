import getElementOrThrow from '../utils/getElementOrThrow.js';
import { Engine, Runner, World, Bodies, Mouse, MouseConstraint, Composite } from 'matter-js';
import Two from 'two.js';

class PhysicsShapesSystem {
	constructor() {
		this.modules = new Map();
		this.textPools = {
			main: ['Юридические услуги', 'Адвокатское бюро', 'Бухгалтерия и аудит'],
			accounting: ['Налоговый учет', 'Полное ведение бухгалтерии', 'Внутренний аудит'],
			lawyers: ['Сопровождение в органах', 'Представление интересов в суде', 'Адвокат на допросе или обыске'],
		};
	}

	createModule(moduleName, container, shapeType = 'mixed') {
		if (this.modules.has(moduleName)) {
			this.destroyModule(moduleName);
		}

		const two = new Two({
			type: Two.Types.canvas,
			width: container.clientWidth,
			height: container.clientHeight,
			autostart: false,
		}).appendTo(container);

		const canvas = two.renderer.domElement;
		canvas.style.maxWidth = '100%';
		canvas.style.maxHeight = '100%';
		canvas.style.padding = '32px';
		canvas.style.paddingTop = '0';

		const engine = Engine.create();
		engine.enableSleeping = true;
		engine.gravity.scale = 0.001;
		engine.gravity.y = 1;
		engine.positionIterations = 12;
		engine.velocityIterations = 10;

		const world = engine.world;

		const mouse = Mouse.create(canvas);
		mouse.pixelRatio = window.devicePixelRatio || 1;

		const mouseConstraint = MouseConstraint.create(engine, {
			mouse,
			constraint: {
				stiffness: 0.2,
				render: { visible: false },
			},
		});
		World.add(world, mouseConstraint);

		mouse.element.removeEventListener('wheel', mouse.mousewheel);
		mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
		mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);

		const module = {
			moduleName,
			container,
			two,
			canvas,
			engine,
			world,
			mouse,
			mouseConstraint,
			shapes: [],
			twoObjects: [],
			shapeType,
			resizeTimeout: null,
			prevWidth: window.innerWidth,
			animationId: null,
		};

		this.modules.set(moduleName, module);
		this.setupWorld(moduleName);
		this.startUpdateLoop(moduleName);
		this.setupResizeHandler(moduleName);

		return module;
	}

	getShapeColor() {
		return getComputedStyle(document.documentElement).getPropertyValue('--shapes-color').trim();
	}

	// Создание текста по окружности
	createCurvedText(two, text, centerX, centerY, radius, fontSize = 16) {
		const group = two.makeGroup();
		const chars = text.split('');
		const totalAngle = Math.min(Math.PI * 1.4, (chars.length * fontSize * 0.6) / radius);
		const startAngle = -totalAngle / 2;

		chars.forEach((char, i) => {
			if (chars.length === 1) {
				const textElement = two.makeText(char, centerX, centerY, {
					family: 'Arial, sans-serif',
					size: fontSize,
					fill: '#ffffff',
					alignment: 'center',
					baseline: 'middle',
				});
				group.add(textElement);
			} else {
				const angle = startAngle + (i / (chars.length - 1)) * totalAngle;
				const x = centerX + Math.cos(angle - Math.PI / 2) * (radius - fontSize / 2);
				const y = centerY + Math.sin(angle - Math.PI / 2) * (radius - fontSize / 2);

				const textElement = two.makeText(char, x, y, {
					family: 'Arial, sans-serif',
					size: fontSize,
					fill: '#ffffff',
					alignment: 'center',
					baseline: 'middle',
				});

				textElement.rotation = angle;
				group.add(textElement);
			}
		});

		return group;
	}

	// Создание прямого текста
	createStraightText(two, text, centerX, centerY, width, height) {
		const fontSize = Math.min((width / text.length) * 1.2, height * 0.3, 18);

		const textElement = two.makeText(text, centerX, centerY, {
			family: 'Arial, sans-serif',
			size: fontSize,
			fill: '#ffffff',
			alignment: 'center',
			baseline: 'middle',
		});

		return textElement;
	}

	// Настройка физического мира
	setupWorld(moduleName) {
		const module = this.modules.get(moduleName);
		if (!module) return;

		const { container, two, world, mouseConstraint, canvas } = module;

		const containerRect = container.getBoundingClientRect();
		const width = containerRect.width;
		const height = containerRect.height;

		two.width = width;
		two.height = height;
		two.renderer.setSize(width, height);

		canvas.width = width * (window.devicePixelRatio || 1);
		canvas.height = height * (window.devicePixelRatio || 1);
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';

		Composite.allBodies(world).forEach((body) => {
			if (body !== mouseConstraint.body) {
				World.remove(world, body);
			}
		});

		module.twoObjects.forEach((obj) => two.remove(obj));
		module.twoObjects = [];
		module.shapes = [];

		const wallThickness = 50;
		const wallOptions = {
			isStatic: true,
			render: { visible: false },
		};

		const walls = [
			// Пол
			Bodies.rectangle(width / 2, height + wallThickness / 2, width + wallThickness * 2, wallThickness, wallOptions),
			// Левая стена
			Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, wallOptions),
			// Правая стена
			Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, wallOptions),
		];
		World.add(world, walls);

		const scale = this.getScale();
		const color = this.getShapeColor();

		const commonOptions = {
			restitution: 0, // <----- Экспериментально отключены любые отскоки для оптимизации
			friction: 0,
			frictionAir: 0.03,
			density: 0.001,
			sleepThreshold: 60,
		};

		this.createShapesForModule(module, width, height, scale, color, commonOptions);
	}

	// Получение масштаба
	getScale() {
		const baseWidth = 1440;
		const viewport = window.innerWidth;

		if (window.innerWidth > 768) {
			return Math.min(1, viewport / baseWidth);
		} else {
			return 0.55;
		}
	}

	// Создание фигур для конкретного модуля
	createShapesForModule(module, width, height, scale, color, commonOptions) {
		const { moduleName, two, world } = module;

		let shapesConfig = [];

		switch (moduleName) {
			case 'main':
				shapesConfig = [
					{ type: 'rectangle', x: width * 0.5, y: -1500, w: scale * 520, h: scale * 190 },
					{ type: 'rectangle', x: width * 0.45, y: -800, w: scale * 300, h: scale * 300 },
					{ type: 'circle', x: width * 0.7, y: -750, r: scale * 190 },
					{ type: 'circle', x: width * 0.2, y: -550, r: scale * 80 },
					{ type: 'circle', x: width * 0.4, y: -550, r: scale * 80 },
					{ type: 'rectangle', x: width * 0.7, y: -500, w: scale * 290, h: scale * 140 },
				];
				break;
			case 'accounting':
				const groups = [
					{ count: 2, radius: scale * 180 },
					{ count: 3, radius: scale * 90 },
					{ count: 1, radius: scale * 180 },
					{ count: 4, radius: scale * 70 },
				];

				let circleIndex = 0;
				shapesConfig = groups.flatMap((group) =>
					Array.from({ length: group.count }, () => ({
						type: 'circle',
						x: width * 0.75,
						y: -600 - circleIndex++ * 100,
						r: group.radius,
					}))
				);
				break;
			case 'lawyers':
				shapesConfig = [
					{ type: 'rectangle', x: width * 0.2, y: -800, w: scale * 320, h: scale * 320 },
					{ type: 'rectangle', x: width * 0.3, y: -1200, w: scale * 150, h: scale * 150 },
					{ type: 'rectangle', x: width * 0.4, y: -1200, w: scale * 290, h: scale * 620 },
					{ type: 'rectangle', x: width * 0.75, y: -900, w: scale * 420, h: scale * 150 },
					{ type: 'rectangle', x: width * 0.75, y: -700, w: scale * 620, h: scale * 290 },
					{ type: 'rectangle', x: width * 0.7, y: -1200, w: scale * 320, h: scale * 320 },
				];
				break;
		}

		shapesConfig.forEach((config, index) => {
			let physicsBody, twoObject;
			const text = this.getTextFromPool(moduleName, index);

			if (config.type === 'circle') {
				physicsBody = Bodies.circle(config.x, config.y, config.r, commonOptions);

				const circle = two.makeCircle(0, 0, config.r);
				circle.fill = color;
				circle.noStroke();

				const textGroup = this.createCurvedText(two, text, 0, 0, config.r * 0.7, Math.min(16, config.r * 0.15));

				twoObject = two.makeGroup(circle, textGroup);
			} else if (config.type === 'rectangle') {
				physicsBody = Bodies.rectangle(config.x, config.y, config.w, config.h, commonOptions);

				const rectangle = two.makeRectangle(0, 0, config.w, config.h);
				rectangle.fill = color;
				rectangle.noStroke();

				const textElement = this.createStraightText(two, text, 0, 0, config.w, config.h);

				twoObject = two.makeGroup(rectangle, textElement);
			}

			twoObject.position.set(config.x, config.y);

			physicsBody.twoObject = twoObject;
			twoObject.physicsBody = physicsBody;

			module.shapes.push(physicsBody);
			module.twoObjects.push(twoObject);
		});

		World.add(world, module.shapes);
	}

	// Получение текста из пула
	getTextFromPool(moduleName, index) {
		const pool = this.textPools[moduleName];
		return pool[index % pool.length];
	}

	// Цикл обновления
	startUpdateLoop(moduleName) {
		const module = this.modules.get(moduleName);
		if (!module) return;

		let lastTime = performance.now();

		const updateLoop = (time) => {
			const delta = time - lastTime;
			lastTime = time;

			Engine.update(module.engine, delta);

			module.shapes.forEach((body) => {
				const twoObject = body.twoObject;
				if (twoObject) {
					twoObject.position.set(body.position.x, body.position.y);
					twoObject.rotation = body.angle;
				}
			});

			module.two.update();

			module.animationId = requestAnimationFrame(updateLoop);
		};

		module.animationId = requestAnimationFrame(updateLoop);
	}

	// Остановка цикла обновления
	stopUpdateLoop(moduleName) {
		const module = this.modules.get(moduleName);
		if (!module) return;

		if (module.animationId) {
			cancelAnimationFrame(module.animationId);
			module.animationId = null;
		}
	}

	// Обработчик изменения размера
	setupResizeHandler(moduleName) {
		const module = this.modules.get(moduleName);
		if (!module) return;

		const handleResize = () => {
			const currentWidth = window.innerWidth;
			if (currentWidth !== module.prevWidth) {
				clearTimeout(module.resizeTimeout);
				module.resizeTimeout = setTimeout(() => {
					this.setupWorld(moduleName);
				}, 200);
				module.prevWidth = currentWidth;
			}
		};

		window.addEventListener('resize', handleResize);
	}

	// Уничтожение модуля
	destroyModule(moduleName) {
		const module = this.modules.get(moduleName);
		if (!module) return;

		this.stopUpdateLoop(moduleName);
		Engine.clear(module.engine);
		module.two.clear();
		module.canvas.remove();

		clearTimeout(module.resizeTimeout);
		this.modules.delete(moduleName);
	}

	init() {
		try {
			const mainContainer = getElementOrThrow('.js_different-geometric-shapes');
			this.createModule('main', mainContainer, 'mixed');
		} catch (err) {
			console.log('Ошибка в модуле main shapes:', err);
		}

		try {
			const accountingContainer = getElementOrThrow('.js_circles-shapes');
			this.createModule('accounting', accountingContainer, 'circles');
		} catch (err) {
			console.log('Ошибка в модуле accounting shapes:', err);
		}

		try {
			const lawyersContainer = getElementOrThrow('.js_rectangles-shapes');
			this.createModule('lawyers', lawyersContainer, 'rectangles');
		} catch (err) {
			console.log('Ошибка в модуле lawyers shapes:', err);
		}
		window.addEventListener('load', () => {
			this.modules.forEach((_, moduleName) => {
				this.setupWorld(moduleName);
			});
		});
	}
}

const shapesSystem = new PhysicsShapesSystem();
shapesSystem.init();

export default shapesSystem;
