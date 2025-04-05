# app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import WasteStatistics, User
from .serializers import WasteStatisticsSerializer, UserSerializer
import subprocess
import sys
import os
import signal
import time
from django.http import JsonResponse

class StartCameraView(APIView):
    def post(self, request):
        supabase_uid = request.data.get('supabase_uid')
        
        if not supabase_uid:
            return Response(
                {"error": "supabase_uid is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get the absolute path to the cameraClassifier.py
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            camera_script = os.path.join(base_dir, '..', 'cameraClassifier.py')
            
            # Start the camera classifier in a subprocess
            process = subprocess.Popen([
                sys.executable, 
                camera_script, 
                '--supabase_uid', 
                supabase_uid
            ])
            
            # Save the process ID to a file
            pid_file = os.path.join(base_dir, '..', 'camera_process.pid')
            with open(pid_file, 'w') as f:
                f.write(str(process.pid))
            
            return Response({"status": "Camera classifier started", "pid": process.pid})
        except Exception as e:
            return Response(
                {"error": f"Failed to start camera: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class StopCameraView(APIView):
    def post(self, request):
        try:
            # Get the PID file path
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            pid_file = os.path.join(base_dir, '..', 'camera_process.pid')
            
            # Check if PID file exists
            if os.path.exists(pid_file):
                with open(pid_file, 'r') as f:
                    pid = int(f.read().strip())
                
                # Try to terminate the process
                try:
                    os.kill(pid, signal.SIGTERM)
                    # Wait a moment and then force kill if still running
                    time.sleep(1)
                    try:
                        os.kill(pid, 0)  # Check if process exists
                        os.kill(pid, signal.SIGKILL)  # Force kill if still running
                    except OSError:
                        pass  # Process already terminated
                    
                    # Remove the PID file
                    os.remove(pid_file)
                    return Response({"status": "Camera stopped successfully"})
                except OSError:
                    # Process already terminated
                    os.remove(pid_file)
                    return Response({"status": "Camera was not running"})
            else:
                return Response({"status": "Camera was not running"})
        except Exception as e:
            return Response(
                {"error": f"Failed to stop camera: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class UserAuthView(APIView):
    def post(self, request):
        supabase_uid = request.data.get('supabase_uid')
        email = request.data.get('email')
        
        if not supabase_uid:
            return Response(
                {"error": "supabase_uid is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create user
        user, created = User.objects.get_or_create(
            supabase_uid=supabase_uid,
            defaults={'email': email}
        )
        
        # If user exists but email changed, update it
        if not created and email and user.email != email:
            user.email = email
            user.save()
        
        # Create waste statistics for new users
        if created:
            WasteStatistics.objects.create(user=user)
        
        return Response(
            {"id": user.id, "supabase_uid": user.supabase_uid, "email": user.email},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
class WasteStatisticsView(APIView):
    def get(self, request):
        supabase_uid = request.query_params.get('supabase_uid')
        
        if not supabase_uid:
            return Response(
                {"error": "supabase_uid query parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(supabase_uid=supabase_uid)
            stats = WasteStatistics.objects.filter(user=user).first()
            
            if not stats:
                stats = WasteStatistics.objects.create(user=user)
                
            return Response(WasteStatisticsSerializer(stats).data)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request):
        supabase_uid = request.data.get('supabase_uid')
        waste_type = request.data.get('waste_type')
        
        if not supabase_uid or not waste_type:
            return Response(
                {"error": "Both supabase_uid and waste_type are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(supabase_uid=supabase_uid)
            stats, created = WasteStatistics.objects.get_or_create(user=user)
            
            # Increment the appropriate waste type
            if hasattr(stats, waste_type):
                setattr(stats, waste_type, getattr(stats, waste_type) + 1)
                stats.save()
                return Response(WasteStatisticsSerializer(stats).data)
            else:
                return Response(
                    {"error": f"Invalid waste type: {waste_type}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
