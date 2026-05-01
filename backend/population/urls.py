from django.urls import path

from .views import SimulationView

urlpatterns = [
    path('simulate/', SimulationView.as_view(), name='simulate-population'),
]
