from django.utils.deprecation import MiddlewareMixin
from core.models import Organization
import threading

_thread_locals = threading.local()


def get_current_organization():
    return getattr(_thread_locals, 'organization', None)


def set_current_organization(org):
    _thread_locals.organization = org


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to extract organization slug from request headers
    and set it in thread-local storage for tenant isolation
    """

    def process_request(self, request):
        org_slug = request.headers.get('X-Organization-Slug')

        if org_slug:
            try:
                organization = Organization.objects.get(slug=org_slug, is_active=True)
                set_current_organization(organization)
                request.organization = organization
            except Organization.DoesNotExist:
                set_current_organization(None)
                request.organization = None
        else:
            set_current_organization(None)
            request.organization = None

    def process_response(self, request, response):
        set_current_organization(None)
        return response
