import mongoengine as me
from datetime import datetime
from apps.users.models import User


class Idea(me.Document):
    user = me.ReferenceField(User, required=True)
    title = me.StringField(max_length=200, required=True)
    pitch_text = me.StringField(max_length=600, required=True)
    sector = me.StringField(required=True)
    business_model = me.StringField(
        choices=['subscription', 'marketplace', 'one-time', 'freemium'],
        required=True
    )
    include_local_competitors = me.BooleanField(default=False)
    include_global_competitors = me.BooleanField(default=True)
    generate_pitch_deck = me.BooleanField(default=False)
    export_pdf = me.BooleanField(default=False)
    submitted_at = me.DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'ideas', 'indexes': ['user', '-submitted_at']}

    def to_dict(self):
        return {
            'id': str(self.pk),
            'title': self.title,
            'pitch_text': self.pitch_text,
            'sector': self.sector,
            'business_model': self.business_model,
            'include_local_competitors': self.include_local_competitors,
            'include_global_competitors': self.include_global_competitors,
            'generate_pitch_deck': self.generate_pitch_deck,
            'export_pdf': self.export_pdf,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
        }
