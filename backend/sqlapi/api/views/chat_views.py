"""
Chatbot Views (NL to SQL)
Convert natural language text into SQL using LLM,
execute the SQL, and return the results.
"""

import openai
import re
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from datetime import datetime
import os

# Set OpenAI API key from environment
openai.api_key = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_API_KEY_HERE")

# Database schema context for LLM
DATABASE_SCHEMA = """
Database Schema for SQL Study Room:

Tables:
1. PROBLEM (Problem_ID, Problem_description, Tag_ID)
2. TAG (Tag_ID, Difficulty_ID, Concept_ID)
3. DIFFICULTY_TAG (Difficulty_ID, Difficulty_level) - values: Easy, Medium, Hard
4. CONCEPT_TAG (Concept_ID, SQL_concept) - values: SELECT, JOIN, GROUP BY, etc.
5. SUBMISSION (Submission_ID, Problem_ID, Account_number, Submission_description, Is_correct, Time_start, Time_end)
6. ACCOUNT (Account_number, Username, Password, Email)
7. USER_PROFILE (Account_number, First_name, Last_name, Is_admin)
8. ATTEMPT (Attempt_ID, Problem_ID, Account_number, Attempt_time)
9. QUERY (Query_ID, Account_number, Query_text, Query_time)

Common queries:
- Find problems by difficulty: JOIN PROBLEM with TAG and DIFFICULTY_TAG
- Find problems by concept: JOIN PROBLEM with TAG and CONCEPT_TAG
- User submissions: JOIN SUBMISSION with ACCOUNT and USER_PROFILE
- Problem statistics: COUNT submissions, attempts per problem
"""

def is_safe_sql(sql):
    """Check if SQL is safe (only SELECT statements)"""
    sql_clean = sql.strip().upper()
    # Remove comments and extra whitespace
    sql_clean = re.sub(r'--.*', '', sql_clean)
    sql_clean = re.sub(r'/\*.*?\*/', '', sql_clean, flags=re.DOTALL)
    sql_clean = ' '.join(sql_clean.split())
    
    # Only allow SELECT statements
    if not sql_clean.startswith('SELECT'):
        return False
    
    # Block dangerous keywords
    dangerous_keywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE']
    for keyword in dangerous_keywords:
        if keyword in sql_clean:
            return False
    
    return True

def save_query_to_db(account_number, query_text):
    """Save query to QUERY table"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO QUERY (Account_number, Query_text, Query_time)
                VALUES (%s, %s, %s)
            """, [account_number, query_text, datetime.now()])
    except Exception as e:
        print(f"Failed to save query: {e}")

@api_view(["POST"])
def nl2sql(request):
    question = request.data.get("question")
    account_number = request.data.get("account_number", 1)  # Default for testing

    if not question:
        return Response({"error": "question required"}, status=400)

    try:
        # 1. Call OpenAI API
        client = openai.OpenAI(api_key=openai.api_key)
        
        prompt = f"""
{DATABASE_SCHEMA}

Convert this natural language question to a SQL SELECT query:
"{question}"

Rules:
- Only generate SELECT statements
- Use proper table JOINs when needed
- Return only the SQL query, no explanations
- Limit results to 50 rows maximum

SQL Query:
"""
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a SQL expert. Generate only valid SELECT SQL queries."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.1
        )
        
        sql = response.choices[0].message.content.strip()
        
        # Clean up the SQL (remove markdown formatting if present)
        sql = re.sub(r'```sql\s*', '', sql)
        sql = re.sub(r'```\s*', '', sql)
        sql = sql.strip()
        
        # 2. Validate SQL safety
        if not is_safe_sql(sql):
            return Response({
                "sql": sql,
                "results": [],
                "error": "Generated query is not safe. Only SELECT statements are allowed."
            }, status=400)
        
        # 3. Execute SQL
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                
                # Convert to list of dictionaries
                results = []
                for row in rows:
                    results.append(dict(zip(columns, row)))
                
                # 4. Save query to database
                save_query_to_db(account_number, sql)
                
                return Response({
                    "sql": sql,
                    "results": results,
                    "error": None,
                    "row_count": len(results)
                })
                
        except Exception as db_error:
            return Response({
                "sql": sql,
                "results": [],
                "error": f"Database error: {str(db_error)}"
            }, status=400)
            
    except Exception as openai_error:
        return Response({
            "sql": "",
            "results": [],
            "error": f"OpenAI API error: {str(openai_error)}"
        }, status=500)