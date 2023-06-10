$(function() {

    mobile_menu_options()
    profile_popup_menu_option ()

});

let mobile_menu_open_listener

let profile_popup_menu_open_listener
let profile_popup_menu_close_listener

function mobile_menu_options() {

    mobile_menu_open_listener = function(){mobile_menu_open()}
    $('.mobile_navigation_menu_btn').on('click', mobile_menu_open_listener)
}

function mobile_menu_open() {

    console.log('Мобильное окно навигации открыто')
    $('.mobile_nav_menu').offset({left: -$('.mobile_nav_menu').width()})
    $('.mobile_nav_menu').show()
    $('.mobile_nav_menu').animate({'left': 0}, 300, 'swing')

    let close_mobile_nav_menu = $('<div class="mobile_close_nav_menu"></div>')
    close_mobile_nav_menu.prependTo($('body'))

    let nav_btns_container = $('.nav_btns_containers a div')
    let nav_btns_link = $('.nav_btns_containers a')
    $.each(nav_btns_container, function(ind, btn){

        let link = $('<a class="nav_link_mobile" href="'+nav_btns_link[ind].href+'"></a><br>')
        link.text($(btn).text())

        link.appendTo($('.mobile_nav_menu'))
    })

    login_form_options()

    $('.mobile_nav_menu a').removeClass('nav_link')

    let mobile_menu_close_listener = function(){mobile_menu_close(close_mobile_nav_menu)}
    close_mobile_nav_menu.on('click', mobile_menu_close_listener)
}

function mobile_menu_close(close_window) {

    $('.mobile_nav_menu').animate({'left': -$('.mobile_nav_menu').width()}, 300, 'swing', function(){

        $('.mobile_nav_menu').hide()
        $('.mobile_nav_menu').html('')

        close_window.remove()
    })
}

function profile_popup_menu_option () {
    
    let popup = $('.popup_profile_menu_mobile')
    let btn = $('.profile_btn_mobile')
    let sidebar = $('.mobile_sidebar')
    let popup_height = popup.height()

    profile_popup_menu_open_listener = function() {profile_popup_menu_open(popup, btn, sidebar, popup_height)}
    btn.off('click').on('click', profile_popup_menu_open_listener)
}

function profile_popup_menu_open (popup, btn, sidebar, popup_height) {
    
    popup.css({
            'width': btn.width(),
            'z-index': '4',
            'overflow': 'hidden',
            'height': '0'})
    
    popup.show()

    popup.offset({left: btn.offset().left, top: btn.position().top + sidebar.outerHeight() + $(window).scrollTop() + 15}) //(sidebar.outerHeight()+15) - $(window).scrollTop()})

    popup.appendTo('body')

    popup.animate({'height': popup_height}, 100, 'swing', function(){

        let close = $('<div class="close"></div>')
        close.css({
                'width': '100%',
                'height': '100%',
                'position': 'fixed',
                'top': '0',
                'left': '0',
                'z-index': '3'})

        close.appendTo('body')

        profile_popup_menu_close_listener =  function(){profile_popup_menu_close(popup, btn, close, popup_height)}
        close.on('click', profile_popup_menu_close_listener)
    })    
}

function profile_popup_menu_close (popup, btn, close, popup_height) {

    btn.off('click').on('click', profile_popup_menu_open_listener)
    close.off('click', profile_popup_menu_close_listener)

    popup.animate({'height': 0}, 100, 'swing', function (){
        popup.offset({left: 0, top: 0})
        popup.hide()
        popup.css('height', popup_height)

        close.remove()
    })
}