from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from tasks.models import Task
from tasks.serializers import TaskSerializer
from core.services.napalm_service import NapalmSimulator

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
        task.save()

        # Simulate execution
        simulator = NapalmSimulator(task.device)
        try:
            simulator.connect()
            simulator.load_replace_candidate(task.config.content)
            simulator.commit_config()
            task.status = "success"
        except Exception as e:
            simulator.add_log(f"Error: {str(e)}")
            task.status = "failed"
        finally:
            simulator.close()
            task.logs = simulator.get_logs()
            task.save()

        return Response(TaskSerializer(task).data)
