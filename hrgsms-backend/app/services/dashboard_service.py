from typing import Dict
from ..database.queries import call_proc

def get_dashboard_stats() -> Dict:
    """Get dashboard statistics including check-ins, check-outs, occupancy, and revenue."""
    try:
        result = call_proc("sp_get_dashboard_stats", ())
        if result and len(result) > 0:
            stats = result[0]
            return {
                "today_checkins": stats["today_checkins"],
                "today_checkouts": stats["today_checkouts"],
                "total_rooms": stats["total_rooms"],
                "occupied_rooms": stats["occupied_rooms"],
                "occupancy_percentage": float(stats["occupancy_percentage"]),
                "today_revenue": float(stats["today_revenue"])
            }
        return {
            "today_checkins": 0,
            "today_checkouts": 0,
            "total_rooms": 0,
            "occupied_rooms": 0,
            "occupancy_percentage": 0.0,
            "today_revenue": 0.0
        }
    except Exception as e:
        print(f"Error getting dashboard stats: {e}")
        return {
            "today_checkins": 0,
            "today_checkouts": 0,
            "total_rooms": 0,
            "occupied_rooms": 0,
            "occupancy_percentage": 0.0,
            "today_revenue": 0.0
        }