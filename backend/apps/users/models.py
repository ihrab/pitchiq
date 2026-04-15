import mongoengine as me
from datetime import datetime
import hashlib
import os


class User(me.Document):
    email = me.EmailField(required=True, unique=True)
    name = me.StringField(max_length=200)
    password_hash = me.StringField()
    google_id = me.StringField()
    plan = me.StringField(choices=['free', 'pro', 'enterprise'], default='pro')
    analyses_this_month = me.IntField(default=0)
    stripe_customer_id = me.StringField()
    created_at = me.DateTimeField(default=datetime.utcnow)

    # Required by DRF's IsAuthenticated permission check
    is_authenticated = True
    is_anonymous = False
    is_active = True

    meta = {'collection': 'users', 'indexes': ['email']}

    def set_password(self, raw_password):
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac('sha256', raw_password.encode(), salt, 100000)
        self.password_hash = salt.hex() + ':' + key.hex()

    def check_password(self, raw_password):
        if not self.password_hash:
            return False
        parts = self.password_hash.split(':')
        if len(parts) != 2:
            return False
        salt = bytes.fromhex(parts[0])
        stored_key = parts[1]
        key = hashlib.pbkdf2_hmac('sha256', raw_password.encode(), salt, 100000)
        return key.hex() == stored_key

    def can_submit_analysis(self):
        if self.plan in ('pro', 'enterprise'):
            return True
        return self.analyses_this_month < 3

    def to_dict(self):
        return {
            'id': str(self.pk),
            'email': self.email,
            'name': self.name,
            'plan': self.plan,
            'analyses_this_month': self.analyses_this_month,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
