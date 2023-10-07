$(function () { 

    let test = new GraphQLQuery({
        form: document.querySelector('.movie_graphql_form'),
        model: 'movie',
        output_fields: ['id', 'title', 'year'],
        many_to_many_fields: {'actors': ['name', 'id']},
        titles_fields: {'id': 'ID',
                        'title': 'Название фильма',
                        'year': 'Год выпуска',
                        'name': 'Имя актёра',},
        success: function(data){
            $('.response_field').html(data)
        },
        errors: function(errors){
            
        }
    })
})

class GraphQLQuery {
    constructor(properties) {

        if (properties.form !== undefined) {
            this.form = $(properties.form);
        } else {
            throw new Error(`GraphQLQuery must be created based on an HTML form.`);
        }

        if (Array.isArray(properties.output_fields)) {
            this.output_fields = properties.output_fields;
        } else {
            throw new Error('GraphQLQuery must be specified, a list of model fields will be queried from the database.');
        }

        if (typeof(properties.titles_fields) == "object" && !Array.isArray(properties.titles_fields)) {
            this.titles_fields = properties.titles_fields;
        } else {
            throw new Error(`GraphQLQuery. Custom field names must be in the form of a list.\n\n
                            For example:
                            \{\'model_field_name\': \'alternative_name\'\}`)
        }

        if ((typeof(properties.many_to_many_fields) == "object" && !Array.isArray(properties.many_to_many_fields)) || properties.many_to_many_fields === undefined) {
            this.many_to_many_fields = properties.many_to_many_fields
        } else {
            throw new Error(`GraphQLQuery. If you need to obtain a Many To Many dependency, you need to specify the fields in the dictionary. 
                            For example: 
                            \'many_to_many_fields\': {\'related_model_1_name\': [\'field_1\', \'field_2\', ...etc],
                                                    \'related_model_2_name\': [\'field_1\', \'field_2\', ...etc],
                                                    ...etc}`)
        }
       
        if (typeof(properties.success) === 'function') {
            this.success = properties.success;
        } else if(properties.success === undefined) {
            throw new Error('GraphQLQuery. You must use the \'success\' method, when instantiating the class, to interact with the response from the server')
        } else {
            throw new Error('GraphQLQuery. You must specify the function to be executed after receiving the response from the server. \n\n\'success\' method')
        }

        if (typeof(properties.errors) === 'function' || properties.errors === undefined) {
            this.errors = properties.errors
        } else {
            throw new Error('GraphQLQuery. To handle server response errors you must specify a function. \n\n\'errors\' method')
        }

        this.csrf_token = '';
        
        this.query_dict = {};
        this.query_dict['model'] = properties.model;

        this.query_data = '';
        this.query_body = '';

        this.get_input_fields();
        this.get_output_fields();
    }

    get_input_fields() {

        let self = this;

        this.form.on('submit', (e)=>{

            e.preventDefault();

            $.each(this.form.find('input'), function(ind, input){
                if (input.value != '' && input.name != 'csrfmiddlewaretoken'){

                    if (self.query_data == '') {
                        self.query_data += `(${input.name}: "${input.value}"`;
                    }
                    else {
                        self.query_data += `, ${input.name}: "${input.value}"`;
                    }
                }
                else if (input.name == 'csrfmiddlewaretoken') {
                    self.csrf_token = input.value;
                }
            })
            this.query_data += ')';

            this.get_query_body();
        })
    }

    get_output_fields(){

        let self = this
        let output_fields_data = '';

        $.each(self.output_fields, function(ind,val){
            if (ind != self.output_fields.length-1){
                output_fields_data += `${val}\n\t\t`
            }
            else {
                output_fields_data += val
            }
        })

        if (!this.many_to_many_fields !== undefined){
            $.each(self.many_to_many_fields, function(many_to_many_model, fields){
                
                output_fields_data += `\n\t\t${many_to_many_model} {\n\t\t\t`;
                
                try {
                    if (Array.isArray(fields)){
                        $.each(fields, function(ind, field){
                            if (fields.length-1 != ind) {
                                output_fields_data += `${field}\n\t\t\t`;
                            }
                            else {
                                output_fields_data += `${field}\n\t\t`;
                            }
                        })
                    } else {
                        throw new Error(`GraphQLQuery. Related model's fields must be in list\n\n\'many_to_many_fields\' property`)
                    }
                } catch (error) {
                    console.error(error.message);
                }
                    
                output_fields_data += '}';
            })
        }
        this.output_fields = output_fields_data;
    }

    get_query_body() {
        this.query_body = `query get${this.query_dict['model']} {\n\t`
                    +`${this.query_dict['model']} ${this.query_data} {\n\t\t`
                    +`${this.output_fields}\n\t`
                    +`}\n`
                    +`}`;
        
        this.query_data = '';

        this.send_query();
    }

    send_query(){

        let self = this;
        let graphql_query = {query: this.query_body};

        //console.log('Тело запроса:\n', this.query_body)

        $.ajax({
            url: '/graphql/',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-CSRFToken": self.csrf_token,
            },
            data: JSON.stringify(graphql_query),
            success: function(response) {

                if ('errors' in response) {
                    self.errors(response);

                    console.warn('GraphQL errors: ', response.errors);
                }

                let output = '';

                function get_output_data(object) {
                    $.each(object, function(field_title, field){
                        if (typeof(field) != 'object') {
                            if (field_title in self.titles_fields) {
                                field_title = self.titles_fields[field_title];
                            }
                            output += `<p>${field_title}: ${field}</p>`;  
                        }
                        else {
                            get_output_data(field);
                        }
                    })
                }
    
                get_output_data(response.data);

                self.success(output);
            },
            error: function(errors){
                self.errors(errors);
                console.warn('Bad request: ', errors);
                console.warn('GraphQL errors: ', errors.responseJSON.errors);
            }
        })
    }
}