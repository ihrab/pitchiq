from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import stripe
import json

from .models import User

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateCheckoutSessionView(APIView):
    def post(self, request):
        plan = request.data.get('plan', 'pro')
        price_id = (
            settings.STRIPE_ENTERPRISE_PRICE_ID
            if plan == 'enterprise'
            else settings.STRIPE_PRO_PRICE_ID
        )

        try:
            customer_id = request.user.stripe_customer_id
            if not customer_id:
                customer = stripe.Customer.create(email=request.user.email)
                request.user.stripe_customer_id = customer.id
                request.user.save()
                customer_id = customer.id

            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card'],
                line_items=[{'price': price_id, 'quantity': 1}],
                mode='subscription',
                success_url='http://localhost:5173/dashboard?upgraded=true',
                cancel_url='http://localhost:5173/pricing',
                metadata={'user_id': str(request.user.pk), 'plan': plan},
            )
            return Response({'url': session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response({'error': 'Invalid signature.'}, status=400)

        if event['type'] in ('customer.subscription.created', 'customer.subscription.updated'):
            sub = event['data']['object']
            customer_id = sub['customer']
            plan_name = 'pro'
            for item in sub.get('items', {}).get('data', []):
                if item['price']['id'] == settings.STRIPE_ENTERPRISE_PRICE_ID:
                    plan_name = 'enterprise'
                    break
            user = User.objects(stripe_customer_id=customer_id).first()
            if user:
                user.plan = plan_name
                user.save()

        elif event['type'] == 'customer.subscription.deleted':
            sub = event['data']['object']
            customer_id = sub['customer']
            user = User.objects(stripe_customer_id=customer_id).first()
            if user:
                user.plan = 'free'
                user.save()

        return Response({'status': 'ok'})
