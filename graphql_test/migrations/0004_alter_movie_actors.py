# Generated by Django 4.2.4 on 2023-09-23 21:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('graphql_test', '0003_actor_movie_delete_graphqlarticle'),
    ]

    operations = [
        migrations.AlterField(
            model_name='movie',
            name='actors',
            field=models.ManyToManyField(related_name='movies', to='graphql_test.actor'),
        ),
    ]
