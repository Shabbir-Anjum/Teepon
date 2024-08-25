from sqlalchemy import select, \
                       update, \
                       delete
from datetime import datetime
from flask import jsonify

from extensions import Session
from models import User, \
                   Outing, \
                   FriendList, \
                   Message, \
                   Messages, \
                   AiMessage, \
                   AiMessages

class MySQLHandler:
    def __init__(self, session):
        self.session = session

    def add_user(self, email, display_name, access_token, user_url):
        existing_user = (self.session.
                         execute(
                            select(User).
                            where(User.email == email)
                         ).
                         scalars().first())
        if existing_user:
            return jsonify({'error': 'User already exists'}), 403

        new_user = User(
            email=email,
            display_name=display_name,
            access_token=access_token,
            user_url=user_url
        )
        try:
            self.session.add(new_user)
            self.session.commit()
            return jsonify({"user":self.get_user(email).to_dict()}), 201
        except Exception as e:
            return jsonify({'error': 'System error'}), 500

    def get_user(self, email):
        try:
            user = (self.session.
                    execute(
                        select(User).
                        where(User.email == email)
                    ).
                    scalars().first())
            return user
        except Exception as e:
            return {'error': 'User does not exist'}, 403

    def update_user(self, email, update_data):
        user = self.get_user(email)
        if user:
            try:
                if update_data:
                    updated_user = update(User).where(User.email == email).values(**update_data)
                    self.session.execute(updated_user)
                    self.session.commit()
                return jsonify({"user":self.get_user(email).to_dict()}), 200

            except Exception as e:
                self.session.rollback()
                return jsonify({'error': str(e)}), 500
        return jsonify({'error': 'User does not exist'}), 403

    def delete_user_data(self, user_id):
        # Here you can add logic to delete related data if necessary
        pass  # Implement deletion logic for related tables if needed

    def delete_user(self, email):
        user = self.get_user(email)
        if user and user.active:
            try:
                self.delete_user_data(user.id)
                user.active = False
                self.session.commit()
                self.session.commit()
                return True
            except Exception as e:
                print(f"Error deleting user: {e}")
                self.session.rollback()
                return False
        return False

    def insert_outing(self, outing):
        self.session.add(outing)
        self.session.commit()

    def find_existing_outing(self, name, creator_id):
        return self.session.execute(
            select(Outing).where(Outing.name == name, Outing.creator_id == creator_id)).scalars().first()

    def insert_friend_list_entry(self, friend_list):
        self.session.add(friend_list)
        self.session.commit()
    def get_friend_outings(self, update_data):
        try:
            email = update_data['email']
            user = self.get_user(email)
            if not user:
                return jsonify({'error': 'User does not exist'}), 403

            friend_outings = self.session.execute(
                select(FriendList).where(FriendList.user_id == user.id)
            ).scalars().all()

            outing_ids = [friend_outing.outing_id for friend_outing in friend_outings]

            if outing_ids:
                outings_list = self.session.execute(
                    select(Outing).where(Outing.id.in_(outing_ids))
                ).scalars().all()
                outings = [{"id":outing.id, "name": outing.name} for outing in outings_list]
            else:
                outings = []

            return jsonify({"outings": outings}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def get_outing(self, outing_id):
        outing = self.session.execute(
            select(Outing).where(Outing.id == outing_id)
        ).scalars().one_or_none()

        if outing:
            try:
                messages = self.session.execute(
                    select(Message).join(Messages).where(Messages.outing_id == outing.id)
                ).scalars().all()

                ai_messages = self.session.execute(
                    select(AiMessage).join(AiMessages).where(AiMessages.outing_id == outing.id)
                ).scalars().all()

                creator = self.session.execute(
                    select(User).where(User.id == outing.creator_id)
                ).scalars().one_or_none()

                return jsonify({"outing": {
                    "name": outing.name,
                    "latest_location": outing.latest_location,
                    "outing_topic": outing.outing_topic,
                    "messages": [
                        {
                            "send_from": message.send_from,
                            "content": message.content,
                            "datetime": message.datetime,
                            "sender_email": self.session.execute(
                                select(User.email).where(User.id == message.send_from)
                            ).scalars().one_or_none()
                        } for message in messages
                    ],
                    "ai_messages": [
                        {
                            "send_from": ai_message.send_from,
                            "content": ai_message.content,
                            "datetime": ai_message.datetime,
                            "sender_email": self.session.execute(
                                select(User.email).where(User.id == ai_message.send_from)
                            ).scalars().one_or_none()
                        } for ai_message in ai_messages
                    ],
                    "creator_email": creator.email if creator else None
                }}), 200
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({"error":"Outing does not exist"}), 404

    def update_outing(self, outing_id, update_data):
        outing = self.session.execute(
            select(Outing).where(Outing.id == outing_id)
        ).scalars().one_or_none()

        if outing:
            try:
                if update_data:
                    updated_outing = update(Outing).where(Outing.id == outing_id).values(**update_data)
                    self.session.execute(updated_outing)
                    self.session.commit()
                response = self.get_outing(outing.id)
                return response

            except Exception as e:
                self.session.rollback()
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({"error":"Outing does not exist"}), 404

    def get_outing_friends(self, outing_id):
        outing = self.session.execute(
            select(Outing).where(Outing.id == outing_id)
        ).scalars().one_or_none()

        if outing:
            try:
                friend_list = self.session.execute(
                    select(User.email, User.access_token_changed)
                    .join(FriendList)
                    .where(FriendList.outing_id == outing.id)
                ).all()

                friend_list_overall = [{"email":friend_email, "access_token_from":access_token_from} for (friend_email, access_token_from) in friend_list]
                print(friend_list)

                return jsonify({"friend_list": friend_list_overall}), 200
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({"error":"Outing does not exist"}), 404

    def update_outing_friends(self, outing_id, update_data):
        outing = self.session.execute(
            select(Outing).where(Outing.id == outing_id)
        ).scalars().one_or_none()

        if outing:
            try:
                if update_data:
                    friend_emails = update_data["friend_emails"]
                    creator_email = update_data["creator_email"]
                    creator = self.get_user(creator_email)
                    if creator.id != outing.creator_id:
                        return jsonify({"error":"creator_email does not match"}), 403
                    else:
                        emails = [email for email in friend_emails.values()]

                        previous_friend_list = self.session.execute(
                            select(User.email)
                            .join(FriendList)
                            .where(FriendList.outing_id == outing.id)
                        ).scalars().all()

                        for friend_email in emails:
                            if friend_email not in previous_friend_list:
                                friend = self.get_user(friend_email)
                                if friend and friend.active:
                                    friend_list_entry = FriendList(
                                        outing_id=outing.id,
                                        user_id=friend.id
                                    )
                                    try:
                                        self.insert_friend_list_entry(friend_list_entry)
                                    except Exception as e:
                                        pass
                                else:
                                    print("Friend ", friend, " does not exist")
                return self.get_outing_friends(outing_id)
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({"error": "Outing does not exist"}), 404

    def delete_outing_friends(self, outing_id, update_data):
        outing = self.session.execute(
            select(Outing).where(Outing.id == outing_id)
        ).scalars().one_or_none()

        if outing:
            try:
                if update_data:
                    friend_emails = update_data["friend_emails"]
                    creator_email = update_data["creator_email"]
                    creator = self.get_user(creator_email)
                    if creator.id != outing.creator_id:
                        return jsonify({"error": "creator_email does not match"}), 403
                    else:
                        emails = [email for email in friend_emails.values()]
                        previous_friend_list = self.session.execute(
                            select(User.email)
                            .join(FriendList)
                            .where(FriendList.outing_id == outing.id)
                        ).scalars().all()

                        for friend_email in emails:
                            if friend_email in previous_friend_list and friend_email != creator_email:
                                try:
                                    friend = self.get_user(friend_email)
                                    friend_list_entry = self.session.execute(
                                        select(FriendList)
                                        .where(FriendList.outing_id == outing.id, FriendList.user_id == friend.id)
                                    ).scalars().one_or_none()

                                    messages_to_update = self.session.execute(
                                        select(Message)
                                        .join(Messages)
                                        .where(Messages.outing_id == outing.id, Message.send_from == friend.id)
                                    ).scalars().all()

                                    if friend_list_entry:
                                        self.session.delete(friend_list_entry)
                                        self.session.commit()

                                        for message in messages_to_update:
                                            message.content = "Message deleted!"

                                        try:
                                            self.session.commit()
                                        except Exception as e:
                                            self.session.rollback()
                                    else:
                                        print(f"Friend {friend_email} not found in the outing"), 404
                                except Exception as e:
                                    self.session.rollback()
                                    return jsonify({'error': str(e)}), 500
                            else:
                                print("Friend ", friend_email, " does not exist or is creator of this outing")
                return self.get_outing_friends(outing_id)
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({"error": "Outing does not exist"}), 404

    def get_outing_chat(self, outing_id):
        outing = self.session.execute(
            select(Outing).where(Outing.id == outing_id)
        ).scalars().one_or_none()

        if outing:
            try:
                messages = self.session.execute(
                    select(Message).join(Messages).where(Messages.outing_id == outing.id)
                ).scalars().all()

                messages_data = [
                    {
                        "content": message.content,
                        "datetime": message.datetime,
                        "send_from": self.session.execute(
                            select(User.email).where(User.id == message.send_from)
                        ).scalars().one_or_none(),
                        "user_url": self.session.execute(
                            select(User.user_url).where(User.id == message.send_from)
                        ).scalars().one_or_none()

                    } for message in messages
                ]
                return jsonify({"messages": messages_data}), 200
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({"error": "Outing does not exist"}), 404

    def get_outing_ai_chat(self, outing_id):
        outing = self.session.execute(
            select(Outing).where(Outing.id == outing_id)
        ).scalars().one_or_none()

        if outing:
            try:
                ai_messages = self.session.execute(
                    select(AiMessage).join(AiMessages).where(AiMessages.outing_id == outing.id)
                ).scalars().all()

                ai_messages_data = [
                    {
                        "content": ai_message.content,
                        "datetime": ai_message.datetime,
                        "send_from": self.session.execute(
                            select(User.email).where(User.id == ai_message.send_from)
                        ).scalars().one_or_none(),
                        "user_url": self.session.execute(
                            select(User.user_url).where(User.id == ai_message.send_from)
                        ).scalars().one_or_none(),
                        "response" : ai_message.response

                    } for ai_message in ai_messages
                ]
                return jsonify({"ai_messages": ai_messages_data}), 200
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({"error": "Outing does not exist"}), 404

    def send_message_to_outing(self, outing_id, update_data):
        outing = self.session.execute(
            select(Outing).where(Outing.id == outing_id)
        ).scalars().one_or_none()

        if outing:
            try:
                if update_data:
                    try:
                        send_from_email = update_data["send_from"]
                        content = update_data["content"]

                        user = self.session.execute(
                            select(User).where(User.email == send_from_email)
                        ).scalars().one_or_none()

                        friend_list = self.session.execute(
                            select(User.email)
                            .join(FriendList)
                            .where(FriendList.outing_id == outing.id)
                        ).scalars().all()

                        if not user or not user.active or send_from_email not in friend_list:
                            return jsonify({'error': 'User not found or not active'}), 404

                        message = Message(
                            send_from=user.id,
                            datetime=datetime.utcnow(),
                            content=content
                        )
                        self.session.add(message)
                        self.session.commit()

                        message_connection = Messages(
                            outing_id=outing.id,
                            message_id=message.id
                        )
                        self.session.add(message_connection)
                        self.session.commit()
                    except Exception as e:
                        self.session.rollback()
                        return jsonify({'error': str(e)}), 500
                return self.get_outing_chat(outing_id)
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({"error": "Outing does not exist"}), 404

    def send_ai_message_to_outing(self, outing_id, update_data):
        outing = self.session.execute(
            select(Outing).where(Outing.id == outing_id)
        ).scalars().one_or_none()

        if outing:
            try:
                if update_data:
                    try:
                        send_from_email = update_data["send_from"]
                        location = update_data["location"]
                        outing_topic = update_data["outing_topic"]
                        content_message = f"Find nearby places in {location} related to {outing_topic}."
                        del update_data["send_from"]
                        update_data["latest_location"] = update_data.pop("location")

                        user = self.session.execute(
                            select(User).where(User.email == send_from_email)
                        ).scalars().one_or_none()

                        if not user or not user.active:
                            return jsonify({'error': 'User not found or not active'}), 404
                        if user.id != outing.creator_id:
                            return jsonify({'error': 'Only creator can send message to AI'}), 403

                        ai_message = AiMessage(
                            send_from=user.id,
                            datetime=datetime.utcnow(),
                            content=content_message
                        )
                        self.session.add(ai_message)
                        self.session.commit()

                        ai_message_connection = AiMessages(
                            outing_id=outing.id,
                            ai_message_id=ai_message.id
                        )
                        self.session.add(ai_message_connection)
                        self.session.commit()

                        updated_outing = update(Outing).where(Outing.id == outing_id).values(**update_data)
                        self.session.execute(updated_outing)
                        self.session.commit()

                    except Exception as e:
                        self.session.rollback()
                        return jsonify({'error': str(e)}), 500
                return self.get_ai_response(location, outing_topic, ai_message.id)
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({"error": "Outing does not exist"}), 404

    def get_ai_response(self, location, outing_topic, ai_message_id):
        print("-----------------CREATE AI PIPELINE------------------")
        response_message = "Response from GPT4o"
        response_data = {
            "response" : response_message,
        }
        try:
            updated_ai_message = update(AiMessage).where(AiMessage.id == ai_message_id).values(**response_data)
            self.session.execute(updated_ai_message)
            self.session.commit()

            return jsonify({
                            "dates" : [{"date": "25.08.2024", "time" : {"start" : "17", "finish" : "19"}}],
                            "location" : [f"Skopje Centar"],
                            "response" : response_message,

                        }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def delete_all_messages(self, outing_id):
        try:
            message_connections = self.session.execute(
                select(Messages).where(Messages.outing_id == outing_id)
            ).scalars().all()
            message_ids = [connection.message_id for connection in message_connections]

            self.session.execute(
                delete(Messages).where(Messages.outing_id == outing_id)
            )
            self.session.commit()
            if message_ids:
                self.session.execute(
                    delete(Message).where(Message.id.in_(message_ids))
                )
            self.session.commit()

            ai_message_connections = self.session.execute(
                select(AiMessages).where(AiMessages.outing_id == outing_id)
            ).scalars().all()
            ai_message_ids = [ai_connection.ai_message_id for ai_connection in ai_message_connections]

            self.session.execute(
                delete(AiMessages).where(AiMessages.outing_id == outing_id)
            )
            self.session.commit()
            if ai_message_ids:
                self.session.execute(
                    delete(AiMessage).where(AiMessage.id.in_(ai_message_ids))
                )
            self.session.commit()

            return True

        except Exception as e:
            self.session.rollback()
            return False

    def delete_all_friends_from_outing(self, outing_id):
        try:
            self.session.execute(
                delete(FriendList).where(FriendList.outing_id == outing_id)
            )
            self.session.commit()
            return True
        except Exception as e:
            self.session.rollback()
            return False

    def delete_outing(self, outing_id, update_data):
        outing = self.session.execute(
            select(Outing).where(Outing.id == outing_id)
        ).scalars().one_or_none()

        if outing:
            try:
                creator_email = update_data["creator"]
                creator = self.get_user(creator_email)

                if not creator or not creator.active:
                    return jsonify({"error": "User not found or not active"}), 404

                if creator.id != outing.creator_id:
                    return jsonify({"error": "Only creator can delete the outing"}), 403

                status_delete_messages = self.delete_all_messages(outing.id)
                if not status_delete_messages:
                    return jsonify({"error": "Error deleting messages"}), 500

                status_delete_friends = self.delete_all_friends_from_outing(outing.id)
                if not status_delete_friends:
                    return jsonify({"error": "Error deleting friends"}), 500

                try:
                    self.session.execute(
                        delete(Outing).where(Outing.id == outing_id)
                    )
                    self.session.commit()
                    return jsonify({"message": "Successfully deleted Outing group."}), 200

                except Exception as e:
                    self.session.rollback()
                    return jsonify({"error": str(e)}), 500

            except Exception as e:
                return jsonify({"error": str(e)}), 500
        else:
            return jsonify({"error": "Outing does not exist"}), 404