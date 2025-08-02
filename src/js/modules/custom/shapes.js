import { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Composite } from "matter-js";

try {
	const container = document.querySelector(".shapes");

	const engine = Engine.create();
	const world = engine.world;

	const render = Render.create({
		element: container,
		engine: engine,
		options: {
			background: "transparent",
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

	const computedColor = getComputedStyle(document.documentElement).getPropertyValue("--shapes-color").trim();

	function setupWorld() {
		resizeCanvas();

		const width = canvas.width;
		const height = canvas.height;

		const viewport = window.innerWidth;

		const baseWidth = 1440;
		const scale = Math.min(1, viewport / baseWidth);

		Composite.allBodies(world).forEach((body) => {
			if (body !== mouseConstraint.body) {
				World.remove(world, body);
			}
		});

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
			Bodies.rectangle(width * 0.5, -1500, scale * 520, scale * 190, commonOptions), // <----- (спавн X, спавн Y, ширина, высота)
			// Квадрат
			Bodies.rectangle(width * 0.45, -800, scale * 300, scale * 300, commonOptions),
			// Большой круг
			Bodies.circle(width * 0.5, -750, scale * 190, commonOptions),
			// Маленьктй круг
			Bodies.circle(width * 0.2, -550, scale * 80, commonOptions),
			// Маленьктй круг
			Bodies.circle(width * 0.4, -550, scale * 80, commonOptions),
			// Маленький прямоугольник
			Bodies.rectangle(width * 0.7, -500, scale * 290, scale * 140, commonOptions),
		];

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

	let resizeTimeout;
	window.addEventListener("resize", () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(setupWorld, 200);
	});
} catch (err) {
	console.log("Ошибка в модуле shapes:", err);
}
