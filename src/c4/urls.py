from django.urls import include, path
from django.views.generic import TemplateView

from .views import (
    HomeView, GameDetailView, whether_my_move
)

app_name='c4'

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('rules/', TemplateView.as_view(template_name="c4/rules.html"), name='rules'),
    path('game/<int:pk>/', GameDetailView.as_view()),
    path('game/<int:pk>/my_move/', whether_my_move),
    # path('logout', RegisterView.as_view(), name='logout'),
]
