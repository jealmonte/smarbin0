from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import WasteStatistics
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

@login_required
def statistics_dashboard(request):
    # Get the user's stats
    try:
        stats = request.user.waste_stats.latest('timestamp')
        data = {
            'cardboard': stats.cardboard,
            'food_organics': stats.food_organics,
            'glass': stats.glass,
            'metal': stats.metal,
            'miscellaneous_trash': stats.miscellaneous_trash,
            'paper': stats.paper,
            'timestamp': stats.timestamp
        }
    except WasteStatistics.DoesNotExist:
        data = {
            'cardboard': 0,
            'food_organics': 0,
            'glass': 0,
            'metal': 0,
            'miscellaneous_trash': 0,
            'paper': 0
        }
    
    return JsonResponse(data)

@csrf_exempt
def delete_statistics(request):
    if request.method == 'DELETE':
        user_id = request.GET.get('user_id')
        if not user_id:
            return JsonResponse({'error': 'user_id is required'}, status=400)
        
        try:
            user = User.objects.get(id=user_id)
            stats = WasteStatistics.objects.filter(user=user)
            deleted_count, _ = stats.delete()
            if deleted_count != 1:
                return JsonResponse({'message': f'No statistic records for user ID {user_id}'})
            elif deleted_count == 1:
                return JsonResponse({'message': f'Deleted all statistic records for user ID {user_id}'})
        except User.DoesNotExist:
            return JsonResponse({'error': f'User with ID {user_id} not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def list_users(request):
    if request.method == 'GET':
        from django.contrib.auth.models import User
        users = User.objects.all()
        user_list = [{'id': user.id, 'username': user.username} for user in users]
        return JsonResponse({'users': user_list})
    return JsonResponse({'error': 'Method not allowed'}, status=405)
