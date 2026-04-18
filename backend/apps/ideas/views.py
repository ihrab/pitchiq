import threading
import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

from .models import Idea
from apps.analysis.models import Analysis
from apps.users.models import User


def run_analysis_async(idea_id, analysis_id):
    print(f"\n[ANALYSIS THREAD] Starting — idea={idea_id} analysis={analysis_id}")

    try:
        from utils.claude import analyse_idea
        from apps.ideas.models import Idea
        from apps.analysis.models import Analysis, ScoreDimension, SWOT, Competitor, Persona

        idea = Idea.objects(pk=idea_id).first()
        analysis = Analysis.objects(pk=analysis_id).first()
        if not idea or not analysis:
            print(f"[ANALYSIS THREAD] ERROR: idea or analysis not found in DB")
            return

        print(f"[ANALYSIS THREAD] Loaded idea: '{idea.title}'")
        analysis.status = 'processing'
        analysis.save()

        print(f"[ANALYSIS THREAD] Calling Claude API...")
        data = analyse_idea(idea)
        print(f"[ANALYSIS THREAD] Claude responded — score={data.get('overall_score')} verdict={data.get('verdict')}")

        analysis.overall_score = data.get('overall_score')
        analysis.verdict = data.get('verdict')

        scores = []
        for s in data.get('scores', []):
            scores.append(ScoreDimension(
                dimension=s.get('dimension'),
                score=s.get('score'),
                justification=s.get('justification'),
            ))
        analysis.scores = scores

        swot_data = data.get('swot', {})
        analysis.swot = SWOT(
            strengths=swot_data.get('strengths', []),
            weaknesses=swot_data.get('weaknesses', []),
            opportunities=swot_data.get('opportunities', []),
            threats=swot_data.get('threats', []),
        )

        competitors = []
        for c in data.get('competitors', []):
            competitors.append(Competitor(
                name=c.get('name'),
                type=c.get('type'),
                scope=c.get('scope'),
                hottest_product=c.get('hottest_product'),
                funding_stage=c.get('funding_stage'),
                differentiation=c.get('differentiation'),
            ))
        analysis.competitors = competitors

        personas = []
        for p in data.get('personas', []):
            personas.append(Persona(
                name=p.get('name'),
                age=p.get('age'),
                role=p.get('role'),
                pain_point=p.get('pain_point'),
                willingness_to_pay=p.get('willingness_to_pay'),
            ))
        analysis.personas = personas

        analysis.pivot_suggestions = data.get('pivot_suggestions', [])
        analysis.status = 'complete'
        analysis.completed_at = datetime.utcnow()
        analysis.save()
        print(f"[ANALYSIS THREAD] Saved — status=complete")

        # Increment monthly counter for free users
        user = idea.user
        if user.plan == 'free':
            User.objects(pk=user.pk).update_one(inc__analyses_this_month=1)

    except Exception as e:
        print(f"\n[ANALYSIS THREAD] EXCEPTION: {type(e).__name__}: {e}")
        traceback.print_exc()
        try:
            analysis = Analysis.objects(pk=analysis_id).first()
            if analysis:
                analysis.status = 'failed'
                analysis.save()
                print(f"[ANALYSIS THREAD] Marked analysis as failed")
        except Exception as inner:
            print(f"[ANALYSIS THREAD] Could not mark analysis as failed: {inner}")


class IdeaListCreateView(APIView):
    def get(self, request):
        ideas = Idea.objects(user=request.user).order_by('-submitted_at')
        result = []
        for idea in ideas:
            analysis = Analysis.objects(idea=idea).first()
            d = idea.to_dict()
            if analysis:
                d['analysis'] = {
                    'id': str(analysis.pk),
                    'status': analysis.status,
                    'overall_score': analysis.overall_score,
                    'verdict': analysis.verdict,
                }
            else:
                d['analysis'] = None
            result.append(d)
        return Response(result)

    def post(self, request):
        user = request.user

        if not user.can_submit_analysis():
            return Response({
                'error': 'upgrade_required',
                'feature': 'monthly_analyses',
                'message': 'You have reached your 3 free analyses this month. Upgrade to Pro for unlimited analyses.'
            }, status=403)

        title = request.data.get('title', '').strip()
        pitch_text = request.data.get('pitch_text', '').strip()
        sector = request.data.get('sector', '').strip()
        business_model = request.data.get('business_model', '').strip()

        if not all([title, pitch_text, sector, business_model]):
            return Response({'error': 'title, pitch_text, sector, and business_model are required.'}, status=400)

        if len(pitch_text) > 600:
            return Response({'error': 'pitch_text must be 600 characters or less.'}, status=400)

        include_local = request.data.get('include_local_competitors', False)
        include_global = request.data.get('include_global_competitors', True)
        generate_deck = request.data.get('generate_pitch_deck', False)
        export_pdf = request.data.get('export_pdf', False)

        if generate_deck and user.plan == 'free':
            return Response({'error': 'upgrade_required', 'feature': 'pitch_deck'}, status=403)
        if export_pdf and user.plan == 'free':
            return Response({'error': 'upgrade_required', 'feature': 'pdf_export'}, status=403)

        idea = Idea(
            user=user,
            title=title,
            pitch_text=pitch_text,
            sector=sector,
            business_model=business_model,
            include_local_competitors=include_local if user.plan != 'free' else False,
            include_global_competitors=include_global,
            generate_pitch_deck=generate_deck,
            export_pdf=export_pdf,
        )
        idea.save()

        analysis = Analysis(idea=idea, status='pending')
        analysis.save()

        thread = threading.Thread(
            target=run_analysis_async,
            args=(str(idea.pk), str(analysis.pk)),
            daemon=True,
        )
        thread.start()

        return Response({
            'idea': idea.to_dict(),
            'analysis_id': str(analysis.pk),
        }, status=201)
