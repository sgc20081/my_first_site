$(function() {

    login_form_options()
    $(document).ready(()=>{
        const hover_popup = new HoverPopup($('.profile_btn'), $('.popup_profile_menu'), $('.sideBarDesktop'), $('.content'));

    })
    
});

function login_form_options() {
    let login_btn = $('.login_link')
    login_btn.on('click', get_login_form)

    function get_login_form() {
        $.ajax({
            url: '/catalog/login?next='+window.location.href,
            method: 'get',
            dataType: 'json',
            success: function(data){

                let login_container = $(data.login_form)
                let login_popup = new PopupAJAXContent(login_container, $('body'), background_blur='Yes')
                
                login_popup.show_popup()

                login_ajax_options() // Запуск функции для ajax обработки post запросов форму авторизации. Находится в файле login.js
            }
        })
    }
}

class PopupAJAXContent {
    constructor(content, parent_container, background_blur='None') {
        this.content = content;
        this.parent_container = parent_container;
        this.background_blur = background_blur;

        this.popup_window = $('<div>').attr('class', 'popup').appendTo(this.parent_container);
        this.popup_window.addClass('popup_ajax_content')
        
        this.close_btn = $('<img>').attr('src', '/static/images/design/close_btn_icon.svg');
        this.close_btn.attr('class', 'popup_close_btn');

        this.show_popup = this.show_popup.bind(this);
        this.hide_popup = this.hide_popup.bind(this);
        
        this.popup_window.append(this.close_btn);
        this.popup_window_append()

        this.popup_window.offset({left: $(window).width()/2 - this.popup_window.outerWidth()/2,
                                top: $(window).height()/2 + $(window).scrollTop() - this.popup_window.outerHeight()/2});
                
        if (this.background_blur != 'None') {
            this.blur_elem = $('<div>').css({
                'backdrop-filter': 'blur(100px)',
                'opacity': '0.99',
                'color': 'black',
                'width': $(window).width(),
                'height': $('html').height(),
                'position': 'fixed',
                'top': '0',
                'left': '0',
                'display': 'none',
                'z-index': '1'}).appendTo(this.parent_container);

        this.blur_elem.attr('class', 'blur_background')
        }

        this.popup_window.hide()
    }

    popup_window_append() {
        this.popup_window.append(this.content)
    }

    show_popup(){
        console.log('Попап открылся')
        this.popup_window.show()
        this.close_btn.on('click', this.hide_popup)
        
        if (this.background_blur != 'None') {
        
            this.blur_elem.on('click', this.hide_popup)
            this.blur_elem.show()
        }
    }

    hide_popup(){
        console.log('Попап закрылся')
        this.popup_window.remove()
        
        if (this.background_blur != 'None') {
            
            this.blur_elem.remove()
        }

    }
    
    popup_position(){
        this.popup_window.offset({left: 0, top: 0})
        this.popup_window.offset({left: $(window).width()/2 - this.popup_window.outerWidth()/2,
                                top: $(window).height()/2 + $(window).scrollTop() - this.popup_window.outerHeight()/2});
    }
}

class PopupContent extends PopupAJAXContent {
    constructor(content, parent_container, background_blur) {
        super(content, parent_container, background_blur)

    }
    popup_window_append() {
        this.popup_window.append(this.content.html())
    }

    hide_popup(){
        console.log('Попап закрылся')
        this.popup_window.hide()
        
        if (this.background_blur != 'None') {
            
            this.blur_elem.hide()
        }

    }
}

class HoverPopup {
    constructor(trigger_elem, popup_elem, parent_container, content_container, background_blur='None') {
        this.trigger_elem = trigger_elem;
        this.popup_elem = popup_elem;
        this.parent_container = parent_container
        this.content_container = content_container

        this.trigger_elem.on('mouseleave', this.remove_hover_class.bind(this));
        this.popup_elem.on('mouseleave', this.remove_hover_class.bind(this));

        if (background_blur != 'None') {
            // Создаем элемент-фон и добавляем его на страницу
            this.blur_elem = $('<div>').css({
                            'backdrop-filter': 'blur(100px)',
                            'opacity': '0.99',
                            'color': 'black',
                            'width': $(window).width()+200,
                            'height': $(window).height(),
                            'position': 'fixed',
                            'top': '0',
                            'left': '0',
                            'display': 'none',}).appendTo(this.parent_container);
        }
        else{
            this.blur_elem = $('<div>')
        }
        
        // Связываем контекст выполнения методов с текущим экземпляром класса
        this.show_popup = this.show_popup.bind(this);
        this.hide_popup = this.hide_popup.bind(this);
    
        // Прикрепляем обработчики событий к элементам
        this.trigger_elem.on('mouseenter', this.show_popup);
        this.trigger_elem.on('mouseleave', this.hide_popup);
        this.popup_elem.on('mouseenter', this.show_popup);
        this.popup_elem.on('mouseleave', this.hide_popup);

        // Устанавливаем ширину и внутренние отступы попапа в соответствии с триггером
        this.popup_elem.width(this.trigger_elem.outerWidth());
    }

    popup_position() {

        const top = (this.trigger_elem.offset().top + this.trigger_elem.outerHeight() + 15) - $(window).scrollTop();
        const left = this.trigger_elem.offset().left;
        this.popup_elem.css({ top: top, left: left });
    }
  
    show_popup() {

        this.trigger_elem.addClass('hover');
        this.popup_elem.addClass('hover');

        this.blur_elem.width($(window).width());
        this.blur_elem.height($(window).height());
        this.blur_elem.show();

        // Устанавливаем ширину и внутренние отступы попапа в соответствии с триггером
        this.popup_elem.width(this.trigger_elem.outerWidth());

        this.popup_elem.css({'z-index': '2'});
        this.trigger_elem.css({'z-index': '2'});
        this.blur_elem.css({'z-index': '1'});
        this.content_container.css({'z-index': '-1'});

        this.popup_elem.show();
        this.popup_position()
    }
  
    hide_popup() {

        const self = this;
        setTimeout(function() {
            // Проверяем, что курсор не находится ни на кнопке, ни на всплывающем окне
            if (!self.trigger_elem.hasClass('hover') && !self.popup_elem.hasClass(':hover')) {
                self.blur_elem.hide();
                self.popup_elem.hide();
                self.popup_elem.css({'z-index': '0'})
                self.trigger_elem.css({'z-index': '0'})
                self.blur_elem.css({'z-index': '0'})
                self.content_container.css({'z-index': '0'})
            }
        }, 200); // Задержка перед скрытием всплывающего окна
    }

    remove_hover_class() {

        this.trigger_elem.removeClass('hover');
        this.popup_elem.removeClass('hover');
    }
}

class Ticker {
    constructor(selector, container, speed=0) {
        this.marquee = selector;
        this.container = container;

        this.css = window.getComputedStyle(this.marquee[0])

        this.get_original_css = function(){
            let self = this
            $.each(this.css, function(ind, val){
                self.marquee.css(self.css[ind], self.css[val])
            })
        }
        
        this.speed = speed
        this.marquee_width;
        this.animation_time;
    }

    animate() {
        
        this.marquee.wrapInner("<div>");

        this.marquee.css({ "overflow": "", "minWidth": "fit-content" })
        this.text_width = this.marquee.find("div").width();
        this.marquee.css({ "overflow": "hidden", "minWidth": "" })

        this.animation_time = (this.text_width / this.speed)*100;

        this.marquee.find("div").css({'width': '200%', "margin-left": "0%"});
        this.marquee.find("div").animate({ "margin-left": -this.text_width }, this.animation_time, 'linear', this.animate_repeat.bind(this));
    }

    animate_repeat() {
        this.marquee.find("div").css("margin-left", this.text_width);
        this.marquee.find("div").animate({ "margin-left": -this.text_width }, this.animation_time*2, 'linear', this.animate_repeat.bind(this));
    }
  
    start() {
        this.animate()
    }
  
    stop() {
        this.marquee.text(this.marquee.find("div").text())

        this.marquee.find("div").stop().css("margin-left", "0%");

        this.marquee.find('div').remove();

        this.get_original_css()
    }

    width_check() {
        this.marquee.css({ "overflow": "", "width": "fit-content" });
        this.marquee_width = this.marquee.width()

        if (this.marquee.width() < this.container.width()) {
            
            this.marquee.css({ "overflow": "hidden", "width": "" })
            return false
        }
        else{
            this.marquee.css({ "overflow": "hidden", "width": "100%" })
            return true
        }
    }
  
    init() {
        const self = this;

        if (this.width_check()) {

            this.marquee.on('mouseenter', function() {
                console.log('Ширина эелемента ',self.marquee.width(), ' ширина контейнера ', self.container.width())
                self.start();
            }).on('mouseleave', function() {
                self.stop();
            });
        }
    }
}

class TickerPermanent extends Ticker {
    constructor(selector, container, speed){
        super(selector, container, speed)
    }

    init() {
        if (super.width_check()) {
            console.log('Условие пройдено. Запускаю функцию анимации')
            super.start()
        }
        else{
            this.marquee.css({'marginLeft': 'auto','marginRight': 'auto'})
        }
    }
}

class ImageCroppieCircle {
    constructor(profile_photo_input, image) {

        this.profile_photo_input = profile_photo_input
        this.image = image
        this.profile_photo_cut_container
        this.profile_photo_cut_popup

        this.profile_photo_input.off('change').on('change', this.image_upload.bind(this))
    }

    image_upload() {
        
        file = this.profile_photo_input[0].files[0]

        let img_url = URL.createObjectURL(file)
        
        this.profile_photo_cut_container = $('<div class="profile_photo_cut_container">'
                        + '<div class="profile_photo_cut_editor">'
                        + '</div>'
                        + '</div>')
        this.profile_photo_cut_popup = new PopupAJAXContent(this.profile_photo_cut_container, $('body'), 'yes')
        this.profile_photo_cut_popup.show_popup()
        this.profile_photo_cut_popup.close_btn.remove()
        this.profile_photo_cut_popup.blur_elem.off('click')

        $('.profile_photo_cut_container').append('<div class="btn_save btn sidebar_btn">Save</div>')

        let basic

        if ($(window).width() < 1000) {
            basic = $('.profile_photo_cut_editor').croppie({
                viewport: {
                    width: 400,
                    height: 400,
                    type: 'circle',
                }
            });
        }
        else {
            basic = $('.profile_photo_cut_editor').croppie({
                viewport: {
                    width: 150,
                    height: 150,
                    type: 'circle',
                }
            });
        }
        
        basic.croppie('bind', {
            url: img_url,
            points: [77,469,280,739]
        });

        this.profile_photo_cut_popup.popup_window.height(
                    $('.cr-slider-wrap').height()
                    + $('.cr-boundary').height()
                    + $('.btn_save').height()
                    + 45)
        $('.btn_save').css('marginTop', $('.cr-slider-wrap').height()+25)

        this.profile_photo_cut_popup.popup_position()
        
        let self = this
        
        $('.btn_save').on('click', function() {
            basic.croppie('result', {
                type: 'blob',
                size: 'original'
            }).then(function(blob) {
                
                file_circle = new File([blob], 'cropped-image.png', {type: 'image/png'});
                let img_circle_url = URL.createObjectURL(file_circle)
                self.image.attr('src', img_circle_url)

                self.profile_photo_cut_popup.hide_popup()

                URL.revokeObjectURL(img_url)
                URL.revokeObjectURL(img_circle_url)
            });
        });
    }
}

class PopupSlide {
    constructor(popup, btn) {

        this.popup = popup;
        this.btn = btn;
        this.popup_height = this.popup.height()

        this.popup_position_left = position_left;
        this.popup_position_top = position_top;
    
        this.close = $('<div class="close"></div>');
        this.close.css({
            'width': '100%',
            'height': '100%',
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'z-index': '3'})

        this.btn.off('click').on('click', this.popup_menu_open.bind(this))
    }

    popup_menu_open () {

        this.popup.appendTo('body')
        this.popup.show()
        this.popup.css({
            'min-width': this.btn.width()+30,
            'z-index': '4',
            'position': 'absolute'})

        if (this.btn.offset().left + this.popup.outerWidth() > $(window).outerWidth()) {
        
            this.popup.offset({left: this.btn.offset().left - (this.popup.outerWidth() - this.btn.outerWidth())})
        }
        else {

            this.popup.offset({left: this.btn.offset().left})
        }
        this.popup.offset({top: this.btn.offset().top + this.btn.outerHeight()+15})   

        this.close.appendTo('body')
        this.close.on('click', this.popup_menu_close.bind(this))

    }
    
    popup_menu_close () {
    
        this.btn.off('click').on('click', this.popup_menu_open.bind(this))
        this.close.off('click', this.popup_menu_close.bind(this))
        this.popup.hide()
        this.close.remove()
    }
}

class PopupSlideAnimate {
    constructor(popup, btn, options=null) {

        this.popup = popup;
        this.btn = btn;
        this.popup_height = this.popup.outerHeight();

        if (options != null) {

            this.sliding_side = options.sliding_side !== undefined ? options.sliding_side : null;
            this.animation_time = options.animation_time !== undefined ? options.animation_time : 100;
        }

        this.animate_open_flag;
        this.animate_close_flag;
    
        this.close = $('<div class="close"></div>');

        this.btn.off('click').on('click', this.popup_menu_open.bind(this))
    }

    popup_menu_open () {

        this.popup.appendTo('body')
        this.popup.show()

        this.popup.css({
            'min-width': this.btn.width(),
            'width': 'fit-content',
            'z-index': '4',
            'overflow': 'hidden',
            'height': '0',
            'position': 'absolute'})

        if ((this.btn.offset().left + this.popup.outerWidth()) > $(window).outerWidth() || this.sliding_side == 'left') {
            // Меню выпадает влево
            this.popup.offset({left: this.btn.offset().left - (this.popup.outerWidth() - this.btn.outerWidth())})
        }
        else if ((this.btn.offset().left + this.popup.outerWidth()) > $(window).outerWidth() || this.sliding_side == 'right') {
            // Меню выпадает вправо
            this.popup.offset({left: this.btn.offset().left})
        }
        this.popup.offset({top: this.btn.offset().top + this.btn.outerHeight()+15})

        this.animate_open_flag = false
        this.animate_open()
        
        let self = this
        function start_animate() {

            if (self.animate_open_flag) {

                self.close.css({
                        'width': '100%',
                        'height': '100%',
                        'position': 'fixed',
                        'top': '0',
                        'left': '0',
                        'z-index': '3'})

                self.close.appendTo('body')
                self.close.on('click', self.popup_menu_close.bind(self))

                let links = self.popup.children('*')

                $.each(links, function(ind, link){
                    $(link).on('click', self.popup_menu_close.bind(self))
                })
            }
            else {
                setTimeout(start_animate, self.animation_time+10)
            }
        }
        start_animate()     
    }

    animate_open() {

        let self = this
        this.popup.animate({'height': this.popup_height}, this.animation_time, 'swing', ()=>{

            self.animate_open_flag = true
        })
    }

    animate_close() {

        let self = this
        this.popup.animate({'height': 0}, this.animation_time, 'swing', function (){
            
            self.animate_close_flag = true
        })
    }

    popup_menu_close () {
    
        this.btn.off('click').on('click', this.popup_menu_open.bind(this))
        this.close.off('click', this.popup_menu_close.bind(this))
        
        this.animate_close_flag = false
        this.animate_close()
        
        let self = this
        function start_animate() {

            if (self.animate_close_flag) {

                self.popup.offset({left: 0, top: 0})
                self.popup.hide()
                self.popup.css('height', self.popup_height)
        
                self.close.remove()
            }
            else {
                setTimeout(start_animate, self.animation_time+10)
            }
        }
        start_animate()     
    }
}

class TapEvent {
    constructor(element, tap_duration=250, functions) {
        this.element = element;
        this.longTapDuration = tap_duration;

        this.tap_event = functions.tap_event !== undefined ? functions.tap_event : null;
        this.tap_hold_event = functions.tap_hold_event !== undefined ? functions.tap_hold_event : null;

        this.element.css('user-select', 'none')

        this.touchStartTimestamp;

        this.element.off('contextmenu').on('contextmenu', function(event) {
            event.preventDefault();
            event.stopPropagation();
        });

        this.element.off("touchstart").on("touchstart", this.onTouchStart.bind(this));
        this.element.off("touchend").on("touchend", this.onTouchEnd.bind(this));
    }

    onTouchStart() {
        this.touchStartTimestamp = Date.now();
    }

    onTouchEnd() {
        let touchEndTimestamp = Date.now();
        let touchDuration = touchEndTimestamp - this.touchStartTimestamp;
    
        if (touchDuration < this.longTapDuration) {
            
            // Событие "tap"
            if (this.tap_event == null) {
                console.error('Функция для выполнения, после короткого тапа не обнаружена')
                return
            }
            this.tap_event()
        } 
        else {
            
            // Событие "long tap"
            if (this.tap_hold_event == null) {
                console.error('Функция для выполнения, после длинного тапа не обнаружена')
                return
            }
            this.tap_hold_event()
        }
    }
}

class HTMLElements {
    constructor(){
        this.loading = $('<div class="loading_animation"><p>...Загрузка...</p></div>')

        this.loading.css({'text-align': 'center'})
    }
}