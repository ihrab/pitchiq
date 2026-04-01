from django.urls import path
from . import views
from .stripe_views import CreateCheckoutSessionView, StripeWebhookView

urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('login/', views.LoginView.as_view()),
    path('token/refresh/', views.TokenRefreshView.as_view()),
    path('google/', views.GoogleLoginView.as_view()),
    path('me/', views.MeView.as_view()),
    path('stripe/create-checkout-session/', CreateCheckoutSessionView.as_view()),
    path('stripe/webhook/', StripeWebhookView.as_view()),
]
