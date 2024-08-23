from sqlalchemy import Column, String, Integer, \
                        Boolean, DateTime, ForeignKey, \
                        Text
from sqlalchemy.orm import relationship, backref
from extensions import Base, Session
from tidb_vector.sqlalchemy import VectorType

from datetime import datetime
import uuid

class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    display_name = Column(String(120), nullable=False)
    access_token = Column(String(512), nullable=True)
    access_token_changed = Column(DateTime, nullable=False, default=datetime.utcnow)
    user_url = Column(String(255), nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    def __str__(self):
        return f"User(profile={self.user_url}, email={self.email}, display_name={self.display_name})"
    def to_dict(self):
        return {
            'user_url': self.user_url,
            "display_name": self.display_name,
            'email': self.email,
        }
    @classmethod
    def get_all(cls):
        with Session() as session:
            return session.query(cls).all()
    @classmethod
    def get_by_id(cls, user_id):
        with Session() as session:
            return session.query(cls).get(user_id)
    def save(self):
        with Session() as session:
            session.add(self)
            session.commit()

class Outing(Base):
    __tablename__ = 'outing'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(120), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    latest_location = Column(String(240), nullable=True)
    outing_topic = Column(String(120), nullable=True)
    creator_id = Column(Integer, ForeignKey('user.id'), nullable=False)

    creator = relationship('User', backref=backref('outing', lazy=True))

    def __str__(self):
        return f'<Outing {self.name}> is created from user with id: {self.creator_id} at {self.created_at}'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at,
            'latest_location': self.latest_location,
            'outing_topic': self.outing_topic,
            'creator_id': self.creator_id
        }
    @classmethod
    def get_all(cls):
        with Session() as session:
            return session.query(cls).all()
    @classmethod
    def get_by_id(cls, outing_id):
        with Session() as session:
            return session.query(cls).get(outing_id)
    def save(self):
        with Session() as session:
            session.add(self)
            session.commit()

class FriendList(Base):
    __tablename__ = 'friend_list'

    id = Column(Integer, primary_key=True)
    outing_id = Column(String(36), ForeignKey('outing.id'))
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)

    outing = relationship('Outing', backref=backref('friend_list', lazy=True))
    user = relationship('User', backref=backref('friend_list', lazy=True))

    def __str__(self):
        return f'<User {self.user_id} added in new friend list with outing id: {self.outing_id}>'

    def to_dict(self):
        return {
            'friendship' : self.id,
            'outing_id': self.outing_id,
            'user_id': self.user_id
        }
    @classmethod
    def get_all(cls):
        with Session() as session:
            return session.query(cls).all()
    @classmethod
    def get_by_outing_id(cls, outing_id):
        with Session() as session:
            return session.query(cls).filter_by(outing_id=outing_id).first()
    def save(self):
        with Session() as session:
            session.add(self)
            session.commit()

class Message(Base):
    __tablename__ = 'message'

    id = Column(Integer, primary_key=True)
    send_from = Column(Integer, ForeignKey('user.id'), nullable=False)
    datetime = Column(DateTime, nullable=False, default=datetime.utcnow)
    content = Column(Text, nullable=False)

    sender = relationship('User', backref=backref('message', lazy=True))

    def __str__(self):
        return f'<Message {self.id}, Send From {self.send_from} at {self.datetime}>'

    def to_dict(self):
        return {
            'send_from': self.send_from,
            'datetime': self.datetime,
            'content': self.content
        }
    @classmethod
    def get_all(cls):
        with Session() as session:
            return session.query(cls).all()
    @classmethod
    def get_by_id(cls, message_id):
        with Session() as session:
            return session.query(cls).get(message_id)
    def save(self):
        with Session() as session:
            session.add(self)
            session.commit()

class AiMessage(Base):
    __tablename__ = 'ai_message'

    id = Column(Integer, primary_key=True)
    send_from = Column(Integer, ForeignKey('user.id'), nullable=True)
    datetime = Column(DateTime, nullable=False, default=datetime.utcnow)
    content = Column(Text, nullable=False)
    response = Column(Text, nullable=True, default="Waiting for response.........")

    sender = relationship('User', backref=backref('ai_message', lazy=True))

    def __str__(self):
        return f'<AiMessage {self.id}, Send From {self.send_from}>'

    def to_dict(self):
        return {
            'send_from': self.send_from,
            'datetime': self.datetime,
            'content': self.content
        }
    @classmethod
    def get_all(cls):
        with Session() as session:
            return session.query(cls).all()
    @classmethod
    def get_by_id(cls, ai_message_id):
        with Session() as session:
            return session.query(cls).get(ai_message_id)
    def save(self):
        with Session() as session:
            session.add(self)
            session.commit()

class Messages(Base):
    __tablename__ = 'messages'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    outing_id = Column(String(36), ForeignKey('outing.id'))
    message_id = Column(Integer, ForeignKey('message.id'), nullable=False)

    outing = relationship('Outing', backref=backref('messages', lazy=True))
    message = relationship('Message', backref=backref('messages', lazy=True))
    def __str__(self):
        return f'<Messages Group for outing with outing_id={self.outing_id}, message_id={self.message_id}>'
    def to_dict(self):
        return {
            'outing_id': self.outing_id,
            'message_id': self.message_id
        }
    @classmethod
    def get_all(cls):
        with Session() as session:
            return session.query(cls).all()
    @classmethod
    def get_by_message_id(cls, message_id):
        with Session() as session:
            return session.query(cls).filter_by(message_id=message_id).first()
    def save(self):
        with Session() as session:
            session.add(self)
            session.commit()

class AiMessages(Base):
    __tablename__ = 'ai_messages'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    outing_id = Column(String(36), ForeignKey('outing.id'))
    ai_message_id = Column(Integer, ForeignKey('ai_message.id'), nullable=False)

    outing = relationship('Outing', backref=backref('ai_messages', lazy=True))
    ai_message = relationship('AiMessage', backref=backref('ai_messages', lazy=True))

    def __str__(self):
        return f'<AiMessages Group outing_id={self.outing_id}, ai_message_id={self.ai_message_id}>'

    def to_dict(self):
        return {
            'outing_id': self.outing_id,
            'ai_message_id': self.ai_message_id
        }
    @classmethod
    def get_all(cls):
        with Session() as session:
            return session.query(cls).all()
    @classmethod
    def get_by_ai_message_id(cls, ai_message_id):
        with Session() as session:
            return session.query(cls).filter_by(ai_message_id=ai_message_id).first()
    def save(self):
        with Session() as session:
            session.add(self)
            session.commit()

class Magazines(Base):
    __tablename__ = 'info_sites'
    id = Column(Integer, primary_key=True)
    content = Column(Text)
    embedding = Column(VectorType(3))

class MagazinesWithIndex(Base):
    __tablename__ = 'info_sites_with_index'
    id = Column(Integer, primary_key=True)
    content = Column(Text)
    embedding = Column(VectorType(3), comment="hnsw(distance=cosine)")