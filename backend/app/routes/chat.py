from fastapi import APIRouter
router=APIRouter()
@router.post("/chat")
def chat():
    return {
      "planner":"ready",
      "coder":"ready",
      "github":"ready",
      "supabase":"ready",
      "vercel":"ready",
      "qa":"ready"
    }
