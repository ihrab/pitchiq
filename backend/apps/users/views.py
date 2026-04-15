from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings
from datetime import datetime, timedelta
import jwt
import requests as http_requests

from .models import User


def generate_tokens(user):
    access_payload = {
        'user_id': str(user.pk),
        'exp': datetime.utcnow() + timedelta(hours=24),
        'type': 'access',
    }
    refresh_payload = {
        'user_id': str(user.pk),
        'exp': datetime.utcnow() + timedelta(days=30),
        'type': 'refresh',
    }
    access = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')
    return access, refresh


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        name = request.data.get('name', '').strip()

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=400)
        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=400)
        if User.objects(email=email).first():
            return Response({'error': 'An account with this email already exists.'}, status=400)

        user = User(email=email, name=name, plan='pro')
        user.set_password(password)
        user.save()

        access, refresh = generate_tokens(user)
        return Response({
            'access': access,
            'refresh': refresh,
            'user': user.to_dict(),
        }, status=201)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        user = User.objects(email=email).first()
        if not user or not user.check_password(password):
            return Response({'error': 'Invalid email or password.'}, status=401)

        access, refresh = generate_tokens(user)
        return Response({
            'access': access,
            'refresh': refresh,
            'user': user.to_dict(),
        })


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh', '')
        if not refresh_token:
            return Response({'error': 'Refresh token required.'}, status=400)
        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=['HS256'])
            if payload.get('type') != 'refresh':
                return Response({'error': 'Invalid token type.'}, status=400)
            user = User.objects(pk=payload['user_id']).first()
            if not user:
                return Response({'error': 'User not found.'}, status=404)
            access, refresh = generate_tokens(user)
            return Response({'access': access, 'refresh': refresh})
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Refresh token expired.'}, status=401)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid token.'}, status=401)


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token', '')
        if not token:
            return Response({'error': 'Google token required.'}, status=400)

        resp = http_requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {token}'}
        )
        if resp.status_code != 200:
            return Response({'error': 'Invalid Google token.'}, status=401)

        info = resp.json()
        email = info.get('email', '').lower()
        google_id = info.get('sub', '')
        name = info.get('name', '')

        user = User.objects(email=email).first()
        if not user:
            user = User(email=email, name=name, google_id=google_id)
            user.save()
        elif not user.google_id:
            user.google_id = google_id
            user.save()

        access, refresh = generate_tokens(user)
        return Response({
            'access': access,
            'refresh': refresh,
            'user': user.to_dict(),
        })


class MeView(APIView):
    def get(self, request):
        return Response(request.user.to_dict())

    def patch(self, request):
        user = request.user
        if 'name' in request.data:
            user.name = request.data['name'].strip()
        if 'email' in request.data:
            new_email = request.data['email'].strip().lower()
            if new_email != user.email and User.objects(email=new_email).first():
                return Response({'error': 'Email already in use.'}, status=400)
            user.email = new_email
        if 'password' in request.data:
            if len(request.data['password']) < 8:
                return Response({'error': 'Password must be at least 8 characters.'}, status=400)
            user.set_password(request.data['password'])
        user.save()
        return Response(user.to_dict())

    def delete(self, request):
        request.user.delete()
        return Response(status=204)
