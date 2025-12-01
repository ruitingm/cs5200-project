"""
Submission Views
Returns all submissions for a given user.
"""

from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection

from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def list_submissions(request, account_number):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT Submission_ID, Problem_ID, Is_correct, Time_start, Time_end
            FROM SUBMISSION
            WHERE Account_number = %s
        """, [account_number])

        rows = cursor.fetchall()

    return JsonResponse([
        {
            "submission_id": r[0],
            "problem_id": r[1],
            "is_correct": r[2],
            "time_start": r[3],
            "time_end": r[4],
        } for r in rows
    ], safe=False)
