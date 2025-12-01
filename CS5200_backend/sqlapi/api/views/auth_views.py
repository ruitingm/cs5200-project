from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection

@api_view(['POST'])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"success": False, "message": "Missing email or password"})

    # Step 1: verify credentials
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT Email FROM USER_AUTH 
            WHERE Email=%s AND Password=%s
        """, [email, password])
        user = cursor.fetchone()

    if not user:
        return Response({"success": False, "message": "Invalid email or password"})

    # Step 2: fetch profile + account info
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                p.First_name,
                p.Last_name,
                a.Account_number,
                a.Student_flag,
                a.Admin_flag
            FROM USER_PROFILE p
            JOIN ACCOUNT a ON p.Email = a.Email
            WHERE p.Email=%s
        """, [email])
        profile = cursor.fetchone()

    return Response({
        "success": True,
        "email": email,
        "firstName": profile[0],
        "lastName": profile[1],
        "accountNumber": profile[2],
        "isStudent": profile[3],
        "isAdmin": profile[4],
    })
