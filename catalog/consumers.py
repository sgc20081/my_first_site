import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync, sync_to_async
from .models import Chat, ChatRoom, CustomUser
from django.core import serializers


class ChatConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def save_chat (self, message, author, publish_time, chat_room):
        return Chat.objects.create(
            message=message, 
            author=self.scope['user'], 
            publish_time=publish_time, 
            chat_room=ChatRoom.objects.get(chat_room=self.room_name)
        )

    async def connect(self):
        # Запись в переменную room_name имени комнаты из урла
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data) # где text_data - параметр, получаемый из кода js под WebSocket.send(тут эти данные)
        message = text_data_json['message']
        author = text_data_json['author']
        author_photo = text_data_json['authorPhoto']
        publish_time = text_data_json['publishTime']
        save_msg = await self.save_chat(message, author, publish_time, self.room_name)
        id = save_msg.id

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat.message',
                'message': message,
                'author': author,
                'authorPhoto': author_photo,
                'publishTime': publish_time,
                'id': id,
            }
        )

    @database_sync_to_async
    def get_chat(self):
        room = self.room_name
        return ChatRoom.objects.get(chat_room=room)

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        author = event['author']
        author_photo = event['authorPhoto'] 
        publish_time = event['publishTime']
        id = event['id']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'author': author,
            'authorPhoto': author_photo,
            'pbulishTime': publish_time,
            'id': id
        }))
# Пустой список онлайн пользователей, который в дальнейшем будет изменятся
# при потключении или отключении новых пользователей

online_users_list = {}

class OnlineConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def get_user_object(self):
        user_object = CustomUser.objects.filter(pk=self.scope['user'].id)
        return serializers.serialize("json", user_object, 
                                     fields=('username', 'profile_photo_circle', 'first_name', 'last_name'))

    # Метод используется для установки соединения
    async def connect(self):
        print('Server websocket connect')
        # Получаем информацию об объекте User из массива данных
        # self.scope, который в свою очередь содержит информацию о
        # текущем подключении, например url, с которого происходит 
        # соединение. Подробнее см. в документации
        self.user = await self.get_user_object()
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name +'_online'
        
        if self.room_name in online_users_list:
            if not self.user in online_users_list[self.room_name]:
                online_users_list[self.room_name].append(self.user)
        else:
            online_users_list[self.room_name] = []
            online_users_list[self.room_name].append(self.user)

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        return await super().connect()
    
    # Данный метод необходим для принятия входящего соединения
    async def accept(self, subprotocol=None):
        print('Connect has been accepted')
        
        return (await super().accept(subprotocol),
                # После авторизации входящего соединения, вызываются
                # методы отправки данных в группу и в WebSocket 
                await self.send(),
                await self.receive(self.text_data)
                )
                
    # Данный метод необходим для получения сообщения от клиента (группы)
    # и отправки этого сообщения в WebSocket
    async def send(self, text_data=None, bytes_data=None, close=False):

        # Упаковка имеющегося массива пользователей установивших соединение 
        # в формат JSON (метод "receive" не принимает в качестве переменной
        # text_data массивы)
        # здесь self.text_data использует self для того, чтобы переменная
        # text_data была доступна в других методах
        self.text_data=json.dumps({'online_users_list': online_users_list[self.room_name]})

        return (await super().send(self.text_data, bytes_data, close),
                print('Message to client form "send" method'))
        
    # Данный метод получает сообщение от WebSocket и отправляет его в группу
    async def receive(self, text_data):
        
        # Тело отправляемого в группу сообщения
        # Здесь под type содержиться "send", так называется
        # функция-метод (которая идёт далее), и которая отправляет сообщение
        # в WebSocket (функция получения - это receive)
    
        new_message = {'type': 'send',
                'text': self.text_data}
        # Отправляет сообщение в группу и всем пользователям, которые в ней состоят
        await self.channel_layer.group_send(
            self.room_group_name,
            new_message
        )

        return (print('Message to client form "send" method'))

    # Данный метод вызывается при разрыве соединения пользователя с
    # WebSocket        
    async def disconnect(self, close_code):

        print(str(self.user) + ' is disconnected')
        # Отключившийся пользователь удаляется из общего списка
        # пользователей онлайн
        online_users_list[self.room_name].remove(self.user)
        
        if not online_users_list[self.room_name]:
            online_users_list.pop(self.room_name)
            print("Room deleted from online users list")
        elif online_users_list[self.room_name]:
            # Здесь методы отправки вызываются, чтобы у всех пользователей
            # группе обновилась информация о текущем списке пользователей онлайн 
            await self.send()
            await self.receive(self.text_data)

        # Закрытие соединения пользователя с группой
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

# На данный момент оказался не востребованным
"""
class ChatNotifications(AsyncWebsocketConsumer):
    
    @database_sync_to_async
    def notifications(self, *args, **kwargs):
        user = self.scope['user']
        chats = ChatRoomUsers.objects.filter(user=user)
        data = []
        for chat in chats:
            chat_room = chat.chat_room
            #print(chat_room)
            if Chat.objects.filter(chat_room=chat_room).exists():
                chat_msgs = Chat.objects.filter(chat_room=chat_room)
                #print(chat_msgs)
            unread_msgs = []
            for msg in chat_msgs:
                if not ChatMsgUserRead.objects.filter(message=msg, user=user).exists():
                    unread_msgs.append(msg)
            if unread_msgs != []:
                print('У', user, len(unread_msgs), 'непрочитанных сообщений в чате', chat.chat_room.chat_room)
                unread_msgs_count = len(unread_msgs)
                #chat = Chat.objects.filter(pk=chat.chat_room_id)
                chat_to_data = serializers.serialize('json', ChatRoom.objects.filter(pk=chat.chat_room.id))
                data.append({'chat_room': chat_to_data, 'unread_msgs_count': unread_msgs_count})
            else:
                print('У', user, 'нет непрочитанных сообщений в чате:', chat.chat_room.chat_room)
        if data != []:
            print (data)
            return data
        else:
            return None

    # Метод используется для установки соединения
    async def connect(self):
        print('Notifications websocket connect')
        # Получаем информацию об объекте User из массива данных
        # self.scope, который в свою очередь содержит информацию о
        # текущем подключении, например url, с которого происходит 
        # соединение. Подробнее см. в документации
        self.room_group_name = 'chat_notifications'

        await self.accept()
    
    async def receive(self, text_data):
        
        # Тело отправляемого в группу сообщения
        # Здесь под type содержиться "send", так называется
        # функция-метод (которая идёт далее), и которая отправляет сообщение
        # в WebSocket (функция получения - это receive)
        text_data = json.loads(text_data)
        print('Notification получил данные', text_data)
        if not 'chat/'+text_data['room_name']+'/' in text_data['url']:
            chats_unread_msgs = await self.notifications()
            if chats_unread_msgs != None:
                await self.send(text_data=json.dumps({
                    'chats_unread_msgs': chats_unread_msgs
                }))
    
    async def notification_send(self, event):
        print('фунция notification_send запущена')
        print(event)
        #print(args)
        #print(kwargs)
"""
