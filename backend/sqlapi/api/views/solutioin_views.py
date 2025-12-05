import json
from django.db import connection
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def get_solution(request, pId):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT Solution_ID, Problem_ID, Solution_Description FROM SOLUTION WHERE Problem_ID = %s", [pId])
            row = cursor.fetchone()
            if row:
                return Response({
                    'sId': row[0],
                    'pId': row[1],
                    'sDescription': row[2],
                    'success': True
                })
            else:
                return Response({
                    'error': 'Solution not found',
                    'success': False
                })
    except Exception as e:
        return Response({
            'error': str(e),
            'success': False
        })

@api_view(['POST'])
def add_solution(request):
    data = json.loads(request.body)
    pId = data.get('pId')
    sDescription = data.get('sDescription')
    if not pId or not sDescription:
        return Response({
            'error': 'Missing required fields',
            'success': False
        }, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO SOLUTION (Problem_ID, Solution_Description) VALUES (%s, %s)", [pId, sDescription])
            return Response({
                'success': True
            })
    except Exception as e:
        return Response({
            'error': str(e),
            'success': False
        })

@api_view(['PUT'])
def update_solution(request, pid):
    data = json.loads(request.body)
    sDescription = data.get('sDescription')
    if not sDescription:
        return Response({
            'error': 'Missing required fields',
            'success': False
        }, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE SOLUTION SET Solution_Description = %s WHERE Problem_ID = %s", [sDescription, pid])
            return Response({
                'success': True
            })
    except Exception as e:
        return Response({
            'error': str(e),
            'success': False
        })