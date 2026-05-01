from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from tasks.models import Task
from tasks.serializers import TaskSerializer
from core.services.network.driver import FakeNAPALMDriver

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        task = self.get_object()
        if task.status != "pending_approval":
            return Response({"error": "Only pending_approval tasks can be approved"}, status=status.HTTP_400_BAD_REQUEST)
        task.status = "approved"
        task.save()
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=["post"])
    def queue(self, request, pk=None):
        task = self.get_object()
        if task.status != "approved":
            return Response({"error": "Only approved tasks can be queued"}, status=status.HTTP_400_BAD_REQUEST)
        task.status = "queued"
        task.save()
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        task = self.get_object()
        if task.status != "queued":
            return Response({"error": "Only queued tasks can be run"}, status=status.HTTP_400_BAD_REQUEST)

        task.status = "running"
        task.progress = 0
        task.save()

        # Get the previous config content for diff
        previous_config = task.device.configs.filter(version__lt=task.config.version).order_by("-version").first()
        running_config = previous_config.content if previous_config else None

        # Simulate execution
        driver = FakeNAPALMDriver(task.device, running_config=running_config)
        try:
            # Step 1: Open connection
            task.progress = 10
            task.save()
            driver.open()

            # Step 2: Load config
            task.progress = 30
            task.save()
            driver.load_replace_candidate(task.config.content)

            # Step 3: Compare config
            task.progress = 50
            task.save()
            driver.compare_config()

            # Step 4: Commit config
            task.progress = 80
            task.save()
            driver.commit_config()

            task.status = "success"
            task.progress = 100
        except Exception as e:
            driver.add_log(f"Error during execution: {str(e)}")
            task.status = "failed"
        finally:
            driver.close()
            task.logs = driver.get_logs()
            task.save()

        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=["get"])
    def logs(self, request, pk=None):
        task = self.get_object()
        return Response({"logs": task.logs})
