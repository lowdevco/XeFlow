
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import m2m_changed


@receiver(m2m_changed, sender=User.groups.through)
def update_user_permissions(sender, instance, action, **kwargs):

    if action in ['post_add', 'post_remove', 'post_clear']:

        groups = instance.groups.all()

        instance.is_superuser = groups.filter(
            profile__is_superuser=True
        ).exists()

        instance.is_staff = groups.filter(
            profile__is_staff=True
        ).exists()

        instance.save()
