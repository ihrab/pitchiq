from django.core.management.base import BaseCommand
from apps.users.models import User


class Command(BaseCommand):
    help = 'Upgrade all existing users to Pro plan'

    def handle(self, *args, **options):
        users = User.objects.all()
        count = 0
        for user in users:
            user.plan = 'pro'
            user.save()
            count += 1
        self.stdout.write(f'SUCCESS: {count} users upgraded to Pro')
