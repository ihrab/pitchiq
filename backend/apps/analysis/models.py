import mongoengine as me
from datetime import datetime
from apps.ideas.models import Idea


class ScoreDimension(me.EmbeddedDocument):
    dimension = me.StringField(choices=[
        'market_size', 'differentiation', 'revenue_potential',
        'competition', 'execution_risk', 'timing'
    ])
    score = me.FloatField()
    justification = me.StringField()


class SWOT(me.EmbeddedDocument):
    strengths = me.ListField(me.StringField())
    weaknesses = me.ListField(me.StringField())
    opportunities = me.ListField(me.StringField())
    threats = me.ListField(me.StringField())


class Competitor(me.EmbeddedDocument):
    name = me.StringField()
    type = me.StringField(choices=['direct', 'indirect'])
    scope = me.StringField(choices=['local', 'global'])
    hottest_product = me.StringField()
    funding_stage = me.StringField()
    differentiation = me.StringField()


class Persona(me.EmbeddedDocument):
    name = me.StringField()
    age = me.IntField()
    role = me.StringField()
    pain_point = me.StringField()
    willingness_to_pay = me.StringField()


class Analysis(me.Document):
    idea = me.ReferenceField(Idea, required=True)
    status = me.StringField(
        choices=['pending', 'processing', 'complete', 'failed'],
        default='pending'
    )
    overall_score = me.FloatField()
    verdict = me.StringField(choices=['Promising', 'Needs work', 'Strong', 'Risky'])
    scores = me.EmbeddedDocumentListField(ScoreDimension)
    swot = me.EmbeddedDocumentField(SWOT)
    competitors = me.EmbeddedDocumentListField(Competitor)
    personas = me.EmbeddedDocumentListField(Persona)
    pivot_suggestions = me.ListField(me.StringField())
    pdf_url = me.StringField()
    pptx_url = me.StringField()
    completed_at = me.DateTimeField()

    meta = {'collection': 'analyses', 'indexes': ['idea']}

    def to_dict(self, full=False):
        d = {
            'id': str(self.pk),
            'idea_id': str(self.idea.pk) if self.idea else None,
            'status': self.status,
            'overall_score': self.overall_score,
            'verdict': self.verdict,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }
        if full:
            d['scores'] = [
                {
                    'dimension': s.dimension,
                    'score': s.score,
                    'justification': s.justification,
                } for s in (self.scores or [])
            ]
            if self.swot:
                d['swot'] = {
                    'strengths': list(self.swot.strengths or []),
                    'weaknesses': list(self.swot.weaknesses or []),
                    'opportunities': list(self.swot.opportunities or []),
                    'threats': list(self.swot.threats or []),
                }
            d['competitors'] = [
                {
                    'name': c.name,
                    'type': c.type,
                    'scope': c.scope,
                    'hottest_product': c.hottest_product,
                    'funding_stage': c.funding_stage,
                    'differentiation': c.differentiation,
                } for c in (self.competitors or [])
            ]
            d['personas'] = [
                {
                    'name': p.name,
                    'age': p.age,
                    'role': p.role,
                    'pain_point': p.pain_point,
                    'willingness_to_pay': p.willingness_to_pay,
                } for p in (self.personas or [])
            ]
            d['pivot_suggestions'] = list(self.pivot_suggestions or [])
            d['pdf_url'] = self.pdf_url
            d['pptx_url'] = self.pptx_url
        return d


class QAMessage(me.Document):
    analysis = me.ReferenceField(Analysis, required=True)
    role = me.StringField(choices=['user', 'assistant'], required=True)
    content = me.StringField(required=True)
    sent_at = me.DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'qa_messages', 'indexes': ['analysis']}

    def to_dict(self):
        return {
            'id': str(self.pk),
            'role': self.role,
            'content': self.content,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
        }
