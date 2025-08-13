import { Fancybox } from '@fancyapps/ui';

// самая удобная настройка для галерей, скрывает все элементы управления, кроме закрывашки и листалок
function iniGallery(gallery) {
	Fancybox.bind(`[data-fancybox=${gallery}]`, {
		hideScrollbar: false,
		Toolbar: {
			display: {
				left: [],
				middle: [],
				right: ['close'],
			},
		},
	});
}
iniGallery('certificates');