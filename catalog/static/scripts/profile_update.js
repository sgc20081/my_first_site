$(document).ready(function(){
    
    profile_update_data_send ()
    profile_photo_ajax_options()
    registration_data_send()

});

let file;
let file_circle;

function profile_update_data_send () {

    let form = $('.profile_update_form');
    let form_inputs = $('.'+form.attr('class')+' input')

    form.off('submit').on('submit', function(e){

        e.preventDefault();

        let form_data = new FormData()

        $.each(form_inputs, function(ind, input) {
            form_data.append(input.name, input.value)
            console.log(input.value)
        })

        form_data.append('profile_photo', file)
        form_data.append('profile_photo_circle', file_circle)
        
        $.ajax({
            type: "POST",
            url: '/catalog/profile-update/',
            data: form_data,
            processData: false,
            contentType: false,
            success: function(data){

                if (data.errors){
                    let server_response = $(data.form).find('.profile_update_form')
                    $('.profile_update_form').html(server_response.html())

                    profile_update_data_send()

                    $('#id_username').off('keydown').on('keydown', function(e){
                        $('#id_username').css({'border': '1px solid #572F8A', 'color': ''})
                        $('#id_username_error').remove()
                    })
                }
                else{
                    let timestamp = new Date().getTime()
                    $('.profile_photo_container img').attr('src', $('.profile_photo_container img').attr('src')+'?timestamp='+timestamp)
                    
                    window.location.href = '/catalog/profile'
                }
            }
        })
    })
}

function registration_data_send () {

    let form = $('.registration_form');
    let form_inputs = $('.'+form.attr('class')+' input')

    form.off('submit').on('submit', function(e){

        e.preventDefault();

        let form_data = new FormData()
        let values = new Array()

        $.each(form_inputs, function(ind, input) {
            form_data.append(input.name, input.value)
            console.log(input.value)
            
            values.push(input.value)
        })

        form_data.append('profile_photo', file)
        form_data.append('profile_photo_circle', file_circle)
        
        $.ajax({
            type: "POST",
            url: window.location.href,
            data: form_data,
            processData: false,
            contentType: false,
            success: function(data){

                console.log(data)

                if (data.errors){
                    let server_response = $(data.form).find('.registration_form')
                    $('.registration_form').html(server_response.html())

                    form = $('.registration_form');
                    form_inputs = $('.'+form.attr('class')+' input')

                    $.each(form_inputs, function(ind, input) {
                        input.value = values[ind]
                    })

                    registration_data_send()

                    $('#id_username').off('keydown').on('keydown', function(e){
                        $('#id_username').removeClass('input_error')
                        $('#id_username_error').remove()
                    })
                    $('#id_email').off('keydown').on('keydown', function(e){
                        $('#id_email').removeClass('input_error')
                        $('#id_email_error').remove()
                    })
                    $('#id_password1').off('keydown').on('keydown', function(e){
                        $('#id_password1').removeClass('input_error')
                        $('#id_password1_error').remove()
                    })
                }
                else{
                    let timestamp = new Date().getTime()
                    $('.profile_photo_container img').attr('src', $('.profile_photo_container img').attr('src')+'?timestamp='+timestamp)
                    
                    window.location.href = '/catalog/'
                }
            }
        })
    })
}

function profile_photo_ajax_options() {

    if (window.location.href.indexOf('/catalog/registration') != -1) {
        let croppie_object = new ImageCroppieCircle($('#id_profile_photo'), $('.profile_photo_in_profile_default'))

        $('#id_profile_photo').on('change', function(){

            $('.profile_photo_form_container img').attr('class', 'profile_photo_in_profile')
        })
    }
    else if (window.location.href.indexOf('/catalog/profile-update') != -1) {
        let croppie_object = new ImageCroppieCircle($('#id_profile_photo'), $('.profile_photo_in_profile'))
    }
}