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