"""
Chatbot Views (NL to SQL)
Convert natural language text into SQL using LLM,
execute the SQL, and return the results.
"""

import openai
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

@api_view(["POST"])
def nl2sql(request):
    question = request.data.get("question")

    if not question:
        return Response({"error": "question required"}, status=400)

    # 1. ask OpenAI
    sql = "SELECT * FROM user_profile LIMIT 1"  # dummy placeholder
    # 你可以填自己的 key 和 prompt

    # 2. execute generated SQL
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()
    except Exception as e:
        return Response({"sql": sql, "error": str(e)})

    return Response({"sql": sql, "result": result})
