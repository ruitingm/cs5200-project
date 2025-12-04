"""
- POST /login/                  authenticate user (email + password), return profile & account info  
- GET  /profile/{id}/           fetch user profile and account info by account number  
- POST /profile/{id}/update/    update user first/last name, return updated profile  
"""

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


@api_view(['GET'])
def get_profile(request, account_number):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                p.Email,
                p.First_name,
                p.Last_name,
                a.Register_date,
                a.Student_flag,
                a.Admin_flag
            FROM USER_PROFILE p
            JOIN ACCOUNT a ON p.Email = a.Email
            WHERE a.Account_number = %s
        """, [account_number])
        profile = cursor.fetchone()

    if not profile:
        return Response({"success": False, "message": "Profile not found"}, status=404)

    return Response({
        "email": profile[0],
        "firstName": profile[1],
        "lastName": profile[2],
        "registerDate": profile[3],
        "isStudent": profile[4],
        "isAdmin": profile[5],
    })


@api_view(['POST'])
def update_profile(request, account_number):
    first_name = request.data.get("firstName")
    last_name = request.data.get("lastName")

    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE USER_PROFILE
            SET First_name = %s, Last_name = %s
            WHERE Email = (
                SELECT Email FROM ACCOUNT WHERE Account_number = %s
            )
        """, [first_name, last_name, account_number])

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                p.Email,
                p.First_name,
                p.Last_name,
                a.Register_date,
                a.Student_flag,
                a.Admin_flag
            FROM USER_PROFILE p
            JOIN ACCOUNT a ON p.Email = a.Email
            WHERE a.Account_number = %s
        """, [account_number])
        profile = cursor.fetchone()

    if not profile:
        return Response({"success": False, "message": "Profile not found"}, status=404)

    return Response({
        "email": profile[0],
        "firstName": profile[1],
        "lastName": profile[2],
        "registerDate": profile[3],
        "isStudent": profile[4],
        "isAdmin": profile[5],
    })

@api_view(['GET'])
def list_users(request):
    """
    Return list of all users with profile + account info.
    """
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                a.Account_number,
                p.First_name,
                p.Last_name,
                p.Email,
                a.Student_flag,
                a.Admin_flag,
                a.Register_date
            FROM ACCOUNT a
            JOIN USER_PROFILE p ON a.Email = p.Email
            ORDER BY a.Account_number;
        """)
        rows = cursor.fetchall()

    users = []
    for r in rows:
        users.append({
            "accountNumber": r[0],
            "firstName": r[1],
            "lastName": r[2],
            "email": r[3],
            "isStudent": r[4],
            "isAdmin": r[5],
            "registerDate": r[6],
        })

    return Response(users)
