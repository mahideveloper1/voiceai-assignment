from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from django.db import connection
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt
from core.schema import schema


def health_check(request):
    """
    Health check endpoint for Railway and monitoring.
    Returns HTTP 200 if the application is healthy.
    """
    try:
        # Check database connection
        connection.ensure_connection()
        return JsonResponse(
            {"status": "healthy", "database": "connected", "service": "voiceai-backend"}
        )
    except Exception as e:
        return JsonResponse(
            {"status": "unhealthy", "database": "disconnected", "error": str(e)},
            status=503,
        )


urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True, schema=schema))),
    path('health/', health_check, name='health_check'),
]
