from django.db import models
from core.middleware.tenant import get_current_organization


class TenantManager(models.Manager):
    """
    Custom manager that automatically filters querysets by current organization
    """

    def get_queryset(self):
        queryset = super().get_queryset()
        organization = get_current_organization()

        if organization and hasattr(self.model, 'organization'):
            return queryset.filter(organization=organization)

        return queryset
