import threading
import traceback
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Analysis, QAMessage
from apps.ideas.models import Idea


class AnalysisDetailView(APIView):
    def get(self, request, analysis_id):
        analysis = Analysis.objects(pk=analysis_id).first()
        if not analysis:
            return Response({'error': 'Analysis not found.'}, status=404)

        idea = analysis.idea
        if str(idea.user.pk) != str(request.user.pk):
            return Response({'error': 'Forbidden.'}, status=403)

        data = analysis.to_dict(full=True)
        data['idea'] = idea.to_dict()
        return Response(data)


class AnalysisStatusView(APIView):
    def get(self, request, analysis_id):
        analysis = Analysis.objects(pk=analysis_id).first()
        if not analysis:
            return Response({'error': 'Analysis not found.'}, status=404)

        idea = analysis.idea
        if str(idea.user.pk) != str(request.user.pk):
            return Response({'error': 'Forbidden.'}, status=403)

        return Response({
            'status': analysis.status,
            'overall_score': analysis.overall_score,
            'verdict': analysis.verdict,
        })


class QAChatView(APIView):
    def get(self, request, analysis_id):
        analysis = Analysis.objects(pk=analysis_id).first()
        if not analysis:
            return Response({'error': 'Analysis not found.'}, status=404)
        if str(analysis.idea.user.pk) != str(request.user.pk):
            return Response({'error': 'Forbidden.'}, status=403)

        messages = QAMessage.objects(analysis=analysis).order_by('sent_at')
        return Response([m.to_dict() for m in messages])

    def post(self, request, analysis_id):
        from utils.claude import chat_with_analysis

        analysis = Analysis.objects(pk=analysis_id).first()
        if not analysis:
            return Response({'error': 'Analysis not found.'}, status=404)
        if str(analysis.idea.user.pk) != str(request.user.pk):
            return Response({'error': 'Forbidden.'}, status=403)
        if analysis.status != 'complete':
            return Response({'error': 'Analysis is not complete yet.'}, status=400)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message content required.'}, status=400)

        # Check free plan Q&A limit
        if request.user.plan == 'free':
            existing_count = QAMessage.objects(analysis=analysis).count()
            if existing_count >= 5:
                return Response({
                    'error': 'upgrade_required',
                    'feature': 'qa_messages',
                    'message': 'Free plan is limited to 5 Q&A messages per analysis.'
                }, status=403)

        user_msg = QAMessage(analysis=analysis, role='user', content=content)
        user_msg.save()

        all_messages = QAMessage.objects(analysis=analysis).order_by('sent_at')
        chat_history = [{'role': m.role, 'content': m.content} for m in all_messages]

        try:
            reply = chat_with_analysis(analysis, chat_history)
        except Exception as e:
            return Response({'error': f'AI error: {str(e)}'}, status=500)

        assistant_msg = QAMessage(analysis=analysis, role='assistant', content=reply)
        assistant_msg.save()

        return Response({
            'user_message': user_msg.to_dict(),
            'assistant_message': assistant_msg.to_dict(),
        })


class ExportPDFView(APIView):
    def get(self, request, analysis_id):
        try:
            analysis = Analysis.objects(pk=analysis_id).first()
            if not analysis:
                return Response({'error': 'Analysis not found.'}, status=404)
            if str(analysis.idea.user.pk) != str(request.user.pk):
                return Response({'error': 'Forbidden.'}, status=403)
            if analysis.status != 'complete':
                return Response({'error': 'Analysis not complete.'}, status=400)

            from utils.pdf_export import generate_pdf
            buffer = generate_pdf(analysis)
            filename = f"pitchiq-{analysis.idea.title}-report.pdf".replace(' ', '-')
            response = HttpResponse(buffer.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            return response
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)


class ExportPPTXView(APIView):
    def get(self, request, analysis_id):
        try:
            analysis = Analysis.objects(pk=analysis_id).first()
            if not analysis:
                return Response({'error': 'Analysis not found.'}, status=404)
            if str(analysis.idea.user.pk) != str(request.user.pk):
                return Response({'error': 'Forbidden.'}, status=403)
            if analysis.status != 'complete':
                return Response({'error': 'Analysis not complete.'}, status=400)

            from utils.pptx_export import generate_pptx
            buffer = generate_pptx(analysis)
            filename = f"pitchiq-{analysis.idea.title}-deck.pptx".replace(' ', '-')
            response = HttpResponse(
                buffer.read(),
                content_type='application/vnd.openxmlformats-officedocument.presentationml.presentation'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            return response
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
