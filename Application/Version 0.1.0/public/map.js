function init(){
    let map = new ymaps.Map('ya-map', {
        center: [59.985444887334296,30.30097846294469],
        zoom: 14
    })

    var placemark = new ymaps.Placemark(map.getCenter(), {
        balloonContentBody: [
            '<address>',
            '<strong>Офис Яндекса в Москве</strong>',
            '<br/>',
            'Адрес: 119021, Москва, ул. Льва Толстого, 16',
            '<br/>',
            'Подробнее: <a href="https://company.yandex.ru/">https://company.yandex.ru</a>',
            '</address>'
        ].join('')
    }, {
        preset: 'islands#redDotIcon'
    });

    map.geoObjects.add(placemark);
    //map.controls.remove('geolocationControl'); // удаляем геолокацию
    //map.controls.remove('searchControl'); // удаляем поиск
    //map.controls.remove('trafficControl'); // удаляем контроль трафика
    //map.controls.remove('typeSelector'); // удаляем тип
    //map.controls.remove('fullscreenControl'); // удаляем кнопку перехода в полноэкранный режим
    //map.controls.remove('zoomControl'); // удаляем контрол зуммирования
    //map.controls.remove('rulerControl'); // удаляем контрол правил
}

ymaps.ready(init)