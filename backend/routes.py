# routes.py
from flask import Blueprint, jsonify, request

from url_handler import MySQLHandler
from extensions import Session
from datetime import datetime

from models import Outing, FriendList
db = MySQLHandler(session=Session())

def users_blueprint():
    main_routes = Blueprint('main_routes', __name__, url_prefix='/api')

    @main_routes.route('/add-user', methods=['POST'])
    def add_user():
        data = request.json
        email = data.get('email')
        display_name = data.get('name')
        access_token = data.get('access_token')
        user_url = data.get('user_url', "")

        if not email or not display_name:
            return jsonify({"error": "Email and display name are required"}), 400

        try:
            response = db.add_user(email, display_name, access_token, user_url)
            return response
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @main_routes.route('/me', methods=['DELETE', 'POST'])
    def me():
        email = request.json.get('email')
        if not email:
            return jsonify({'error': 'Email is required'}), 400

        if request.method == 'POST':
            display_name = request.json.get('display_name')
            access_token = request.json.get('access_token')
            user_url = request.json.get('user_url')
            active = request.json.get('active')

            update_data = {}
            if display_name:
                update_data['display_name'] = display_name
            if user_url:
                update_data['user_url'] = user_url
            if access_token:
                update_data['access_token'] = access_token
                update_data['access_token_changed'] = datetime.utcnow()
            if active:
                update_data['active'] = active

            try:
                response = db.update_user(email, update_data)
                return response
            except Exception as e:
                return jsonify({"error": str(e)}), 500

        elif request.method == 'DELETE':
            try:
                if db.delete_user(email):
                    return jsonify({'message': 'User deleted'}), 200
                else:
                    return jsonify({'error': 'User not found'}), 404
            except Exception as e:
                return jsonify({'error': str(e)}), 500
    @main_routes.route('/add-outing', methods=['POST'])
    def add_outing():
        if request.method == 'POST':
            try:
                name = request.json.get('name')
                latest_location = None
                outing_topic = None
                user_email = request.json.get('email')
                friend_emails = request.json.get('friend_emails')

                emails = [value for value in friend_emails.values()]
                emails.append(user_email)

                user = db.get_user(user_email)
                if not user or not user.active:
                    return jsonify({'error': 'User not found or inactive'}), 404

                existing_outing = db.find_existing_outing(name, user.id)
                if existing_outing:
                    return jsonify({'error': 'Outing already exists'}), 400

                outing = Outing(
                    name=name,
                    created_at=datetime.utcnow(),
                    latest_location=latest_location,
                    outing_topic=outing_topic,
                    creator_id=user.id
                )

                db.insert_outing(outing)

                for friend_email in emails:
                    friend = db.get_user(friend_email)
                    if friend and friend.active:
                        friend_list_entry = FriendList(
                            outing_id=outing.id,
                            user_id=friend.id
                        )
                        try:
                            db.insert_friend_list_entry(friend_list_entry)
                        except Exception as e:
                            pass

                return jsonify({'outing': outing.to_dict()}), 201

            except Exception as e:
                return jsonify({'error': str(e)}), 500

    @main_routes.route('/get-outings', methods=['POST'])
    def get_all_outings():
        if request.method == 'POST':
            email = request.json.get('email')
            if not email:
                return jsonify({'error': 'Email is required'}), 400

            user = db.get_user(email)
            if not user or not user.active:
                return jsonify({'error': 'User not found or inactive'}), 404

            response = db.get_friend_outings(user.id)
            return response

    @main_routes.route('/get-outings/<outing_id>', methods=['GET', 'POST', 'DELETE'])
    def get_outing(outing_id):
        if request.method == 'GET':
            response = db.get_outing(outing_id)
            return response

        elif request.method == 'POST':
            latest_location = request.json.get('location')
            outing_topic = request.json.get('outing_topic')
            name = request.json.get('name')

            update_data = {}
            if latest_location:
                update_data['latest_location'] = latest_location
            if outing_topic:
                update_data['outing_topic'] = outing_topic
            if name:
                update_data['name'] = name

            try:
                response = db.update_outing(outing_id, update_data)
                return response
            except Exception as e:
                return jsonify({"error": str(e)}), 500

        elif request.method == 'DELETE':
            try:
                creator = request.json.get('creator')

                update_data = {}
                if creator:
                    update_data['creator'] = creator

                response = db.delete_outing(outing_id, update_data)
                return response
            except Exception as e:
                return jsonify({"error": str(e)}), 500

    @main_routes.route('/get-outings/<outing_id>/get-friends', methods=['GET'])
    def get_outing_friends(outing_id):
        if request.method == 'GET':
            try:
                response = db.get_outing_friends(outing_id)
                return response
            except Exception as e:
                return jsonify({"error": str(e)}), 500
    @main_routes.route('/get-outings/<outing_id>/add-friend', methods=['POST'])
    def update_friend_list(outing_id):
        if request.method == 'POST':
            try:
                friend_emails = request.json.get('friend_emails')
                creator = request.json.get('creator')

                update_data = {}
                if creator and friend_emails:
                    update_data['creator_email'] = creator
                    update_data['friend_emails'] = friend_emails

                    response = db.update_outing_friends(outing_id, update_data)
                    return response
                else:
                    return jsonify({'error': 'FRIENDS or CREATOR not provided'}), 400
            except Exception as e:
                return jsonify({"error": str(e)}), 500

    @main_routes.route('/get-outings/<outing_id>/delete-friend', methods=['DELETE'])
    def delete_friends(outing_id):
        if request.method == 'DELETE':
            try:
                friend_emails = request.json.get('friend_emails')
                creator = request.json.get('creator')

                update_data = {}
                if creator and friend_emails:
                    update_data['creator_email'] = creator
                    update_data['friend_emails'] = friend_emails

                    response = db.delete_outing_friends(outing_id, update_data)
                    return response
                else:
                    return jsonify({'error': 'FRIENDS and CREATOR are not provided'}), 400
            except Exception as e:
                return jsonify({"error": str(e)}), 500

    @main_routes.route('/get-outings/<outing_id>/chat', methods=['GET'])
    def get_chat(outing_id):
        if request.method == 'GET':
            try:
                response = db.get_outing_chat(outing_id)
                return response
            except Exception as e:
                return jsonify({"error": str(e)}), 500

    @main_routes.route('/get-outings/<outing_id>/ai-chat', methods=['GET'])
    def get_ai_chat(outing_id):
        if request.method == 'GET':
            try:
                response = db.get_outing_ai_chat(outing_id)
                return response
            except Exception as e:
                return jsonify({"error": str(e)}), 500

    @main_routes.route('/get-outings/<outing_id>/chat/send', methods=['POST'])
    def send_message(outing_id):
        if request.method == 'POST':
            try:
                send_from = request.json.get('send_from')
                content = request.json.get('content')

                update_data = {}
                if send_from and content:
                    update_data['send_from'] = send_from
                    update_data['content'] = content

                    response = db.send_message_to_outing(outing_id, update_data)
                    return response
                else:
                    return jsonify({'error': 'SEND_FROM and CONTENT are not provided'}), 400
            except Exception as e:
                return jsonify({"error": str(e)}), 500

    @main_routes.route('/get-outings/<outing_id>/ai-chat/send', methods=['POST'])
    def send_ai_message(outing_id):
        if request.method == 'POST':
            try:
                send_from = request.json.get('send_from')
                location = request.json.get('location')
                outing_topic = request.json.get('outing_topic')

                update_data = {}
                if send_from and location and outing_topic:
                    update_data['send_from'] = send_from
                    update_data['location'] = location
                    update_data['outing_topic'] = outing_topic

                    response = db.send_ai_message_to_outing(outing_id, update_data)
                    return response
                else:
                    return jsonify({'error': 'SEND_FROM, LOCATION or OUTING TOPIC are not provided'}), 400
            except Exception as e:
                return jsonify({"error": str(e)}), 500

    return main_routes
